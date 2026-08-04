import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, KeyRound, Eye, Coins } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "About — Free Solana Token Creator",
  description:
    "Learn about Free Solana Token Creator's mission to make launching SPL tokens on Solana free, transparent, and fully non-custodial.",
  path: "/about",
});

const values = [
  {
    icon: Coins,
    title: "Free by default",
    description:
      "Token creation and authority revocation should never cost more than the Solana network fee. We built this tool to prove that's possible.",
  },
  {
    icon: KeyRound,
    title: "Non-custodial, always",
    description:
      "We never ask for your seed phrase or private key. Every transaction is signed in your own wallet, in full view of exactly what it does.",
  },
  {
    icon: Eye,
    title: "Transparent pricing",
    description:
      `Our only paid feature — the ${siteConfig.vanityFeeSol} SOL custom address option — is disclosed clearly before you ever sign a transaction. No surprises, no bundled fees.`,
  },
  {
    icon: ShieldCheck,
    title: "Security-first engineering",
    description:
      "From client-side custom contract address generation to strict input validation and on-chain ownership checks, security shapes every decision we make.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "About", path: "/about" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About {siteConfig.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          We believe launching a token on Solana shouldn&apos;t require paying a platform fee on
          top of network costs &mdash; so we built a tool that doesn&apos;t charge one.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {values.map((value) => (
          <div key={value.title} className="rounded-xl border border-border/60 p-6">
            <value.icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 font-semibold">{value.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-semibold">Ready to launch?</h2>
        <p className="mt-2 text-muted-foreground">
          Create your Solana token in minutes, completely free.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/create-token">Create Token</Link>
        </Button>
      </div>
    </div>
  );
}
