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
  const rpcHostnames = getRpcHostnames();
  // Both schemes are needed: @solana/web3.js's Connection uses plain HTTPS for RPC calls but
  // opens a WebSocket (wss://) to the same host for signature/account subscriptions (e.g. the
  // confirmTransaction call every send goes through). Without the wss:// entry, the browser
  // silently blocks that subscription per CSP, degrading confirmation to slow/unreliable HTTP
  // polling with no visible error — just a stuck "confirming" state.
  const rpcHosts = [
    ...rpcHostnames.map((h) => `https://${h}`),
    ...rpcHostnames.map((h) => `wss://${h}`),
  ];
  const explorerHost = "https://explorer.solana.com";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...ANALYTICS_SCRIPT_HOSTS],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      ...rpcHosts,
      ...ANALYTICS_CONNECT_HOSTS,
      "https://*.solana.com",
      // Solana Mobile Wallet Adapter (used automatically on Android mobile browsers) opens a
      // loopback WebSocket back to the wallet app on the same device, on a session-specific
      // port, to deliver the actual connect/sign request after the wallet app is opened via
      // deep link. Without this, the wallet app opens (that's an OS intent, not subject to CSP)
      // but the browser silently blocks the handshake that carries the request itself — the
      // wallet has nothing to show and the connect flow just goes nowhere.
      "ws://localhost:*",
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
