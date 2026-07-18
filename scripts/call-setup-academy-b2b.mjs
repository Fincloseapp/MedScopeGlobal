#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2] || ".env.local";
const env = {};
for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[m[1].trim()] = v;
}

function meta(k) {
  const v = env[k] || "";
  const ph =
    ["[SENSITIVE]", "[REDACTED]", "******"].includes(v) || v.startsWith("@");
  let host = "";
  try {
    if (/^postgres/i.test(v)) host = new URL(v).hostname;
  } catch {
    /* ignore */
  }
  console.log(
    k + ": len=" + v.length + " placeholder=" + ph + (host ? " host=" + host : "")
  );
}

for (const k of [
  "CRON_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_HOST",
  "POSTGRES_PASSWORD",
  "POSTGRES_USER",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
]) {
  meta(k);
}

const cron = env.CRON_SECRET;
if (!cron || cron === "[SENSITIVE]" || cron.length < 8) {
  console.error("no usable CRON_SECRET");
  process.exit(2);
}

const res = await fetch(
  "https://medscopeglobal.com/api/setup/academy-b2b-schema?secret=" +
    encodeURIComponent(cron)
);
const text = await res.text();
console.log("setup_status=" + res.status);
console.log("setup_body=" + text.slice(0, 1000));
process.exit(res.ok ? 0 : 1);
