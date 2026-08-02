export interface SocialLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
}

export interface TokenFormValues {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  description: string;
  image: File | null;
  social: SocialLinks;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
  claimCustomAddress: boolean;
  vanityMode: "prefix" | "suffix";
  vanityText: string;
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  metadataUri: string;
  description: string;
  social: SocialLinks;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
  /** Populated only when the vanity address flow produced a matching keypair. */
  mintKeypairSecretKey?: Uint8Array;
}

export interface TokenCreationResult {
  mintAddress: string;
  signatures: string[];
  explorerUrl: string;
}
