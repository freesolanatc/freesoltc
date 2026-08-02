import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service — Free Solana Token Creator",
  description: "Terms of Service for using Free Solana Token Creator.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Terms of Service", path: "/terms" }]} />

      <div className="prose prose-neutral max-w-none py-10 dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

        <p>
          This placeholder Terms of Service is provided as a starting point and does not
          constitute legal advice. Before launching {siteConfig.name} in production, have this
          document reviewed by a qualified attorney familiar with your jurisdiction.
        </p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By using {siteConfig.name} (the &quot;Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree, do not use the Service.
        </p>

        <h2>2. Nature of the Service</h2>
        <p>
          The Service is a non-custodial tool that helps you construct Solana blockchain
          transactions for creating SPL tokens and managing mint/freeze authorities. We do not
          hold, custody, or have access to your funds or private keys at any point. You are
          solely responsible for reviewing and approving every transaction in your wallet.
        </p>

        <h2>3. Fees</h2>
        <p>
          Token creation, mint authority revocation, and freeze authority revocation carry no
          platform fee &mdash; you are responsible only for standard Solana network fees. The
          Claim Custom Address feature carries a flat {siteConfig.vanityFeeSol} SOL platform fee,
          disclosed before payment, in addition to applicable network fees.
        </p>

        <h2>4. No financial advice</h2>
        <p>
          Nothing on this site constitutes financial, investment, legal, or tax advice. Creating
          a token does not guarantee any outcome, value, or liquidity for that token.
        </p>

        <h2>5. Irreversible actions</h2>
        <p>
          Revoking mint authority or freeze authority is permanent and cannot be undone once
          confirmed on-chain. You are solely responsible for confirming these actions are
          intended before signing.
        </p>

        <h2>6. No warranty</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not
          guarantee uninterrupted availability, error-free operation, or that any transaction
          will be confirmed by the Solana network within any particular timeframe.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {siteConfig.name} and its operators shall not
          be liable for any indirect, incidental, or consequential damages arising from your use
          of the Service, including losses resulting from blockchain network issues, wallet
          software, or user error.
        </p>

        <h2>8. Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          are posted constitutes acceptance of the updated Terms.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
