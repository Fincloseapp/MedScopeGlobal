#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CLOUDFLARE_SYNC_KEYS } from "../env-keys.mjs";

const src = existsSync(".env.local") ? ".env.local" : null;
if (!src) {
  console.error("Missing .env.local");
  process.exit(1);
}
const env = {};
for (const line of readFileSync(src, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const out = { NEXTJS_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://medscopeglobal.com" };
for (const key of CLOUDFLARE_SYNC_KEYS) {
  if (env[key] != null && env[key] !== "") out[key] = env[key];
}
// Common aliases
if (env.SUPABASE_URL && !out.NEXT_PUBLIC_SUPABASE_URL) out.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_URL;
writeFileSync("scripts/cloudflare/.env.cloudflare.json", JSON.stringify(out, null, 2));
console.log(`Wrote scripts/cloudflare/.env.cloudflare.json (${Object.keys(out).length} keys)`);
console.log("Add this JSON as GitHub secret CLOUDFLARE_ENV_JSON (or paste into Cloudflare dashboard secrets).");