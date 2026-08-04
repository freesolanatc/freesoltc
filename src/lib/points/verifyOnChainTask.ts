import type { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";
import { verifyVanityPayment } from "@/lib/payment/verifyVanityPayment";
import type { TaskType } from "@/lib/points/tasks";

export type VerifyTaskResult = { ok: true } | { ok: false; reason: string };

async function fetchTx(
  connection: Connection,
  signature: string
): Promise<ParsedTransactionWithMeta | null> {
  try {
    return await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return null;
  }
}

/**
 * Independently re-derives, from on-chain data, whether a given transaction actually performed
 * the claimed task for the claimed wallet. Never trusts the client's word for it — mirrors
 * verifyVanityPayment's "fetch and check ourselves" approach.
 */
export async function verifyOnChainTask(params: {
  connection: Connection;
  task: TaskType;
  wallet: string;
  txSignature: string;
}): Promise<VerifyTaskResult> {
  const { connection, task, wallet, txSignature } = params;

  if (task === "claim_vanity_address") {
    return verifyVanityPayment({ connection, signature: txSignature, payerPublicKey: wallet });
  }

  const tx = await fetchTx(connection, txSignature);
  if (!tx) return { ok: false, reason: "Transaction not found or not yet confirmed." };
  if (tx.meta?.err) return { ok: false, reason: "Transaction failed on-chain." };

  const signers = tx.transaction.message.accountKeys
    .filter((key) => key.signer)
    .map((key) => key.pubkey.toBase58());
  if (!signers.includes(wallet)) {
    return { ok: false, reason: "This transaction was not signed by the connected wallet." };
  }

  const instructions = tx.transaction.message.instructions;

  if (task === "create_token") {
    const found = instructions.some((ix) => {
      if (!("parsed" in ix) || ix.program !== "spl-token") return false;
      const parsed = ix.parsed as { type?: string };
      return parsed.type === "initializeMint2" || parsed.type === "initializeMint";
    });
    return found
      ? { ok: true }
      : { ok: false, reason: "No token mint initialization found in this transaction." };
  }

  if (task === "revoke_mint_authority" || task === "revoke_freeze_authority") {
    // Solana's RPC parses AuthorityType enum variants in camelCase (e.g. "mintTokens", not
    // the Rust-style "MintTokens"), confirmed directly against live transaction data.
    const expectedAuthorityType = task === "revoke_mint_authority" ? "mintTokens" : "freezeAccount";
    const found = instructions.some((ix) => {
      if (!("parsed" in ix) || ix.program !== "spl-token") return false;
      const parsed = ix.parsed as { type?: string; info?: Record<string, unknown> };
      if (parsed.type !== "setAuthority") return false;
      const info = parsed.info ?? {};
      return (
        info.authorityType === expectedAuthorityType &&
        (info.newAuthority === undefined || info.newAuthority === null) &&
        info.authority === wallet
      );
    });
    return found
      ? { ok: true }
      : { ok: false, reason: "No matching authority revocation found in this transaction." };
  }

  return { ok: false, reason: "Unsupported task." };
}
