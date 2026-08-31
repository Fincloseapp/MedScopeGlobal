#!/usr/bin/env node
/**
 * Optional DB persist of magazine desk overrides.
 * Display path already applies the same copy after deploy.
 *
 *   pnpm exec tsx scripts/editorial/apply-magazine-desk-copy.ts [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MAGAZINE_DESK_OVERRIDES } from "../../lib/editorial/magazine-desk-overrides";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnv() {
  for (const name of [".env.local", ".env"] as const) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && process.env[m[1].trim()] == null) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!url || !serviceKey) {
  console.error("Missing Supabase credentials — display overrides still apply after deploy.");
  process.exit(0);
}

async function main() {
  let ok = 0;
  let failed = 0;
  for (const [slug, copy] of Object.entries(MAGAZINE_DESK_OVERRIDES)) {
    const patch: Record<string, string> = {
      title: copy.title,
      excerpt: copy.excerpt,
      source_name: "Redakce MedScopeGlobal",
    };
    if (copy.content) patch.content = copy.content;
    if (dryRun) {
      console.log("dry-run", slug, copy.title);
      ok += 1;
      continue;
    }
    const qs = new URLSearchParams({ slug: `eq.${slug}` });
    const res = await fetch(`${url}/rest/v1/articles?${qs}`, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      failed += 1;
      console.error(slug, res.status, await res.text());
    } else {
      ok += 1;
      console.log("updated", slug);
    }
  }

  console.log(`done ok=${ok} failed=${failed}`);
  if (failed) process.exit(1);
}

void main();
