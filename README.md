# Free Solana Token Creator

Create Solana SPL tokens for free — no platform fee, only the Solana network fee. Optionally
revoke mint and freeze authority for free, or claim a custom vanity token address for a flat
0.1 SOL fee. Fully non-custodial: every transaction is signed by the user's own wallet, and
vanity keypairs are generated entirely client-side and never touch the server.

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · React 19 · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · React Hook Form + Zod · Solana Wallet Adapter · @solana/web3.js ·
@solana/spl-token · Metaplex Token Metadata · Irys (client-side permanent storage) ·
next-mdx-remote (blog) · Upstash Redis (rate limiting / payment replay protection).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

See `.env.example` for the full list with descriptions. At minimum, for local development:

- `NEXT_PUBLIC_RPC_URL` — a Solana RPC endpoint (devnet recommended for local testing)
- `NEXT_PUBLIC_SOLANA_CLUSTER` — `devnet` or `mainnet-beta`
- `NEXT_PUBLIC_ADMIN_WALLET_ADDRESS` — the wallet that receives the 0.1 SOL vanity address fee
- `PAYMENT_VERIFICATION_SECRET` — any long random string

For production you additionally need:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — [Upstash Redis](https://console.upstash.com/redis)
  free tier, used for rate limiting and vanity-payment replay protection
- `NEXT_PUBLIC_SITE_URL` — your production domain, used for canonical URLs, sitemap, and OG tags

## Project structure

```
content/blog/*.mdx        Blog articles — add a new file here to publish a new post
src/app/                  Routes (App Router)
src/components/           UI components, grouped by feature area
src/lib/                  Solana instruction builders, SEO helpers, security/validation, MDX
src/hooks/                Client-side React hooks (wallet flow, vanity search, mint ownership)
src/workers/               vanity.worker.ts — client-side vanity address search
```

## Adding a blog article

Drop a new `.mdx` file into `content/blog/` with the frontmatter shape defined in
`src/lib/mdx/frontmatterSchema.ts` (validated at build time). It will automatically appear in
the blog index, sitemap, and RSS feed — no code changes required.

## Troubleshooting

If `npm run build` crashes with `JavaScript heap out of memory` on a memory-constrained
machine, cap Node's heap explicitly:

```bash
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

## Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
```

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket and import it in Vercel, or run `vercel`.
2. Set all required environment variables in the Vercel project settings (Production and
   Preview scopes as appropriate — e.g. keep `mainnet-beta` only in Production).
3. Add the [Upstash Redis](https://vercel.com/marketplace/upstash) integration (or set the
   `UPSTASH_REDIS_REST_*` env vars manually) for rate limiting and payment verification.
4. Deploy. After going live, submit `/sitemap.xml` to Google Search Console and Bing Webmaster
   Tools.

## Security notes

- The server never stores or has access to private keys. All signing happens in the user's
  wallet.
- Vanity address keypairs are generated in Web Workers in the browser and are never transmitted
  to the server.
- The `/api/vanity/verify-payment` route independently re-derives payment validity from
  on-chain data — it never trusts client-supplied amounts.
- See `src/proxy.ts` for the CSP and security headers applied to every response.
