import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/solana/connection";
import { verifyVanityPayment } from "@/lib/payment/verifyVanityPayment";
import { issueVanityPaymentToken } from "@/lib/payment/verificationToken";
import { claimPaymentSignature, rateLimitVerifyPayment } from "@/lib/security/rateLimit";
import { verifyPaymentRequestSchema } from "@/lib/security/validation";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

  const parsed = verifyPaymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }
  const { signature, payerPublicKey } = parsed.data;

  const ipLimit = await rateLimitVerifyPayment(`ip:${ip}`);
  const walletLimit = await rateLimitVerifyPayment(`wallet:${payerPublicKey}`);
  if (!ipLimit.success || !walletLimit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const isFirstClaim = await claimPaymentSignature(signature);
  if (!isFirstClaim) {
    return NextResponse.json(
      { error: "This payment has already been used to unlock a vanity address search." },
      { status: 409 }
    );
  }

  const result = await verifyVanityPayment({
    connection: getConnection(),
    signature,
    payerPublicKey,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 402 });
  }

  const token = await issueVanityPaymentToken({ signature, payerPublicKey });
  return NextResponse.json({ verified: true, token });
}
