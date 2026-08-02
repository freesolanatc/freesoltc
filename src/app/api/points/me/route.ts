import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { walletPoints, taskClaims, referrals } from "@/lib/db/schema";
import { solanaAddressSchema } from "@/lib/security/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Points system is not configured yet." }, { status: 503 });
  }

  const walletParam = request.nextUrl.searchParams.get("wallet") ?? "";
  const parsed = solanaAddressSchema.safeParse(walletParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }
  const wallet = parsed.data;

  const [pointsRow, claims, referralCountRow] = await Promise.all([
    db.select({ points: walletPoints.points }).from(walletPoints).where(eq(walletPoints.address, wallet)).limit(1),
    db.select({ task: taskClaims.task }).from(taskClaims).where(eq(taskClaims.walletAddress, wallet)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerAddress, wallet), eq(referrals.credited, true))),
  ]);

  return NextResponse.json({
    points: pointsRow[0]?.points ?? 0,
    claimedTasks: claims.map((c) => c.task),
    referralCount: Number(referralCountRow[0]?.count ?? 0),
  });
}
