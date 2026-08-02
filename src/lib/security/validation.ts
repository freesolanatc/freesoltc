import { z } from "zod";
import { BASE58_ALPHABET, VANITY_MAX_CHARS, VANITY_MIN_CHARS } from "@/types/vanity";

const base58Regex = new RegExp(`^[${BASE58_ALPHABET}]+$`);
const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const solanaAddressSchema = z
  .string()
  .trim()
  .regex(solanaAddressRegex, "Enter a valid Solana address");

export const socialLinksSchema = z.object({
  website: z.union([z.string().trim().url(), z.literal("")]).optional(),
  twitter: z.union([z.string().trim().url(), z.literal("")]).optional(),
  telegram: z.union([z.string().trim().url(), z.literal("")]).optional(),
  discord: z.union([z.string().trim().url(), z.literal("")]).optional(),
});

export const vanityTextSchema = z
  .string()
  .min(VANITY_MIN_CHARS, `Enter at least ${VANITY_MIN_CHARS} character`)
  .max(VANITY_MAX_CHARS, `Maximum ${VANITY_MAX_CHARS} characters`)
  .regex(base58Regex, "Only Base58 characters are allowed (no 0, O, I, or l)");

export const tokenFormSchema = z
  .object({
    name: z.string().trim().min(1, "Token name is required").max(32, "Max 32 characters"),
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .max(10, "Max 10 characters")
      .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only"),
    decimals: z.coerce.number().int().min(0).max(9),
    initialSupply: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, "Enter a whole number")
      .refine((v) => BigInt(v) > 0n, "Supply must be greater than 0")
      .refine((v) => BigInt(v) <= 18446744073709551615n, "Supply exceeds the maximum token supply"),
    description: z.string().trim().max(500, "Max 500 characters").optional().default(""),
    social: socialLinksSchema.optional().default({}),
    revokeMintAuthority: z.boolean().default(false),
    revokeFreezeAuthority: z.boolean().default(false),
    claimCustomAddress: z.boolean().default(false),
    vanityMode: z.enum(["prefix", "suffix"]).default("prefix"),
    vanityText: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.claimCustomAddress) {
      const result = vanityTextSchema.safeParse(data.vanityText);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["vanityText"],
          message: result.error.issues[0]?.message ?? "Invalid vanity text",
        });
      }
    }
  });

export type TokenFormSchema = z.infer<typeof tokenFormSchema>;

export const verifyPaymentRequestSchema = z.object({
  signature: z.string().trim().min(32).max(128),
  payerPublicKey: solanaAddressSchema,
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000),
  // Honeypot field: real users never fill this in.
  company: z.string().max(0).optional().default(""),
});
