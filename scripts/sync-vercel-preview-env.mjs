#!/usr/bin/env node
/**
 * Copy production-scoped env vars to Preview on Vercel (presence + values from .env.local).
 * Fixes HTTP 500 when preview deployments are aliased to production domains.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VERCEL_SYNC_KEYS } from "./env-keys.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
for (const f of [".env.local", ".env"]) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const token = env.VERCEL_TOKEN;
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
if (!token) throw new Error("Missing VERCEL_TOKEN");

const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";

function isSecret(key) {
  return (
    key.includes("SECRET") ||
    key.includes("PASSWORD") ||
    (key.includes("KEY") && !key.startsWith("NEXT_PUBLIC_"))
  );
}

let ok = 0;
let fail = 0;

for (const key of VERCEL_SYNC_KEYS) {
  const value = env[key];
  if (!value) {
    console.log(`○ skip ${key} (empty local)`);
    continue;
  }

  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: isSecret(key) ? "encrypted" : "plain",
      target: ["preview"],
    }),
  });

  if (res.ok) {
    console.log(`✓ ${key} [preview]`);
    ok++;
  } else {
    const err = await res.text();
    if (res.status === 409 || err.includes("already exists")) {
      console.log(`~ ${key} [preview] (exists — update in Vercel dashboard if stale)`);
      ok++;
    } else {
      console.log(`✗ ${key} [preview] ${res.status}: ${err.slice(0, 120)}`);
      fail++;
    }
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
