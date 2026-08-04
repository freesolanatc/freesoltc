import { clientEnv } from "@/lib/env";

export const siteConfig = {
  name: clientEnv.NEXT_PUBLIC_SITE_NAME,
  title: "Create Solana Token Free | Free Solana Token Creator",
  description:
    "Create Solana SPL tokens for free in minutes. No platform fee — only the Solana network fee. Optionally revoke mint and freeze authority for free, or claim a custom contract address.",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  twitterHandle: clientEnv.NEXT_PUBLIC_TWITTER_HANDLE ?? "@freesolanatoken",
  locale: "en_US",
  ogImage: "/opengraph-image",

  adminWalletAddress: clientEnv.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
  vanityFeeSol: clientEnv.NEXT_PUBLIC_VANITY_FEE_SOL,

  rpcUrl: clientEnv.NEXT_PUBLIC_RPC_URL,
  rpcUrlFallback: clientEnv.NEXT_PUBLIC_RPC_URL_FALLBACK,
  cluster: clientEnv.NEXT_PUBLIC_SOLANA_CLUSTER,

  analytics: {
    gaMeasurementId: clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    clarityProjectId: clientEnv.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    plausibleDomain: clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  },

  links: {
    twitter: "https://twitter.com/freesolanatoken",
    github: "https://github.com/freesolanatc",
  },

  contactEmail: "support@freesolanatoken.com",

  nav: [
    { title: "Create Token", href: "/create-token" },
    { title: "Revoke Mint Authority", href: "/revoke-mint-authority" },
    { title: "Revoke Freeze Authority", href: "/revoke-freeze-authority" },
    { title: "Airdrop", href: "/airdrop" },
    { title: "Referral", href: "/referral" },
  ],

  footerLinks: [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Contact", href: "/contact" },
    { title: "About", href: "/about" },
  ],

  keywords: [
    "Create Solana Token Free",
    "Free Solana Token Creator",
    "Create SPL Token Free",
    "Free SPL Token Creator",
    "Create Solana Coin Free",
    "Revoke Mint Authority Free",
    "Revoke Freeze Authority Free",
    "Remove Mint Authority Solana",
    "Remove Freeze Authority Solana",
    "Solana Token Generator Free",
    "Create Token on Solana Free",
    "Free Solana Tools",
    "Solana Token Creator",
    "SPL Token Creator",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** RPC hostnames allow-listed for CSP connect-src. */
export function getRpcHostnames(): string[] {
  const hosts = new Set<string>();
  for (const url of [siteConfig.rpcUrl, siteConfig.rpcUrlFallback]) {
    if (!url) continue;
    try {
      hosts.add(new URL(url).hostname);
    } catch {
      // ignore invalid URL, validated separately by env schema
    }
  }
  return Array.from(hosts);
}
