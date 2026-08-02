import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RevokeAuthorityCard } from "@/components/revoke/RevokeAuthorityCard";

export const metadata: Metadata = buildMetadata({
  title: "Revoke Mint Authority Free — Solana SPL Token Tool",
  description:
    "Revoke mint authority on any Solana SPL token for free. Only the network fee applies. Prove to holders that your token's supply can never be inflated.",
  path: "/revoke-mint-authority",
});

const faqs = [
  {
    question: "What is mint authority?",
    answer:
      "Mint authority is the on-chain permission that allows an account to create (mint) additional supply of an SPL token. Whoever holds it can increase the token's circulating supply at any time.",
  },
  {
    question: "Why should I revoke mint authority?",
    answer:
      "Revoking mint authority permanently proves to your holders that the total supply is fixed and can never be inflated by the team or anyone else. It's one of the clearest trust signals a token project can send.",
  },
  {
    question: "Is revoking mint authority reversible?",
    answer:
      "No. Once mint authority is set to null on-chain, it can never be restored. Make sure your total supply is exactly what you want before revoking.",
  },
  {
    question: "Does revoking mint authority cost anything?",
    answer: "No platform fee. You only pay the standard Solana network fee for the transaction.",
  },
];

export default function RevokeMintAuthorityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Revoke Mint Authority", path: "/revoke-mint-authority" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Revoke Mint Authority Free
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Permanently disable the ability to mint new supply for any SPL token you control.
          No platform fee &mdash; only the Solana network fee.
        </p>
      </div>

      <RevokeAuthorityCard authorityType="mint" />

      <section className="mt-16 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">What is mint authority?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every SPL token mint account on Solana has an optional <strong>mint authority</strong>{" "}
            &mdash; the address permitted to create new tokens. As long as mint authority is set,
            that address can increase the total supply at will, which can dilute existing
            holders. Revoking it sets the authority to <code>null</code>, permanently disabling
            further minting.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Benefits of revoking mint authority</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A fixed, provably capped supply is one of the strongest trust signals in the Solana
            ecosystem. Traders and holders routinely check whether mint authority has been
            revoked before investing in a new token &mdash; doing so signals the team cannot
            inflate supply after launch.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Risks to consider</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Revocation is permanent and cannot be undone. Only revoke mint authority once your
            token&apos;s total supply is finalized &mdash; you will never be able to mint
            additional tokens afterward, even for legitimate purposes like community rewards.
          </p>
        </div>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-lg border border-border/60 p-4">
            <h3 className="font-medium">{faq.question}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-xl border border-border/60 p-6 text-sm">
        <h2 className="font-semibold">Related tools</h2>
        <p className="mt-2 text-muted-foreground">
          <Link href="/revoke-freeze-authority" className="underline">
            Revoke freeze authority
          </Link>{" "}
          or{" "}
          <Link href="/create-token" className="underline">
            create a new Solana token
          </Link>{" "}
          with authorities revoked automatically at creation.
        </p>
      </section>
    </div>
  );
}
