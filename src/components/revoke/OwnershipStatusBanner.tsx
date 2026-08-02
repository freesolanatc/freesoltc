import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { truncateAddress } from "@/lib/utils";
import type { AuthorityKind } from "@/types/solana";

interface OwnershipStatusBannerProps {
  kind: AuthorityKind;
  matchState: "no-authority" | "not-owner" | "match";
  authority: string | null;
}

export function OwnershipStatusBanner({ kind, matchState, authority }: OwnershipStatusBannerProps) {
  const label = kind === "mint" ? "Mint authority" : "Freeze authority";

  if (matchState === "no-authority") {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{label} already revoked</AlertTitle>
        <AlertDescription>
          This token has no {label.toLowerCase()} set. There is nothing to revoke.
        </AlertDescription>
      </Alert>
    );
  }

  if (matchState === "not-owner") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connected wallet is not the {label.toLowerCase()}</AlertTitle>
        <AlertDescription>
          The {label.toLowerCase()} for this token is {authority ? truncateAddress(authority) : "unknown"}.
          Only that wallet can revoke it &mdash; this is enforced on-chain, not just in this UI.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-500/40 bg-green-500/5">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>You are the {label.toLowerCase()}</AlertTitle>
      <AlertDescription>You can revoke it below. This action is permanent.</AlertDescription>
    </Alert>
  );
}
