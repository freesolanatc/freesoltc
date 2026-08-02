"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/utils";

export function WalletAddressBadge({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Badge
      variant="secondary"
      className="cursor-pointer gap-1.5 font-mono"
      onClick={handleCopy}
      title={address}
    >
      {truncateAddress(address)}
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Badge>
  );
}
