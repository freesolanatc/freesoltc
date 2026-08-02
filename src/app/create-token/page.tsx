import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TokenForm } from "@/components/token/TokenForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Create Solana Token Free — SPL Token Creator",
  description:
    "Create a Solana SPL token for free in minutes. No platform fee. Optionally revoke mint and freeze authority for free, or claim a custom vanity contract address.",
  path: "/create-token",
});

const faqs = [
  {
    question: "Is creating a Solana token really free?",
    answer:
      "Yes. Token creation, revoking mint authority, and revoking freeze authority never carry a platform fee — you only pay the standard Solana network fee, typically a fraction of a cent.",
  },
  {
    question: "What is the Claim Custom Address feature?",
    answer:
      `Claim Custom Address is our only paid feature. For a flat ${siteConfig.vanityFeeSol} SOL fee, we generate a vanity keypair whose public key starts or ends with up to 4 characters you choose, entirely in your browser.`,
  },
  {
    question: "Do you ever have access to my private keys?",
    answer:
      "No. All signing happens in your connected wallet. Vanity addresses are generated client-side in your browser and are never transmitted to our servers.",
  },
];

export default function CreateTokenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Create Solana Token", path: "/create-token" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create Solana Token Free
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Configure your SPL token below. No platform fee &mdash; only the Solana network fee.
        </p>
      </div>

      <TokenForm />

      <section className="mt-16 space-y-4">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-lg border border-border/60 p-4">
            <h3 className="font-medium">{faq.question}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
