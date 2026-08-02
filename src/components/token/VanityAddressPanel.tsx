"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BASE58_ALPHABET, VANITY_MAX_CHARS } from "@/types/vanity";
import { siteConfig } from "@/lib/site-config";
import type { TokenFormValues } from "@/types/token";

interface VanityAddressPanelProps {
  control: Control<TokenFormValues>;
  errors: FieldErrors<TokenFormValues>;
  vanityMode: "prefix" | "suffix";
  vanityText: string;
}

function buildPreview(mode: "prefix" | "suffix", text: string): string {
  const filler = "x".repeat(Math.max(0, 40 - text.length));
  return mode === "prefix" ? `${text}${filler}` : `${filler}${text}`;
}

export function VanityAddressPanel({ control, errors, vanityMode, vanityText }: VanityAddressPanelProps) {
  const preview = buildPreview(vanityMode, vanityText || "xxxx");

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <Alert className="border-primary/30 bg-transparent">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is the only paid feature on the site: a flat <strong>{siteConfig.vanityFeeSol} SOL</strong>{" "}
          platform fee, paid directly to our fee wallet before the search begins. Normal Solana
          network fees still apply separately for the token creation transaction itself.
        </AlertDescription>
      </Alert>

      <div>
        <Label className="mb-2 block">Position</Label>
        <Controller
          control={control}
          name="vanityMode"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="vanity-prefix"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
              >
                <RadioGroupItem value="prefix" id="vanity-prefix" />
                Prefix (start of address)
              </Label>
              <Label
                htmlFor="vanity-suffix"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
              >
                <RadioGroupItem value="suffix" id="vanity-suffix" />
                Suffix (end of address)
              </Label>
            </RadioGroup>
          )}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="vanity-text">Desired characters</Label>
          <span className="text-xs text-muted-foreground">
            {vanityText.length} / {VANITY_MAX_CHARS}
          </span>
        </div>
        <Controller
          control={control}
          name="vanityText"
          render={({ field }) => (
            <Input
              id="vanity-text"
              placeholder="e.g. DOGE"
              maxLength={VANITY_MAX_CHARS}
              value={field.value}
              onChange={(e) => {
                const filtered = Array.from(e.target.value)
                  .filter((ch) => BASE58_ALPHABET.includes(ch))
                  .slice(0, VANITY_MAX_CHARS)
                  .join("");
                field.onChange(filtered);
              }}
            />
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Base58 characters only (no 0, O, I, or l). 1&ndash;4 characters. Longer strings take
          exponentially longer to find.
        </p>
        {errors.vanityText && (
          <p className="mt-1 text-sm text-destructive">{errors.vanityText.message}</p>
        )}
      </div>

      <div>
        <Label className="mb-2 block text-xs text-muted-foreground">Live preview (illustrative only)</Label>
        <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
          {vanityMode === "prefix" ? (
            <>
              <span className="font-semibold text-primary">{vanityText || "xxxx"}</span>
              <span className="text-muted-foreground">{preview.slice((vanityText || "xxxx").length)}</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">
                {preview.slice(0, preview.length - (vanityText || "xxxx").length)}
              </span>
              <span className="font-semibold text-primary">{vanityText || "xxxx"}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
