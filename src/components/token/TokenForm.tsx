"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { ImageUploadField } from "@/components/token/ImageUploadField";
import { SocialLinksFields } from "@/components/token/SocialLinksFields";
import { AdvancedOptionsPanel } from "@/components/token/AdvancedOptionsPanel";
import { TokenCreationSummary } from "@/components/token/TokenCreationSummary";
import { TokenCreationFlowDialog } from "@/components/token/TokenCreationFlowDialog";
import { TokenSuccessCard } from "@/components/token/TokenSuccessCard";
import { tokenFormSchema } from "@/lib/security/validation";
import { useTokenCreationFlow } from "@/hooks/useTokenCreationFlow";
import type { TokenFormValues } from "@/types/token";

const DEFAULT_VALUES: TokenFormValues = {
  name: "",
  symbol: "",
  decimals: 9,
  initialSupply: "1000000000",
  description: "",
  image: null,
  social: {},
  revokeMintAuthority: false,
  revokeFreezeAuthority: false,
  claimCustomAddress: false,
  vanityMode: "prefix",
  vanityText: "",
};

export function TokenForm() {
  const { connected } = useWallet();
  const flow = useTokenCreationFlow();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema) as never,
    defaultValues: DEFAULT_VALUES,
  });

  const values = watch();
  const isFlowRunning = flow.status !== "idle" && flow.status !== "success" && flow.status !== "error";

  const onSubmit = handleSubmit((data) => {
    flow.submit(data);
  });

  if (flow.status === "success" && flow.result) {
    return (
      <TokenSuccessCard
        result={flow.result}
        onCreateAnother={() => {
          flow.reset();
          reset(DEFAULT_VALUES);
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Token Name</Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input id="name" placeholder="My Awesome Token" className="mt-1.5" {...field} />
            )}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="symbol">Symbol</Label>
          <Controller
            control={control}
            name="symbol"
            render={({ field }) => (
              <Input
                id="symbol"
                placeholder="MAT"
                className="mt-1.5 uppercase"
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            )}
          />
          {errors.symbol && <p className="mt-1 text-sm text-destructive">{errors.symbol.message}</p>}
        </div>

        <div>
          <Label htmlFor="decimals">Decimals</Label>
          <Controller
            control={control}
            name="decimals"
            render={({ field }) => (
              <Input
                id="decimals"
                type="number"
                min={0}
                max={9}
                className="mt-1.5"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {errors.decimals && (
            <p className="mt-1 text-sm text-destructive">{errors.decimals.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="initialSupply">Initial Supply</Label>
          <Controller
            control={control}
            name="initialSupply"
            render={({ field }) => (
              <Input id="initialSupply" inputMode="numeric" className="mt-1.5" {...field} />
            )}
          />
          {errors.initialSupply && (
            <p className="mt-1 text-sm text-destructive">{errors.initialSupply.message}</p>
          )}
        </div>
      </div>

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageUploadField
            value={field.value}
            onChange={field.onChange}
            error={errors.image?.message as string | undefined}
          />
        )}
      />

      <div>
        <Label htmlFor="description">Description</Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder="Tell people what your token is about..."
              className="mt-1.5"
              rows={4}
              {...field}
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Social Links (optional)</h3>
        <SocialLinksFields control={control} errors={errors} />
      </div>

      <AdvancedOptionsPanel control={control} errors={errors} watch={watch} />

      <TokenCreationSummary values={values} />

      {flow.status === "error" && flow.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {flow.error}
        </p>
      )}

      {connected ? (
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || isFlowRunning}>
          {values.claimCustomAddress ? "Pay Fee & Create Token" : "Create Token"}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Connect your wallet to create a token.</p>
          <WalletConnectButton />
        </div>
      )}

      <TokenCreationFlowDialog
        open={isFlowRunning || flow.status === "error"}
        status={flow.status}
        error={flow.error}
        hasVanity={values.claimCustomAddress}
        vanitySearchState={flow.vanitySearchState}
        onCancel={flow.cancel}
        onClose={flow.reset}
      />
    </form>
  );
}
