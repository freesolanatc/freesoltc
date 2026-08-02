export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet";

export type AuthorityKind = "mint" | "freeze";

export interface MintOwnershipInfo {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  supply: bigint;
  decimals: number;
}

export interface TransactionStep {
  label: string;
  status: "pending" | "active" | "success" | "error";
  description?: string;
}
