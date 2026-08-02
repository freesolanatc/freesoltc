import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const clientSchema = z.object({
  NEXT_PUBLIC_RPC_URL: z.string().url().default("https://api.mainnet-beta.solana.com"),
  NEXT_PUBLIC_RPC_URL_FALLBACK: z.string().url().optional(),
  NEXT_PUBLIC_SOLANA_CLUSTER: z.enum(["mainnet-beta", "devnet", "testnet"]).default("mainnet-beta"),
  NEXT_PUBLIC_ADMIN_WALLET_ADDRESS: z
    .string()
    .min(32)
    .max(44)
    .refine((val) => /^[1-9A-HJ-NP-Za-km-z]+$/.test(val), {
      message: "NEXT_PUBLIC_ADMIN_WALLET_ADDRESS must be a valid Base58 Solana public key",
    }),
  NEXT_PUBLIC_VANITY_FEE_SOL: z.coerce.number().positive().default(0.1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("Free Solana Token Creator"),
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  PAYMENT_VERIFICATION_SECRET: z.string().min(16).optional(),
  IRYS_NETWORK: z.enum(["mainnet", "devnet"]).default("mainnet"),
  IRYS_PRIVATE_KEY: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_RECEIVER_EMAIL: z.string().email().optional(),
  SENTRY_DSN: z.string().optional(),
});

function parseClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_RPC_URL_FALLBACK: process.env.NEXT_PUBLIC_RPC_URL_FALLBACK,
    NEXT_PUBLIC_SOLANA_CLUSTER: process.env.NEXT_PUBLIC_SOLANA_CLUSTER,
    NEXT_PUBLIC_ADMIN_WALLET_ADDRESS: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
    NEXT_PUBLIC_VANITY_FEE_SOL: process.env.NEXT_PUBLIC_VANITY_FEE_SOL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  });

  if (!parsed.success) {
    const message = `Invalid client environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`;
    if (isProd) throw new Error(message);
    console.warn(message);
    return clientSchema.parse({
      NEXT_PUBLIC_ADMIN_WALLET_ADDRESS: "11111111111111111111111111111111",
    });
  }

  return parsed.data;
}

function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = `Invalid server environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`;
    console.warn(message);
  }
  return parsed.success ? parsed.data : serverSchema.parse({});
}

export const clientEnv = parseClientEnv();
export const serverEnv = typeof window === "undefined" ? parseServerEnv() : ({} as ReturnType<typeof parseServerEnv>);
