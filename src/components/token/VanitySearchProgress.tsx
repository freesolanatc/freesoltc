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
  charCount: number;
  onCancel: () => void;
  cancelDisabled?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `~${Math.max(1, Math.round(seconds))}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `~${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)}min`;
  return `~${(minutes / 60).toFixed(1)}h`;
}

/**
 * Random search on a memoryless space (each attempt has the same odds regardless of how many
 * came before), so "time remaining" would be misleading — the number that's actually honest and
 * useful is the average total time implied by this device's own observed speed so far, letting
 * the user judge whether their machine is fast enough to be worth waiting on.
 */
function estimateAverageSeconds(charCount: number, attempts: number, elapsedMs: number): number | null {
  if (attempts < 500 || elapsedMs < 1000) return null; // not enough samples yet
  const attemptsPerSecond = attempts / (elapsedMs / 1000);
  const searchSpace = 58 ** charCount;
  return searchSpace / attemptsPerSecond;
}

export function VanitySearchProgress({ state, charCount, onCancel, cancelDisabled }: VanitySearchProgressProps) {
  const isActive =
    state.status === "awaiting-payment" ||
    state.status === "verifying-payment" ||
    state.status === "searching";

  const estimatedAverageSeconds =
    state.status === "searching" ? estimateAverageSeconds(charCount, state.attempts, state.elapsedMs) : null;

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
          {estimatedAverageSeconds !== null && (
            <>
              {" "}
              &middot; at this device&apos;s current speed, average expected time is{" "}
              {formatDuration(estimatedAverageSeconds)}
            </>
          )}
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
