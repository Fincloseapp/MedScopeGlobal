#!/usr/bin/env node
/**
 * Writes .dev.vars from CLOUDFLARE_ENV_JSON (object of key->value).
 * Used by CI so Wrangler/OpenNext can inject secrets at build/deploy.
 */
import { writeFileSync } from "node:fs";

const raw = process.env.CLOUDFLARE_ENV_JSON;
if (!raw) {
  console.error("CLOUDFLARE_ENV_JSON missing");
  process.exit(1);
}
const obj = JSON.parse(raw);
if (!obj || typeof obj !== "object") {
  console.error("CLOUDFLARE_ENV_JSON must be a JSON object");
  process.exit(1);
}
const lines = Object.entries(obj).map(([k, v]) => `${k}=${String(v ?? "")}`);
if (!lines.some((l) => l.startsWith("NEXTJS_ENV="))) {
  lines.unshift("NEXTJS_ENV=production");
}
writeFileSync(".dev.vars", lines.join("\n") + "\n", "utf8");
console.log(`Wrote .dev.vars (${lines.length} keys)`);