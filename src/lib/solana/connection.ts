import { Connection } from "@solana/web3.js";
import { siteConfig } from "@/lib/site-config";

export class TransactionFailedOnChainError extends Error {
  constructor(public readonly err: unknown) {
    super(`Transaction failed on-chain: ${JSON.stringify(err)}`);
    this.name = "TransactionFailedOnChainError";
  }
}

let cachedConnection: Connection | null = null;

/** Singleton mainnet/devnet RPC connection, falling back to a secondary endpoint on repeated failure. */
export function getConnection(): Connection {
  if (cachedConnection) return cachedConnection;
  cachedConnection = new Connection(siteConfig.rpcUrl, "confirmed");
  return cachedConnection;
}

export function getFallbackConnection(): Connection | null {
  if (!siteConfig.rpcUrlFallback) return null;
  return new Connection(siteConfig.rpcUrlFallback, "confirmed");
}

/** Runs `fn` against the primary connection, retrying once against the fallback RPC on failure. */
export async function withRpcFallback<T>(fn: (connection: Connection) => Promise<T>): Promise<T> {
  try {
    return await fn(getConnection());
  } catch (err) {
    const fallback = getFallbackConnection();
    if (!fallback) throw err;
    return fn(fallback);
  }
}

/**
 * Confirms a transaction by blockhash expiry (giving it the network's real ~60-90s window)
 * instead of `connection.confirmTransaction(signature, commitment)`'s legacy two-argument
 * overload, which races against a hardcoded 30-second timeout regardless of how much longer
 * the blockhash actually has left to live. Even with the proper strategy, a slow RPC or a
 * dropped WebSocket subscription can still make confirmTransaction reject — before treating
 * that as a real failure, this double-checks the signature status directly, since the
 * transaction frequently did land even though the client-side wait timed out.
 */
export async function confirmTransactionRobust(
  connection: Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number
): Promise<void> {
  try {
    const result = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );
    if (result.value.err) {
      throw new TransactionFailedOnChainError(result.value.err);
    }
    return;
  } catch (err) {
    if (err instanceof TransactionFailedOnChainError) throw err;

    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    if (status.value?.err) {
      throw new TransactionFailedOnChainError(status.value.err);
    }
    const confirmationStatus = status.value?.confirmationStatus;
    if (confirmationStatus === "confirmed" || confirmationStatus === "finalized") {
      return;
    }
    throw err instanceof Error ? err : new Error("Transaction confirmation failed.");
  }
}
