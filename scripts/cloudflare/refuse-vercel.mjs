#!/usr/bin/env node
/**
 * Production is Cloudflare Workers only (wrangler.jsonc, pnpm cf:deploy).
 * Vercel must not receive env, DNS, or deploys.
 */
console.error(`
Vercel is not used for medscopeglobal.com.

Production:
  pnpm cf:deploy          OpenNext → Cloudflare Workers
  pnpm cf:env:sync        env → Cloudflare
  pnpm cf:dns             DNS → Cloudflare Workers
  pnpm cf:smoke           production smoke

GitHub: .github/workflows/cloudflare-deploy.yml
`);
process.exit(1);
