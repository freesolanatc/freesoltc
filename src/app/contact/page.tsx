import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/marketing/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Contact — Free Solana Token Creator",
  description: "Get in touch with the Free Solana Token Creator team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Questions, feedback, or partnership inquiries? Send us a message, or email us directly
          at{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="underline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
