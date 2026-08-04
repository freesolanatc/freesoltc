import bs58 from "bs58";
import type { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import type { TaskType } from "@/lib/points/tasks";
import { buildBatchClaimMessage } from "@/lib/security/walletSignature";

interface SigningWallet {
  publicKey: PublicKey | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

const TASK_LABELS: Record<TaskType, string> = {
  follow_x: "Follow X",
  join_telegram: "Join Telegram",
  create_token: "Create a Token",
  revoke_mint_authority: "Revoke Mint Authority",
  revoke_freeze_authority: "Revoke Freeze Authority",
  claim_vanity_address: "Claim Custom Address",
};

async function signAndClaim(
  wallet: SigningWallet,
  task: TaskType,
  txSignature?: string
): Promise<Response | null> {
  if (!wallet.publicKey || !wallet.signMessage) return null;
  const walletAddress = wallet.publicKey.toBase58();
  const message = `Free Solana Token Creator: claim "${task}" points for wallet ${walletAddress}`;
  const signed = await wallet.signMessage(new TextEncoder().encode(message));
  const signature = bs58.encode(signed);

  return fetch("/api/points/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet: walletAddress, task, signature, txSignature }),
  });
}

/** Fire-and-forget: tries each candidate signature until the on-chain check succeeds (or the
 *  task turns out to already be claimed). Used right after a create/revoke/vanity flow
 *  confirms, so completing the action anywhere on the site silently earns airdrop points. */
export async function claimOnChainTask(
  wallet: SigningWallet,
  task: TaskType,
  candidateSignatures: string[]
): Promise<void> {
  if (!wallet.publicKey || !wallet.signMessage) return;
  for (const txSignature of candidateSignatures) {
    try {
      const res = await signAndClaim(wallet, task, txSignature);
      if (!res) return;
      if (res.status === 409) return; // already claimed, nothing to do
      if (res.ok) {
        toast.success(`+${(await res.json()).pointsAwarded} airdrop points — ${TASK_LABELS[task]}`);
        return;
      }
    } catch {
      // try the next candidate signature
    }
  }
}

/** One or more on-chain tasks finishing in the same flow (e.g. create + revoke mint + revoke
 *  freeze + vanity claim all completing together) are claimed with a single wallet signature
 *  instead of one signMessage prompt per task. Fire-and-forget, same as claimOnChainTask. */
export async function claimOnChainTasksBatch(
  wallet: SigningWallet,
  claims: { task: TaskType; candidateSignatures: string[] }[]
): Promise<void> {
  if (!wallet.publicKey || !wallet.signMessage || claims.length === 0) return;
  const walletAddress = wallet.publicKey.toBase58();

  try {
    const message = buildBatchClaimMessage({ tasks: claims.map((c) => c.task), wallet: walletAddress });
    const signed = await wallet.signMessage(new TextEncoder().encode(message));
    const signature = bs58.encode(signed);

    const res = await fetch("/api/points/claim-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        signature,
        tasks: claims.map((c) => ({ task: c.task, candidateSignatures: c.candidateSignatures })),
      }),
    });
    if (!res.ok) return;

    const data = (await res.json()) as {
      results: { claimed: boolean; task: TaskType; pointsAwarded?: number }[];
    };
    for (const result of data.results) {
      if (result.claimed && result.pointsAwarded) {
        toast.success(`+${result.pointsAwarded} airdrop points — ${TASK_LABELS[result.task]}`);
      }
    }
  } catch {
    // best-effort; ignore
  }
}

/** Self-reported social task claim, triggered directly by a user action (button click), so
 *  errors are surfaced instead of swallowed. */
export async function claimSocialTask(
  wallet: SigningWallet,
  task: Extract<TaskType, "follow_x" | "join_telegram">
): Promise<{ pointsAwarded: number; totalPoints: number }> {
  if (!wallet.publicKey) throw new Error("Connect your wallet first.");
  if (!wallet.signMessage) {
    throw new Error("Your wallet does not support message signing.");
  }
  const res = await signAndClaim(wallet, task);
  if (!res) throw new Error("Connect your wallet first.");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to claim points.");
  }
  return res.json();
}
