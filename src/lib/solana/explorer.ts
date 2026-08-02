import { siteConfig } from "@/lib/site-config";

type ExplorerTarget = "address" | "tx";

/** Builds a Solana Explorer URL for the configured cluster. */
export function getExplorerUrl(value: string, target: ExplorerTarget = "address"): string {
  const cluster = siteConfig.cluster;
  const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/${target}/${value}${clusterParam}`;
}
