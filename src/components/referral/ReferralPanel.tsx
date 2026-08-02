"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Check, Copy, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { siteConfig } from "@/lib/site-config";

export function ReferralPanel() {
  const { publicKey, connected } = useWallet();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    fetch(`/api/points/me?wallet=${publicKey.toBase58()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReferralCount(data.referralCount ?? 0);
      })
      .catch(() => {
        // best-effort — the link still works even if we can't read the count
      });
  }, [publicKey]);

  const referralLink = useMemo(() => {
    if (!publicKey) return null;
    return new URL(`/?ref=${publicKey.toBase58()}`, siteConfig.url).toString();
  }, [publicKey]);

  const shareText = "Create Solana SPL tokens for free — no platform fee, only the network fee.";

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  if (!connected || !referralLink) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <Users className="h-6 w-6 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to generate your personal referral link.
        </p>
        <WalletConnectButton />
      </div>
    );
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-5 rounded-xl border border-border/60 bg-card p-6">
      {referralCount !== null && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <Users className="h-4 w-4 text-primary" aria-hidden />
          <span>
            You&apos;ve referred <strong>{referralCount}</strong>{" "}
            {referralCount === 1 ? "person" : "people"} &mdash; +{(referralCount * 50).toLocaleString()}{" "}
            points earned
          </span>
        </div>
      )}

      <div>
        <p className="text-sm font-medium">Your referral link</p>
        <div className="mt-2 flex items-center gap-2">
          <Input readOnly value={referralLink} onFocus={(e) => e.target.select()} className="font-mono text-xs sm:text-sm" />
          <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" asChild>
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer nofollow">
            <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Share on X
          </a>
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer nofollow">
            <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Share on Telegram
          </a>
        </Button>
      </div>
    </div>
  );
}
