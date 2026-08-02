"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TokenFormValues } from "@/types/token";

interface SocialLinksFieldsProps {
  control: Control<TokenFormValues>;
  errors: FieldErrors<TokenFormValues>;
}

const fields: { name: "website" | "twitter" | "telegram" | "discord"; label: string; placeholder: string }[] = [
  { name: "website", label: "Website", placeholder: "https://yourproject.com" },
  { name: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourproject" },
  { name: "telegram", label: "Telegram", placeholder: "https://t.me/yourproject" },
  { name: "discord", label: "Discord", placeholder: "https://discord.gg/yourproject" },
];

export function SocialLinksFields({ control, errors }: SocialLinksFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={`social-${field.name}`}>{field.label} (optional)</Label>
          <Controller
            control={control}
            name={`social.${field.name}`}
            render={({ field: controllerField }) => (
              <Input
                id={`social-${field.name}`}
                type="url"
                placeholder={field.placeholder}
                className="mt-1.5"
                value={controllerField.value ?? ""}
                onChange={controllerField.onChange}
              />
            )}
          />
          {errors.social?.[field.name] && (
            <p className="mt-1 text-sm text-destructive">{errors.social[field.name]?.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
