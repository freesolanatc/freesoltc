import type { SocialLinks } from "@/types/token";

export interface UploadTokenMetadataParams {
  image: File;
  name: string;
  symbol: string;
  description: string;
  social: SocialLinks;
}

/**
 * Uploads the token image and off-chain metadata JSON to IPFS via Pinata, through our own API
 * route. The site's Pinata account pays the (negligible, free-tier) storage cost, so this never
 * needs a wallet approval or a per-user funding step — unlike paying a storage network (e.g.
 * Irys/Arweave) directly from the connected wallet.
 */
export async function uploadTokenMetadata({
  image,
  name,
  symbol,
  description,
  social,
}: UploadTokenMetadataParams): Promise<string> {
  const form = new FormData();
  form.append("image", image);
  form.append("name", name);
  form.append("symbol", symbol);
  form.append("description", description);
  form.append("social", JSON.stringify(social));

  let res: Response;
  try {
    res = await fetch("/api/upload-metadata", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(115_000),
    });
  } catch {
    throw new Error(
      "Upload timed out. Check your internet connection and try again."
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to upload token image/metadata.");
  }

  const data = (await res.json()) as { metadataUri: string };
  return data.metadataUri;
}
