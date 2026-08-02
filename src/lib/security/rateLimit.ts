import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

const redis =
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: serverEnv.UPSTASH_REDIS_REST_URL,
        token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Dev-only fallback so the app still runs locally without Redis configured. Not safe for
 *  multi-instance production use — Vercel deployments must set UPSTASH_REDIS_REST_* env vars. */
class InMemoryStore {
  private hits = new Map<string, { count: number; resetAt: number }>();

  async limit(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt < now) {
      this.hits.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: max - 1 };
    }
    entry.count += 1;
    const success = entry.count <= max;
    return { success, remaining: Math.max(0, max - entry.count) };
  }

  async has(key: string) {
    return this.hits.has(key);
  }
}

const memoryStore = new InMemoryStore();

function buildLimiter(requests: number, windowSeconds: number) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
  });
}

const verifyPaymentLimiter = buildLimiter(5, 60);
const contactLimiter = buildLimiter(3, 60);
const pointsClaimLimiter = buildLimiter(10, 60);
const referralRegisterLimiter = buildLimiter(5, 60);
const uploadMetadataLimiter = buildLimiter(10, 60);

export async function rateLimitVerifyPayment(identifier: string) {
  if (verifyPaymentLimiter) return verifyPaymentLimiter.limit(identifier);
  return memoryStore.limit(`verify-payment:${identifier}`, 5, 60_000);
}

export async function rateLimitContact(identifier: string) {
  if (contactLimiter) return contactLimiter.limit(identifier);
  return memoryStore.limit(`contact:${identifier}`, 3, 60_000);
}

export async function rateLimitPointsClaim(identifier: string) {
  if (pointsClaimLimiter) return pointsClaimLimiter.limit(identifier);
  return memoryStore.limit(`points-claim:${identifier}`, 10, 60_000);
}

export async function rateLimitReferralRegister(identifier: string) {
  if (referralRegisterLimiter) return referralRegisterLimiter.limit(identifier);
  return memoryStore.limit(`referral-register:${identifier}`, 5, 60_000);
}

export async function rateLimitUploadMetadata(identifier: string) {
  if (uploadMetadataLimiter) return uploadMetadataLimiter.limit(identifier);
  return memoryStore.limit(`upload-metadata:${identifier}`, 10, 60_000);
}

const PAYMENT_REPLAY_TTL_SECONDS = 20 * 60;

/** Returns true and marks the signature as used if it hasn't been redeemed before (replay protection). */
export async function claimPaymentSignature(signature: string): Promise<boolean> {
  const key = `vanity:used:${signature}`;
  if (redis) {
    const result = await redis.set(key, "1", { nx: true, ex: PAYMENT_REPLAY_TTL_SECONDS });
    return result === "OK";
  }
  const alreadyUsed = await memoryStore.has(key);
  if (alreadyUsed) return false;
  await memoryStore.limit(key, 1, PAYMENT_REPLAY_TTL_SECONDS * 1000);
  return true;
}
