"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import type { Adapter } from "@solana/wallet-adapter-base";
import { siteConfig } from "@/lib/site-config";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvidersWrapper({ children }: { children: React.ReactNode }) {
  // Backpack, Glow, and every other modern Solana wallet extension auto-registers itself via
  // the Wallet Standard, which wallet-adapter-react detects automatically — no adapter class
  // needed for those. Phantom and Solflare are instantiated explicitly anyway because their
  // adapter classes carry mobile-browser fallback logic (redirecting into the wallet's own
  // in-app browser via a universal link) that Wallet Standard has no equivalent for, since it
  // only describes wallets that are already injected. wallet-adapter-react's
  // useStandardWalletAdapters automatically drops one of these in favor of the Standard-
  // registered version whenever a matching extension is actually installed, so this never
  // produces duplicate entries in the wallet modal.
  const wallets: Adapter[] = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={siteConfig.rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect localStorageKey="fstc-wallet">
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
