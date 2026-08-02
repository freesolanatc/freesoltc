import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ReferralPanel } from "@/components/referral/ReferralPanel";
import { siteConfig } from "@/lib/site-config";

const POINTS_PER_REFERRAL = 50;

export const metadata: Metadata = buildMetadata({
  title: "Referral Program — Earn Points | Free Solana Token Creator",
  description: `Invite friends to Free Solana Token Creator and earn ${POINTS_PER_REFERRAL} airdrop points for every person who joins with your referral link.`,
  path: "/referral",
});

export default function ReferralPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Referral", path: "/referral" }]} />

      <div className="py-10 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
          +{POINTS_PER_REFERRAL} points per invite
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Referral Program</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Share your personal link. For every person who joins {siteConfig.name} through it,
          you earn {POINTS_PER_REFERRAL} points &mdash; no limit on how many friends you invite.
        </p>
      </div>

      <ReferralPanel />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Points are tracked for reference only and don&apos;t represent a guaranteed token,
        financial instrument, or monetary value. Eligibility and any future distribution details
        will be announced on our official X and Telegram channels.
      </p>
    </div>
  );
}
