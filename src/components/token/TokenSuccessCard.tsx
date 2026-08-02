import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletAddressBadge } from "@/components/wallet/WalletAddressBadge";
import type { TokenCreationResult } from "@/types/token";

export function TokenSuccessCard({
  result,
  onCreateAnother,
}: {
  result: TokenCreationResult;
  onCreateAnother: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
      <h3 className="text-xl font-semibold">Your token is live!</h3>
      <p className="text-sm text-muted-foreground">
        Your SPL token has been created and confirmed on Solana.
      </p>
      <div className="flex justify-center">
        <WalletAddressBadge address={result.mintAddress} />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer">
            View on Explorer <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/revoke-mint-authority">Manage authorities</Link>
        </Button>
        <Button variant="ghost" onClick={onCreateAnother}>
          Create another token
        </Button>
      </div>
    </div>
  );
}
