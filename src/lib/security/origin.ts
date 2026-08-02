import type { NextRequest } from "next/server";
import { siteConfig } from "@/lib/site-config";

/**
 * Checks a request's Origin header against the configured site host. Accepts both the
 * `www.` and bare variants of that host regardless of which one NEXT_PUBLIC_SITE_URL is set
 * to — Vercel commonly redirects one to the other (e.g. apex -> www), so the browser's actual
 * Origin can legitimately differ from the configured value by just that prefix. Without this,
 * every state-changing API route 403s with "Invalid origin" whenever the two don't match
 * exactly, even though the request came from the real site.
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests from some clients omit Origin

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const configuredHost = new URL(siteConfig.url).host;
  const bareHost = configuredHost.replace(/^www\./, "");
  const allowedHosts = new Set([configuredHost, bareHost, `www.${bareHost}`]);

  return allowedHosts.has(originHost);
}
