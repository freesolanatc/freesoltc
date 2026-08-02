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

/**
 * Builds the CSP header string. Deliberately has no per-request nonce: Next.js only stamps a
 * nonce onto its own inline hydration/RSC scripts when that nonce is threaded through
 * `headers()` in application code, which this app never does. Without that, a nonce that
 * changes every request just breaks on any cached response (the HTML — including inline
 * script tags — is cached with an old nonce baked in, while the CSP response header for a
 * later cache hit carries a freshly-generated one), silently killing hydration on every cache
 * HIT. Using a static allow-list instead keeps full-route caching working.
 */
export function buildCspHeader(): string {
  const rpcHosts = getRpcHostnames().map((h) => `https://${h}`);
  const explorerHost = "https://explorer.solana.com";
  const irysHosts = ["https://uploader.irys.xyz", "https://gateway.irys.xyz", "https://node1.irys.xyz", "https://devnet.irys.xyz"];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...ANALYTICS_SCRIPT_HOSTS],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
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
