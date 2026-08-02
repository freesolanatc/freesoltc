"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VanitySearchState } from "@/types/vanity";

const STATUS_LABELS: Record<VanitySearchState["status"], string> = {
  idle: "Idle",
  "awaiting-payment": "Awaiting payment approval in your wallet...",
  "verifying-payment": "Verifying payment on-chain...",
  searching: "Searching for a matching address...",
  found: "Match found!",
  canceled: "Search canceled.",
  error: "Search failed.",
};

interface VanitySearchProgressProps {
  state: VanitySearchState;
  onCancel: () => void;
  cancelDisabled?: boolean;
}

export function VanitySearchProgress({ state, onCancel, cancelDisabled }: VanitySearchProgressProps) {
  const isActive =
    state.status === "awaiting-payment" ||
    state.status === "verifying-payment" ||
    state.status === "searching";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {isActive && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {state.status === "found" && <Sparkles className="h-4 w-4 text-primary" />}
        {STATUS_LABELS[state.status]}
      </div>

      {state.status === "searching" && (
        <div className="text-xs text-muted-foreground">
          {state.attempts.toLocaleString()} addresses checked &middot;{" "}
          {(state.elapsedMs / 1000).toFixed(1)}s elapsed
        </div>
      )}

      {state.status === "found" && state.result && (
        <p className="break-all font-mono text-xs text-muted-foreground">{state.result.publicKey}</p>
      )}

      {state.status === "error" && state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      {isActive && (
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={cancelDisabled}>
          Cancel
        </Button>
      )}
    </div>
  );
}
