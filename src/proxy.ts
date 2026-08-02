import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildCspHeader } from "@/lib/security/csp";

/**
 * Next.js 16 renamed middleware.ts -> proxy.ts. Proxy always runs on the Node.js runtime
 * (no Edge option here), which is fine for header injection.
 */
export function proxy(_request: NextRequest) {
  const csp = buildCspHeader();

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
