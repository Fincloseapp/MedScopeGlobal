/**
 * Post-deploy: apply student_materials schema + run LF1 import on production.
 * Usage: node scripts/run-lf1-production-setup.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const bases = [
  "https://medscopeglobal.com",
  (env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, ""),
].filter(Boolean);
const secret = env.CRON_SECRET;
if (!secret) {
  console.error("Missing CRON_SECRET");
  process.exit(1);
}

async function call(base, pathname) {
  const url = `${base}${pathname}`;
  console.log(`→ ${url.replace(secret, "***")}`);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 800);
  }
  console.log(res.status, typeof body === "string" ? body : JSON.stringify(body, null, 2));
  if (!res.ok) return null;
  return body;
}

for (const base of [...new Set(bases)]) {
  const schema = await call(
    base,
    `/api/setup/student-materials-schema?secret=${encodeURIComponent(secret)}`
  );
  if (schema) {
    await call(base, `/api/cron/import-lf1-materials`);
    console.log("Production LF1 setup complete on", base);
    process.exit(0);
  }
}
console.error("All bases failed for schema setup.");
process.exit(1);
