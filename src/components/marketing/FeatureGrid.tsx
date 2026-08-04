import {
  CheckCircle2,
  Coins,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const features = [
  { icon: Coins, title: "Free Token Creation", description: "Launch a fully compliant SPL token. Only the Solana network fee applies." },
  { icon: Flame, title: "Free Mint Authority Removal", description: "Revoke mint authority at no extra cost, right after creation or any time later." },
  { icon: Lock, title: "Free Freeze Authority Removal", description: "Revoke freeze authority for free to build holder trust and transparency." },
  { icon: Sparkles, title: "Optional Custom Address", description: "Claim a custom prefix or suffix for your token's contract address for 0.1 SOL." },
  { icon: Wallet, title: "Secure Wallet Integration", description: "Connect with Phantom, Solflare, Backpack, Glow, or any Wallet Standard wallet." },
  { icon: Zap, title: "Fast Transactions", description: "Optimized instruction batching means fewer wallet prompts and faster confirmations." },
  { icon: ShieldCheck, title: "Non-Custodial & Secure", description: "We never hold your private keys. Every transaction is signed by you, in your wallet." },
  { icon: CheckCircle2, title: "Open and Transparent Pricing", description: "Zero hidden fees. You always know exactly what you're paying for before you sign." },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to launch on Solana
        </h2>
        <p className="mt-4 text-muted-foreground">
          A complete, transparent toolkit for creating and managing SPL tokens &mdash; free by
          default.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-border"
          >
            <feature.icon className="h-6 w-6 text-primary" aria-hidden />
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
