import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AirdropTaskList } from "@/components/marketing/AirdropTaskList";

export const metadata: Metadata = buildMetadata({
  title: "Airdrop — Earn Points | Free Solana Token Creator",
  description:
    "Complete tasks to earn Free Solana Token Creator airdrop points: follow us on X, join our Telegram, create a token, revoke authorities, and claim a custom address.",
  path: "/airdrop",
});

export default function AirdropPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Airdrop", path: "/airdrop" }]} />

      <AirdropTaskList />

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Invite Friends</p>
            <Badge variant="secondary" className="mt-1">
              +50 points per invite
            </Badge>
          </div>
        </div>

        <Button size="sm" variant="outline" asChild>
          <Link href="/referral">
            Get Referral Link
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Points are tracked for reference only and don&apos;t represent a guaranteed token,
        financial instrument, or monetary value. Eligibility and any future distribution details
        will be announced on our official X and Telegram channels.
      </p>
    </div>
  );
}
