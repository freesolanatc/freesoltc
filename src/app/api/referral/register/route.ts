import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { referrals } from "@/lib/db/schema";
import { rateLimitReferralRegister } from "@/lib/security/rateLimit";
import { solanaAddressSchema } from "@/lib/security/validation";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

const bodySchema = z.object({
  wallet: solanaAddressSchema,
  referrer: solanaAddressSchema,
});

export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Referral system is not configured yet." }, { status: 503 });
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimitReferralRegister(`ip:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { wallet, referrer } = parsed.data;

  if (wallet === referrer) {
    return NextResponse.json({ error: "You cannot refer yourself." }, { status: 400 });
  }

  const inserted = await db
    .insert(referrals)
    .values({ referredAddress: wallet, referrerAddress: referrer })
    .onConflictDoNothing({ target: referrals.referredAddress })
    .returning({ referredAddress: referrals.referredAddress });

  return NextResponse.json({ registered: inserted.length > 0 });
}
