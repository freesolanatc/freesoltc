"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionStatusStepper } from "@/components/token/TransactionStatusStepper";
import { VanitySearchProgress } from "@/components/token/VanitySearchProgress";
import { buildFlowSteps } from "@/hooks/useTokenCreationFlow";
import type { FlowStatus } from "@/hooks/useTokenCreationFlow";
import type { VanitySearchState } from "@/types/vanity";

interface TokenCreationFlowDialogProps {
  open: boolean;
  status: FlowStatus;
  error: string | null;
  hasVanity: boolean;
  vanitySearchState: VanitySearchState;
  onCancel: () => void;
  onClose: () => void;
}

export function TokenCreationFlowDialog({
  open,
  status,
  error,
  hasVanity,
  vanitySearchState,
  onCancel,
  onClose,
}: TokenCreationFlowDialogProps) {
  const steps = buildFlowSteps(status, hasVanity);
  const canCancel = status !== "awaiting-signature" && status !== "confirming" && status !== "error";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Creating your token</DialogTitle>
          <DialogDescription>
            Keep this window open. You&apos;ll be prompted in your wallet for each approval.
          </DialogDescription>
        </DialogHeader>

        <TransactionStatusStepper steps={steps} />

        {status === "searching-vanity" && (
          <VanitySearchProgress state={vanitySearchState} onCancel={onCancel} />
        )}

        {status === "error" && error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          {status === "error" ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            canCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
