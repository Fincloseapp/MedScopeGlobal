#!/usr/bin/env node
/**
 * Legacy helper — previously pointed medscopeglobal.com at Vercel (76.76.21.21).
 * Production DNS stays on Cloudflare Workers. Use: pnpm cf:dns
 */
console.error(`
Do not point DNS at Vercel.

medscopeglobal.com is served by Cloudflare Workers (wrangler.jsonc routes).
Run:  pnpm cf:dns
`);
process.exit(1);
