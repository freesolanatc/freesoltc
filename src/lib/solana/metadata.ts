"use client";

import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import { siteConfig } from "@/lib/site-config";
import type { SocialLinks } from "@/types/token";

export interface UploadTokenMetadataParams {
  /** A Solana wallet-adapter-compatible signer (publicKey + signMessage/signTransaction). */
  walletAdapter: unknown;
  image: File;
  name: string;
  symbol: string;
  description: string;
  social: SocialLinks;
}

/**
 * Uploads the token image and off-chain metadata JSON to permanent Arweave storage via Irys,
 * paid for directly by the connected wallet (small SOL amount) — the site never custodies a
 * storage funding key server-side.
 */
export async function uploadTokenMetadata({
  walletAdapter,
  image,
  name,
  symbol,
  description,
  social,
}: UploadTokenMetadataParams): Promise<string> {
  const irysUploaderBuilder = WebUploader(WebSolana)
    .withProvider(walletAdapter)
    .withRpc(siteConfig.rpcUrl);
  const irysUploader =
    siteConfig.cluster === "mainnet-beta" ? irysUploaderBuilder.mainnet() : irysUploaderBuilder.devnet();
  const irys = await irysUploader;

  const imageReceipt = await irys.uploadFile(image);
  const imageUri = `https://gateway.irys.xyz/${imageReceipt.id}`;

  const properties: Record<string, string> = {};
  if (social.website) properties.website = social.website;
  if (social.twitter) properties.twitter = social.twitter;
  if (social.telegram) properties.telegram = social.telegram;
  if (social.discord) properties.discord = social.discord;

  const metadataJson = {
    name,
    symbol,
    description,
    image: imageUri,
    properties,
  };

  const metadataReceipt = await irys.upload(JSON.stringify(metadataJson), {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });

  return `https://gateway.irys.xyz/${metadataReceipt.id}`;
}
