import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { taskClaims, walletPoints, referrals } from "@/lib/db/schema";
import { TASK_POINTS, REFERRAL_POINTS, ON_CHAIN_TASKS, type TaskType } from "@/lib/points/tasks";
import { buildClaimMessage, verifyWalletSignature } from "@/lib/security/walletSignature";
import { verifyOnChainTask } from "@/lib/points/verifyOnChainTask";
import { getConnection } from "@/lib/solana/connection";
import { rateLimitPointsClaim } from "@/lib/security/rateLimit";
import { solanaAddressSchema } from "@/lib/security/validation";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

const ON_CHAIN_TASK_SET = new Set<TaskType>(ON_CHAIN_TASKS);

const bodySchema = z.object({
  wallet: solanaAddressSchema,
  task: z.enum([
    "follow_x",
    "join_telegram",
    "create_token",
    "revoke_mint_authority",
    "revoke_freeze_authority",
    "claim_vanity_address",
  ]),
  signature: z.string().trim().min(32).max(200),
  txSignature: z.string().trim().min(32).max(128).optional(),
});

export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Points system is not configured yet." }, { status: 503 });
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }
  const { wallet, task, signature, txSignature } = parsed.data;

  const limit = await rateLimitPointsClaim(`${ip}:${wallet}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const message = buildClaimMessage({ task, wallet });
  if (!verifyWalletSignature({ walletAddress: wallet, message, signature })) {
    return NextResponse.json({ error: "Invalid wallet signature." }, { status: 401 });
  }

  if (ON_CHAIN_TASK_SET.has(task)) {
    if (!txSignature) {
      return NextResponse.json(
        { error: "A transaction signature is required for this task." },
        { status: 400 }
      );
    }
    const result = await verifyOnChainTask({
      connection: getConnection(),
      task,
      wallet,
      txSignature,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 402 });
    }
  }

  const inserted = await db
    .insert(taskClaims)
    .values({ walletAddress: wallet, task, txSignature: txSignature ?? null })
    .onConflictDoNothing({ target: [taskClaims.walletAddress, taskClaims.task] })
    .returning({ id: taskClaims.id });

  if (inserted.length === 0) {
    return NextResponse.json({ error: "You've already claimed this task." }, { status: 409 });
  }

  const points = TASK_POINTS[task];

  await db
    .insert(walletPoints)
    .values({ address: wallet, points })
    .onConflictDoUpdate({
      target: walletPoints.address,
      set: { points: sql`${walletPoints.points} + ${points}`, updatedAt: new Date() },
    });

  const claimCountRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(taskClaims)
    .where(eq(taskClaims.walletAddress, wallet));
  const isFirstClaim = Number(claimCountRows[0]?.count ?? 0) === 1;

  if (isFirstClaim) {
    const pendingReferral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredAddress, wallet))
      .limit(1);
    const ref = pendingReferral[0];
    if (ref && !ref.credited) {
      await db.update(referrals).set({ credited: true }).where(eq(referrals.referredAddress, wallet));
      await db
        .insert(walletPoints)
        .values({ address: ref.referrerAddress, points: REFERRAL_POINTS })
        .onConflictDoUpdate({
          target: walletPoints.address,
          set: { points: sql`${walletPoints.points} + ${REFERRAL_POINTS}`, updatedAt: new Date() },
        });
    }
  }

  const totalRow = await db
    .select({ points: walletPoints.points })
    .from(walletPoints)
    .where(eq(walletPoints.address, wallet))
    .limit(1);

  return NextResponse.json({
    claimed: true,
    task,
    pointsAwarded: points,
    totalPoints: totalRow[0]?.points ?? points,
  });
}
