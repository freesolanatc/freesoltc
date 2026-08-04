import nacl from "tweetnacl";
import bs58 from "bs58";
import { siteConfig } from "@/lib/site-config";
import type { TaskType } from "@/lib/points/tasks";

/** Message a wallet must sign to prove ownership when claiming points — no funds move, no
 *  transaction is broadcast. Embedding the task + wallet prevents replaying one task's
 *  signature against another. */
export function buildClaimMessage(params: { task: TaskType; wallet: string }): string {
  return `${siteConfig.name}: claim "${params.task}" points for wallet ${params.wallet}`;
}

/** One signature covering several tasks at once (e.g. create + both revokes + vanity claim
 *  all finishing in the same flow), so the wallet only prompts once instead of once per task.
 *  Tasks are sorted so client and server always build the identical message regardless of the
 *  order the caller happened to list them in. */
export function buildBatchClaimMessage(params: { tasks: TaskType[]; wallet: string }): string {
  const sortedTasks = [...params.tasks].sort();
  return `${siteConfig.name}: claim points for wallet ${params.wallet} for tasks [${sortedTasks.join(",")}]`;
}

export function verifyWalletSignature(params: {
  walletAddress: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const publicKeyBytes = bs58.decode(params.walletAddress);
    const signatureBytes = bs58.decode(params.signature);
    const messageBytes = new TextEncoder().encode(params.message);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}
