"use client";

import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { getConnection } from "@/lib/solana/connection";
import type { MintOwnershipInfo } from "@/types/solana";

export type MintLookupStatus = "idle" | "loading" | "found" | "not-found" | "error";

export function useMintOwnership() {
  const [status, setStatus] = useState<MintLookupStatus>("idle");
  const [info, setInfo] = useState<MintOwnershipInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (mintAddress: string) => {
    setStatus("loading");
    setError(null);
    setInfo(null);

    let mintKey: PublicKey;
    try {
      mintKey = new PublicKey(mintAddress);
    } catch {
      setStatus("error");
      setError("Enter a valid Solana mint address.");
      return;
    }

    try {
      const mint = await getMint(getConnection(), mintKey);
      setInfo({
        mintAuthority: mint.mintAuthority?.toBase58() ?? null,
        freezeAuthority: mint.freezeAuthority?.toBase58() ?? null,
        supply: mint.supply,
        decimals: mint.decimals,
      });
      setStatus("found");
    } catch {
      setStatus("not-found");
      setError("No SPL token mint was found at this address.");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setInfo(null);
    setError(null);
  }, []);

  return { status, info, error, lookup, reset };
}

export function isAuthorityMatch(
  authority: string | null,
  walletAddress: string | null | undefined
): "no-authority" | "not-owner" | "match" {
  if (!authority) return "no-authority";
  if (!walletAddress || authority !== walletAddress) return "not-owner";
  return "match";
}

