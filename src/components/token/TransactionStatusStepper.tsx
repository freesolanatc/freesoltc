import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionStep } from "@/types/solana";

export function TransactionStatusStepper({ steps }: { steps: TransactionStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
              step.status === "success" && "border-green-500 bg-green-500/10 text-green-500",
              step.status === "error" && "border-destructive bg-destructive/10 text-destructive",
              step.status === "active" && "border-primary bg-primary/10 text-primary",
              step.status === "pending" && "border-border text-muted-foreground"
            )}
          >
            {step.status === "success" && <Check className="h-3.5 w-3.5" />}
            {step.status === "error" && <X className="h-3.5 w-3.5" />}
            {step.status === "active" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {step.status === "pending" && index + 1}
          </span>
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground">{step.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
