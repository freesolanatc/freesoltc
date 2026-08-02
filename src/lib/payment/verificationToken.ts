import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/lib/env";

const TOKEN_TTL_SECONDS = 20 * 60;

function getSecretKey() {
  const secret = serverEnv.PAYMENT_VERIFICATION_SECRET;
  if (!secret) {
    throw new Error("PAYMENT_VERIFICATION_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function issueVanityPaymentToken(params: {
  signature: string;
  payerPublicKey: string;
}): Promise<string> {
  return new SignJWT({ signature: params.signature, payerPublicKey: params.payerPublicKey })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyVanityPaymentToken(
  token: string
): Promise<{ signature: string; payerPublicKey: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.signature !== "string" || typeof payload.payerPublicKey !== "string") {
      return null;
    }
    return { signature: payload.signature, payerPublicKey: payload.payerPublicKey };
  } catch {
    return null;
  }
}
