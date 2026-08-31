#!/usr/bin/env node
console.error("Do not connect this domain to Vercel. Production is Cloudflare Workers.");
console.error("Use: pnpm cf:dns   and   pnpm cf:deploy");
process.exit(1);
