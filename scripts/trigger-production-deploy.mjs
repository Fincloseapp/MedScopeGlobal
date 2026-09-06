#!/usr/bin/env node
/**
 * Trigger Cloudflare production deploy from GitHub ref.
 * Usage: node scripts/trigger-production-deploy.mjs [ref]
 *
 * Production deploys on push to main via .github/workflows/cloudflare-deploy.yml
 * or locally: pnpm cf:deploy
 */
const ref = process.argv[2] ?? "main";
console.log(`Production deploy is Cloudflare Workers (OpenNext).`);
console.log(`Push ${ref} to origin, or run: pnpm cf:deploy`);
console.log(`Workflow: .github/workflows/cloudflare-deploy.yml`);
console.log(`Site: https://medscopeglobal.com`);
