import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { buildBatchClaimMessage, verifyWalletSignature } from "@/lib/security/walletSignature";
import { claimTaskServerSide, type ClaimTaskResult } from "@/lib/points/claimTask";
import { rateLimitPointsClaim } from "@/lib/security/rateLimit";
import { solanaAddressSchema } from "@/lib/security/validation";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

const taskEnum = z.enum([
  "follow_x",
  "join_telegram",
  "create_token",
  "revoke_mint_authority",
  "revoke_freeze_authority",
  "claim_vanity_address",
]);

const bodySchema = z.object({
  wallet: solanaAddressSchema,
  signature: z.string().trim().min(32).max(200),
  tasks: z
    .array(
      z.object({
        task: taskEnum,
        candidateSignatures: z.array(z.string().trim().min(32).max(128)).max(5).default([]),
      })
    )
    .min(1)
    .max(10),
});

/**
 * One wallet signature authorizes claiming several tasks at once (e.g. create_token +
 * revoke_mint_authority + revoke_freeze_authority + claim_vanity_address all finishing in the
 * same token-creation flow), instead of the wallet prompting once per task. Each task's on-chain
 * evidence is still independently verified server-side — the shared signature only proves wallet
 * ownership, exactly like the single-task /api/points/claim route.
 */
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
  const { wallet, signature, tasks } = parsed.data;

  const limit = await rateLimitPointsClaim(`${ip}:${wallet}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const message = buildBatchClaimMessage({ tasks: tasks.map((t) => t.task), wallet });
  if (!verifyWalletSignature({ walletAddress: wallet, message, signature })) {
    return NextResponse.json({ error: "Invalid wallet signature." }, { status: 401 });
  }

  const results: ClaimTaskResult[] = [];
  for (const { task, candidateSignatures } of tasks) {
    const signaturesToTry = candidateSignatures.length > 0 ? candidateSignatures : [undefined];
    let lastResult: ClaimTaskResult | null = null;
    for (const txSignature of signaturesToTry) {
      lastResult = await claimTaskServerSide({ db, wallet, task, txSignature });
      if (lastResult.claimed || lastResult.reason === "You've already claimed this task.") break;
    }
    if (lastResult) results.push(lastResult);
  }

  return NextResponse.json({ results });
}
