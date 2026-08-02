"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background p-4 shadow-lg">
          <nav className="flex flex-col gap-3" aria-label="Mobile primary">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="mt-4 sm:hidden">
            <WalletConnectButton />
          </div>
        </div>
      )}
    </div>
  );
}
