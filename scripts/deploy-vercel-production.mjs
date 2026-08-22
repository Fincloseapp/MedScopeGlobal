#!/usr/bin/env node
/**
 * Retired. Production is Cloudflare Workers (OpenNext), Worker medscopeglobal.
 * Local PC upload stays on D: via `npm run deploy` (scripts/deploy-production.mjs).
 */
console.error("Vercel production deploy is retired. Production is Cloudflare Workers.");
console.error("Use: npm run deploy    # D: in-place OpenNext + wrangler");
console.error("  or: npm run cf:deploy");
process.exit(1);
