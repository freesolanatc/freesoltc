import { getRpcHostnames } from "@/lib/site-config";

const ANALYTICS_SCRIPT_HOSTS = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://www.clarity.ms",
  "https://plausible.io",
];

const ANALYTICS_CONNECT_HOSTS = [
  "https://www.google-analytics.com",
  "https://www.clarity.ms",
  "https://plausible.io",
];

/** Builds a per-request CSP header string. Explicitly allow-lists the configured RPC + analytics hosts. */
export function buildCspHeader(nonce: string): string {
  const rpcHosts = getRpcHostnames().map((h) => `https://${h}`);
  const explorerHost = "https://explorer.solana.com";
  const irysHosts = ["https://uploader.irys.xyz", "https://gateway.irys.xyz", "https://node1.irys.xyz", "https://devnet.irys.xyz"];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...ANALYTICS_SCRIPT_HOSTS],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      ...rpcHosts,
      ...irysHosts,
      ...ANALYTICS_CONNECT_HOSTS,
      "https://*.solana.com",
    ],
    "frame-src": ["'self'", explorerHost],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length > 0 ? `${key} ${values.join(" ")}` : key))
    .join("; ");
}
