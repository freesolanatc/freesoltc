"use client";

import type { Control, FieldErrors, UseFormWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VanityAddressPanel } from "@/components/token/VanityAddressPanel";
import { siteConfig } from "@/lib/site-config";
import type { TokenFormValues } from "@/types/token";

interface AdvancedOptionsPanelProps {
  control: Control<TokenFormValues>;
  errors: FieldErrors<TokenFormValues>;
  watch: UseFormWatch<TokenFormValues>;
}

export function AdvancedOptionsPanel({ control, errors, watch }: AdvancedOptionsPanelProps) {
  const claimCustomAddress = watch("claimCustomAddress");
  const vanityMode = watch("vanityMode");
  const vanityText = watch("vanityText");

  return (
    <div className="space-y-4 rounded-xl border border-border/60 p-5">
      <h3 className="font-semibold">Advanced Options</h3>

      <OptionRow
        control={control}
        name="revokeMintAuthority"
        title="Revoke Mint Authority after token creation"
        description="Permanently disables the ability to mint new supply. Builds holder trust."
        badge="Free"
      />

      <OptionRow
        control={control}
        name="revokeFreezeAuthority"
        title="Revoke Freeze Authority after token creation"
        description="Permanently disables the ability to freeze holder accounts."
        badge="Free"
      />

      <OptionRow
        control={control}
        name="claimCustomAddress"
        title="Claim Custom Address"
        description="Choose a custom prefix or suffix for your token's contract address."
        badge={`${siteConfig.vanityFeeSol} SOL`}
        badgeVariant="default"
      />

      {claimCustomAddress && (
        <VanityAddressPanel
          control={control}
          errors={errors}
          vanityMode={vanityMode}
          vanityText={vanityText}
        />
      )}
    </div>
  );
}

function OptionRow({
  control,
  name,
  title,
  description,
  badge,
  badgeVariant = "secondary",
}: {
  control: Control<TokenFormValues>;
  name: "revokeMintAuthority" | "revokeFreezeAuthority" | "claimCustomAddress";
  title: string;
  description: string;
  badge: string;
  badgeVariant?: "default" | "secondary";
}) {
  return (
    <Label
      htmlFor={name}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-4 hover:bg-muted/40"
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            className="mt-0.5"
          />
        )}
      />
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          <Badge variant={badgeVariant}>{badge}</Badge>
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
      </span>
    </Label>
  );
}
