"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { Adapter } from "@solana/wallet-adapter-base";
import { siteConfig } from "@/lib/site-config";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvidersWrapper({ children }: { children: React.ReactNode }) {
  // Phantom, Solflare, Backpack, Glow, and every other modern Solana wallet extension
  // auto-registers itself via the Wallet Standard, which wallet-adapter-react detects
  // automatically. Instantiating legacy adapter classes alongside that would produce
  // duplicate entries in the wallet modal, so we intentionally pass an empty list here.
  const wallets: Adapter[] = [];

  return (
    <ConnectionProvider endpoint={siteConfig.rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect localStorageKey="fstc-wallet">
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
