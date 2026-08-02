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

  // Irys tracks a prepaid balance per wallet on its own node, separate from the wallet's SOL
  // balance — uploads fail with "Not enough balance for transaction" until that node balance is
  // topped up. We never funded it, so every upload past Irys's small free tier failed
  // regardless of how much SOL the wallet actually held. Estimate the combined cost up front and
  // top up (a real, wallet-approved SOL transfer to Irys) before uploading anything.
  const properties: Record<string, string> = {};
  if (social.website) properties.website = social.website;
  if (social.twitter) properties.twitter = social.twitter;
  if (social.telegram) properties.telegram = social.telegram;
  if (social.discord) properties.discord = social.discord;

  const metadataJsonForSizing = JSON.stringify({
    name,
    symbol,
    description,
    image: `https://gateway.irys.xyz/${"x".repeat(43)}`,
    properties,
  });
  const estimatedTotalBytes = image.size + new TextEncoder().encode(metadataJsonForSizing).length;

  const [price, balance] = await Promise.all([
    irys.getPrice(estimatedTotalBytes),
    irys.getBalance(),
  ]);
  if (balance.lt(price)) {
    await irys.fund(price.minus(balance), 1.1);
  }

  const imageReceipt = await irys.uploadFile(image);
  const imageUri = `https://gateway.irys.xyz/${imageReceipt.id}`;

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
