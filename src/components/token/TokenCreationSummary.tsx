import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";
import type { TokenFormValues } from "@/types/token";

export function TokenCreationSummary({ values }: { values: TokenFormValues }) {
  const approvalCount = 1 + (values.revokeMintAuthority || values.revokeFreezeAuthority ? 1 : 0);
  const walletApprovals = values.claimCustomAddress ? approvalCount + 1 : approvalCount;

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-5 text-sm">
      <h3 className="font-semibold">Review before you sign</h3>
      <dl className="space-y-2">
        <Row label="Name" value={values.name || "—"} />
        <Row label="Symbol" value={values.symbol || "—"} />
        <Row label="Decimals" value={String(values.decimals)} />
        <Row label="Initial supply" value={values.initialSupply || "0"} />
        <Row
          label="Revoke mint authority"
          value={values.revokeMintAuthority ? "Yes (free)" : "No"}
        />
        <Row
          label="Revoke freeze authority"
          value={values.revokeFreezeAuthority ? "Yes (free)" : "No"}
        />
        <Row
          label="Custom address"
          value={
            values.claimCustomAddress
              ? `${values.vanityMode} "${values.vanityText}" (${siteConfig.vanityFeeSol} SOL)`
              : "No"
          }
        />
      </dl>
      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-muted-foreground">Wallet approvals required</span>
        <Badge variant="secondary">{walletApprovals}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Every approval you&apos;re asked for will clearly show what it authorizes. Solana network
        fees apply to each on-chain transaction in addition to any fee shown above.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium">{value}</dd>
    </div>
  );
}
