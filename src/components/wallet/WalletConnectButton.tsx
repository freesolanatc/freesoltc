"use client";

import dynamic from "next/dynamic";

// wallet-adapter-react-ui's button reaches into browser-only wallet APIs, so it must never
// be server-rendered.
export const WalletConnectButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
