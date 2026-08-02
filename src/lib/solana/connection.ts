import { Connection } from "@solana/web3.js";
import { siteConfig } from "@/lib/site-config";

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
