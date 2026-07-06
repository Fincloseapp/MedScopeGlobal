#!/usr/bin/env npx tsx
/** Scan + optionally backfill recent articles missing v26.3 editorial standard */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { runV26RewriteBackfill } from "@/lib/v26/backfill";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const args = process.argv.slice(2);
const scanOnly = args.includes("--scan-only");
const batch = Number(args.find((a) => a.startsWith("--batch="))?.split("=")[1] ?? 12);
const days = Number(args.find((a) => a.startsWith("--days="))?.split("=")[1] ?? 14);

async function scanRecent() {
  const admin = createServiceRoleClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await admin
    .from("articles")
    .select("id, slug, title, published_at, metadata, content, excerpt")
    .eq("published", true)
    .eq("audience", "public")
    .gte("published_at", since.toISOString())
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const notV263 = rows.filter((a) => (a.metadata as Record<string, unknown>)?.editorial_version !== "26.3.0");
  const short = rows.filter((a) => (a.content?.length ?? 0) < 2500);

  return {
    days,
    total: rows.length,
    notV263: notV263.length,
    shortContent: short.length,
    samples: notV263.slice(0, 5).map((a) => ({
      slug: a.slug,
      version: (a.metadata as Record<string, unknown>)?.editorial_version ?? null,
      len: a.content?.length ?? 0,
      title: a.title?.slice(0, 70),
    })),
  };
}

async function main() {
  const scan = await scanRecent();
  console.log("=== RECENT SCAN ===");
  console.log(JSON.stringify(scan, null, 2));

  if (scanOnly) return;

  console.log(`\n=== V26 BACKFILL (batch=${batch}, audience=public, days=${days}) ===`);
  const result = await runV26RewriteBackfill({ batchSize: batch, audience: "public", days });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
