#!/usr/bin/env node
/**
 * Retired. Production is Cloudflare Workers — set STRIPE_WEBHOOK_SECRET via
 * `npm run cf:env:sync` / Worker secrets, not Vercel.
 */
console.error("Vercel env sync is retired. Production is Cloudflare Workers.");
process.exit(1);
