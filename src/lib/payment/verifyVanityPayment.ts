import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";
import { siteConfig } from "@/lib/site-config";

const RECENCY_WINDOW_MS = 15 * 60 * 1000;

export interface VerifyVanityPaymentParams {
  connection: Connection;
  signature: string;
  payerPublicKey: string;
}

export type VerifyVanityPaymentResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Independently re-derives payment validity from on-chain data. Never trusts client-supplied
 * amounts — fetches the transaction itself and checks the actual SystemProgram.transfer.
 */
export async function verifyVanityPayment({
  connection,
  signature,
  payerPublicKey,
}: VerifyVanityPaymentParams): Promise<VerifyVanityPaymentResult> {
  let tx: ParsedTransactionWithMeta | null;
  try {
    tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return { ok: false, reason: "Unable to fetch transaction from the network." };
  }

  if (!tx) return { ok: false, reason: "Transaction not found or not yet confirmed." };
  if (tx.meta?.err) return { ok: false, reason: "Transaction failed on-chain." };

  if (tx.blockTime) {
    const ageMs = Date.now() - tx.blockTime * 1000;
    if (ageMs > RECENCY_WINDOW_MS) {
      return { ok: false, reason: "Payment is too old to verify. Please pay again." };
    }
  }

  const requiredLamports = Math.round(siteConfig.vanityFeeSol * LAMPORTS_PER_SOL);
  const adminWallet = siteConfig.adminWalletAddress;

  const instructions = tx.transaction.message.instructions;
  const transferFound = instructions.some((ix) => {
    if (!("parsed" in ix) || ix.program !== "system") return false;
    const parsed = ix.parsed as { type?: string; info?: Record<string, unknown> };
    if (parsed.type !== "transfer") return false;
    const info = parsed.info ?? {};
    const source = info.source as string | undefined;
    const destination = info.destination as string | undefined;
    const lamports = info.lamports as number | undefined;
    return (
      source === payerPublicKey &&
      destination === adminWallet &&
      typeof lamports === "number" &&
      lamports >= requiredLamports
    );
  });

  if (!transferFound) {
    return {
      ok: false,
      reason: `No matching ${siteConfig.vanityFeeSol} SOL transfer to the admin wallet was found in this transaction.`,
    };
  }

  return { ok: true };
}

export function buildVanityFeeTransferParams(payer: string) {
  return {
    fromPubkey: new PublicKey(payer),
    toPubkey: new PublicKey(siteConfig.adminWalletAddress),
    lamports: Math.round(siteConfig.vanityFeeSol * LAMPORTS_PER_SOL),
  };
}
