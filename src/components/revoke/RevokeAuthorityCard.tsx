"use client";

import { useCallback, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { MintAddressLookupForm } from "@/components/revoke/MintAddressLookupForm";
import { OwnershipStatusBanner } from "@/components/revoke/OwnershipStatusBanner";
import { useMintOwnership, isAuthorityMatch } from "@/hooks/useMintOwnership";
import {
  createRevokeFreezeAuthorityInstruction,
  createRevokeMintAuthorityInstruction,
} from "@/lib/solana/revokeAuthority";
import { getExplorerUrl } from "@/lib/solana/explorer";
import { claimOnChainTask } from "@/lib/points/claimPointsClient";
import type { AuthorityKind } from "@/types/solana";

export function RevokeAuthorityCard({ authorityType }: { authorityType: AuthorityKind }) {
  const { connection } = useConnection();
  const { publicKey, signMessage, sendTransaction, connected } = useWallet();
  const { status, info, error, lookup } = useMintOwnership();

  const [revoking, setRevoking] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);

  const authority = authorityType === "mint" ? info?.mintAuthority ?? null : info?.freezeAuthority ?? null;
  const matchState = isAuthorityMatch(authority, publicKey?.toBase58());

  const handleLookup = useCallback(
    (address: string) => {
      setMintAddress(address);
      setTxSignature(null);
      setRevokeError(null);
      lookup(address);
    },
    [lookup]
  );

  const handleRevoke = useCallback(async () => {
    if (!publicKey || !mintAddress) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      const mint = new PublicKey(mintAddress);
      const instruction =
        authorityType === "mint"
          ? createRevokeMintAuthorityInstruction(mint, publicKey)
          : createRevokeFreezeAuthorityInstruction(mint, publicKey);

      const tx = new Transaction().add(instruction);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setTxSignature(signature);
      lookup(mintAddress);

      void claimOnChainTask(
        { publicKey, signMessage },
        authorityType === "mint" ? "revoke_mint_authority" : "revoke_freeze_authority",
        [signature]
      );
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : "Failed to revoke authority.");
    } finally {
      setRevoking(false);
    }
  }, [authorityType, connection, lookup, mintAddress, publicKey, sendTransaction, signMessage]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connect your wallet to look up and revoke {authorityType} authority.
        </p>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-border/60 p-6">
      <MintAddressLookupForm onLookup={handleLookup} loading={status === "loading"} />

      {status === "not-found" && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {status === "found" && info && (
        <div className="space-y-4">
          <OwnershipStatusBanner kind={authorityType} matchState={matchState} authority={authority} />

          {matchState === "match" && !txSignature && (
            <Button onClick={handleRevoke} disabled={revoking} variant="destructive">
              {revoking ? "Revoking..." : `Revoke ${authorityType === "mint" ? "Mint" : "Freeze"} Authority`}
            </Button>
          )}

          {revokeError && <p className="text-sm text-destructive">{revokeError}</p>}

          {txSignature && (
            <div className="flex items-center gap-2 rounded-md border border-green-500/40 bg-green-500/5 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span>
                Authority revoked.{" "}
                <a
                  href={getExplorerUrl(txSignature, "tx")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View transaction
                </a>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
