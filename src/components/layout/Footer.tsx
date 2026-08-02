import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                S
              </span>
              {siteConfig.name}
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Create Solana SPL tokens for free. No platform fee for token creation or authority
              revocation — you only ever pay the Solana network fee.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {siteConfig.footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Non-custodial. Your keys, your tokens — we never hold your funds.</p>
        </div>
      </div>
    </footer>
  );
}
