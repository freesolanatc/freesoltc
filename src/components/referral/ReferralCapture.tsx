"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const PENDING_REFERRER_KEY = "fstc-pending-referrer";
const REGISTERED_KEY_PREFIX = "fstc-referral-registered:";
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Mounted once near the root. Captures a first-touch ?ref=<wallet> into localStorage, then
 *  registers the referral (server-side, idempotent) the first time a wallet connects. Never
 *  moves funds or requires a signature — it's pure attribution bookkeeping. */
export function ReferralCapture() {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && SOLANA_ADDRESS_REGEX.test(ref) && !localStorage.getItem(PENDING_REFERRER_KEY)) {
      localStorage.setItem(PENDING_REFERRER_KEY, ref);
    }
  }, []);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const wallet = publicKey.toBase58();
    const referrer = localStorage.getItem(PENDING_REFERRER_KEY);
    if (!referrer || referrer === wallet) return;

    const registeredKey = `${REGISTERED_KEY_PREFIX}${wallet}`;
    if (localStorage.getItem(registeredKey)) return;

    fetch("/api/referral/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, referrer }),
    })
      .then(() => localStorage.setItem(registeredKey, "1"))
      .catch(() => {
        // best-effort — will retry next time this wallet connects
      });
  }, [connected, publicKey]);

  return null;
}
