import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RevokeAuthorityCard } from "@/components/revoke/RevokeAuthorityCard";

export const metadata: Metadata = buildMetadata({
  title: "Revoke Freeze Authority Free — Solana SPL Token Tool",
  description:
    "Revoke freeze authority on any Solana SPL token for free. Only the network fee applies. Prove to holders that their token accounts can never be frozen.",
  path: "/revoke-freeze-authority",
});

const faqs = [
  {
    question: "What is freeze authority?",
    answer:
      "Freeze authority is the on-chain permission that allows an account to freeze any holder's token account for a given SPL token, preventing that holder from transferring or selling their tokens.",
  },
  {
    question: "Why should I revoke freeze authority?",
    answer:
      "Revoking freeze authority proves to holders that their tokens can never be frozen by the project team, removing a common rug-pull vector and increasing trust in your token.",
  },
  {
    question: "Is revoking freeze authority reversible?",
    answer:
      "No. Once freeze authority is set to null on-chain, it can never be restored, and no account holding this token can ever be frozen again.",
  },
  {
    question: "Does revoking freeze authority cost anything?",
    answer: "No platform fee. You only pay the standard Solana network fee for the transaction.",
  },
];

export default function RevokeFreezeAuthorityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Revoke Freeze Authority", path: "/revoke-freeze-authority" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Revoke Freeze Authority Free
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Permanently disable the ability to freeze holder accounts for any SPL token you
          control. No platform fee &mdash; only the Solana network fee.
        </p>
      </div>

      <RevokeAuthorityCard authorityType="freeze" />

      <section className="mt-16 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">What is freeze authority?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every SPL token mint account on Solana has an optional <strong>freeze authority</strong>{" "}
            &mdash; the address permitted to freeze any individual token account holding that
            token. A frozen account cannot transfer, sell, or otherwise move its tokens until
            unfrozen. Revoking freeze authority sets it to <code>null</code>, permanently
            disabling this capability.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Benefits of revoking freeze authority</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Freeze authority is one of the most commonly abused mechanisms in low-trust token
            launches, letting bad actors lock holders out of their own funds. Revoking it is a
            strong, verifiable signal that your project respects holder autonomy.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Risks to consider</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Revocation is permanent. Some legitimate use cases &mdash; such as regulatory
            compliance tooling or emergency response to an exploit &mdash; rely on freeze
            authority. Only revoke it once you&apos;re confident you won&apos;t need that
            capability.
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
          <Link href="/revoke-mint-authority" className="underline">
            Revoke mint authority
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
