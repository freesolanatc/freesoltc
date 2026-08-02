import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — Free Solana Token Creator",
  description: "How Free Solana Token Creator handles data and privacy.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Privacy Policy", path: "/privacy-policy" }]} />

      <div className="prose prose-neutral max-w-none py-10 dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

        <p>
          This placeholder Privacy Policy is provided as a starting point and does not
          constitute legal advice. Before launching {siteConfig.name} in production, have this
          document reviewed by a qualified attorney familiar with your jurisdiction and
          applicable data protection laws.
        </p>

        <h2>1. Non-custodial by design</h2>
        <p>
          {siteConfig.name} never requests, stores, or has access to your wallet&apos;s private
          keys or seed phrase. All transactions are constructed client-side and signed directly
          by your connected wallet extension.
        </p>

        <h2>2. Information we collect</h2>
        <p>
          We do not require account creation. Data we may process includes: (a) information you
          voluntarily submit through the contact form (name, email, message); (b) standard
          server logs and analytics data (IP address, browser type, pages visited) if analytics
          integrations are enabled; and (c) public on-chain data associated with transactions you
          initiate, which is inherently public on the Solana blockchain regardless of our
          involvement.
        </p>

        <h2>3. Vanity address generation</h2>
        <p>
          When you use the optional Claim Custom Address feature, candidate keypairs are
          generated entirely within your browser. Generated private keys are never transmitted
          to, or stored by, our servers.
        </p>

        <h2>4. Payment verification</h2>
        <p>
          To verify the one-time Claim Custom Address fee, our server independently checks the
          relevant transaction signature against the Solana blockchain. We retain a short-lived
          record of the transaction signature solely to prevent the same payment from being
          reused, which automatically expires.
        </p>

        <h2>5. Cookies and analytics</h2>
        <p>
          We may use privacy-respecting analytics tools (such as Google Analytics, Microsoft
          Clarity, or Plausible) to understand aggregate site usage. Where required by law, we
          will request your consent before enabling non-essential cookies.
        </p>

        <h2>6. Third-party services</h2>
        <p>
          We rely on third-party infrastructure providers, including Solana RPC providers and
          Arweave/Irys for permanent token metadata storage. These providers have their own
          privacy practices, which we encourage you to review.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
