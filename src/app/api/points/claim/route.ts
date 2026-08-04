import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { buildClaimMessage, verifyWalletSignature } from "@/lib/security/walletSignature";
import { claimTaskServerSide } from "@/lib/points/claimTask";
import { rateLimitPointsClaim } from "@/lib/security/rateLimit";
import { solanaAddressSchema } from "@/lib/security/validation";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

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

  const result = await claimTaskServerSide({ db, wallet, task, txSignature });
  if (!result.claimed) {
    const status = result.reason === "You've already claimed this task." ? 409 : 402;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({
    claimed: true,
    task: result.task,
    pointsAwarded: result.pointsAwarded,
    totalPoints: result.totalPoints,
  });
}
