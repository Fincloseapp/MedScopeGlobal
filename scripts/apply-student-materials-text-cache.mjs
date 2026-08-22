#!/usr/bin/env node
/**
 * Retired. This script pulled a DB URL from Vercel env. Production is Cloudflare Workers;
 * apply SQL via Supabase, not Vercel project env.
 */
console.error("Vercel DB helper is retired. Production is Cloudflare Workers / Supabase.");
process.exit(1);
