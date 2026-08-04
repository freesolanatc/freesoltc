import { sql, eq } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { taskClaims, walletPoints, referrals } from "@/lib/db/schema";
import { TASK_POINTS, REFERRAL_POINTS, ON_CHAIN_TASKS, type TaskType } from "@/lib/points/tasks";
import { verifyOnChainTask } from "@/lib/points/verifyOnChainTask";
import { getConnection } from "@/lib/solana/connection";

const ON_CHAIN_TASK_SET = new Set<TaskType>(ON_CHAIN_TASKS);

export type ClaimTaskResult =
  | { claimed: true; task: TaskType; pointsAwarded: number; totalPoints: number }
  | { claimed: false; task: TaskType; reason: string };

/** Verifies on-chain evidence (if required) and records a single task claim — the wallet
 *  signature itself must already be verified by the caller before this runs. Shared by the
 *  single-task and batch claim routes so both stay in sync on scoring/referral behavior. */
export async function claimTaskServerSide(params: {
  db: NonNullable<ReturnType<typeof getDb>>;
  wallet: string;
  task: TaskType;
  txSignature?: string;
}): Promise<ClaimTaskResult> {
  const { db, wallet, task, txSignature } = params;

  if (ON_CHAIN_TASK_SET.has(task)) {
    if (!txSignature) {
      return { claimed: false, task, reason: "A transaction signature is required for this task." };
    }
    const result = await verifyOnChainTask({ connection: getConnection(), task, wallet, txSignature });
    if (!result.ok) {
      return { claimed: false, task, reason: result.reason };
    }
  }

  const inserted = await db
    .insert(taskClaims)
    .values({ walletAddress: wallet, task, txSignature: txSignature ?? null })
    .onConflictDoNothing({ target: [taskClaims.walletAddress, taskClaims.task] })
    .returning({ id: taskClaims.id });

  if (inserted.length === 0) {
    return { claimed: false, task, reason: "You've already claimed this task." };
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

  return {
    claimed: true,
    task,
    pointsAwarded: points,
    totalPoints: totalRow[0]?.points ?? points,
  };
}
