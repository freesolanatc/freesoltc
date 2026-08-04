import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqAccordion } from "@/components/blog/FaqAccordion";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Free Solana Token Creator",
  description:
    "Answers to common questions about creating Solana tokens for free, revoking mint and freeze authority, and claiming a custom contract address.",
  path: "/faq",
});

const groups: { title: string; items: { question: string; answer: string }[] }[] = [
  {
    title: "Pricing",
    items: [
      {
        question: "Is Free Solana Token Creator really free?",
        answer:
          "Yes. Creating an SPL token, revoking mint authority, and revoking freeze authority never carry a platform fee. You only ever pay the standard Solana network fee for each transaction, typically a fraction of a cent.",
      },
      {
        question: "What is the only paid feature?",
        answer: `Claim Custom Address is the one paid feature on the site: a flat ${siteConfig.vanityFeeSol} SOL fee to generate a contract address with a custom prefix or suffix you choose. Everything else is free.`,
      },
      {
        question: "Are there hidden fees?",
        answer:
          "No. Every fee is disclosed before you sign anything, and every wallet prompt clearly reflects what you're approving. Solana network fees always apply on top of any platform fee and are paid directly to the network, not to us.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        question: "Do you ever access my private keys?",
        answer:
          "Never. All transactions are built client-side and signed by your connected wallet. We have no mechanism to access, store, or transmit your private keys.",
      },
      {
        question: "How does the custom contract address feature stay secure?",
        answer:
          "Contract address keypairs are generated entirely inside your browser using Web Workers. The winning keypair is held in memory only long enough to build your token creation transaction, then discarded — it is never sent to our servers or logged anywhere.",
      },
      {
        question: "Which wallets are supported?",
        answer:
          "Phantom, Solflare, Backpack, Glow, and any other wallet that implements the Solana Wallet Standard are supported automatically.",
      },
    ],
  },
  {
    title: "Tokens",
    items: [
      {
        question: "Can I revoke authorities after creating my token?",
        answer:
          "Yes. You can revoke mint and freeze authority at the moment of creation using the Advanced Options checkboxes, or at any later time using the dedicated Revoke Mint Authority and Revoke Freeze Authority pages.",
      },
      {
        question: "What decimals and supply should I choose?",
        answer:
          "Most Solana tokens use 9 decimals, matching SOL itself, but you can choose any value from 0 to 9. Total supply depends entirely on your project's tokenomics.",
      },
      {
        question: "Can I edit my token after it's created?",
        answer:
          "Token metadata can be updated later if you keep update authority. Revoking mint or freeze authority is permanent and cannot be undone.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Everything you need to know about creating and managing Solana tokens for free.
        </p>
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-xl font-semibold">{group.title}</h2>
            <FaqAccordion items={group.items} />
          </section>
        ))}
      </div>
    </div>
  );
}
