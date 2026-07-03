#!/usr/bin/env node
/**
 * Migrate legacy personal author names → unified editorial units.
 * Usage: node scripts/migrate-authors-to-units.mjs [--dry-run] [--limit=N]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  assignEditorialUnits,
  buildEditorialMetadataPatch,
  formatEditorialUnitDisplay,
  LEGACY_DEFAULT_UNIT,
  LEGACY_PERSONAL_NAME_PATTERNS,
  PERSONA_STYLE_TO_CZ_UNIT,
  resolveLegacyUnitFromText,
} from "../lib/editorial/units.scripts.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "..");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const pageSize = limitArg ? Number(limitArg.split("=")[1]) : 200;

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const LEGACY_NAME_RE = new RegExp(
  LEGACY_PERSONAL_NAME_PATTERNS.map((p) => p.pattern.source).join("|"),
  "i"
);

function stripPersonalBylinesFromHtml(html) {
  let out = String(html ?? "");
  for (const { pattern } of LEGACY_PERSONAL_NAME_PATTERNS) {
    out = out.replace(new RegExp(`<p class="article-byline"[^>]*>[^<]*${pattern.source}[^<]*</p>`, "gi"), "");
  }
  out = out.replace(
    /<p class="article-byline"[^>]*><em>[^<]*(?:redaktork|redaktor|analytič|novinář|popularizátor|MUDr\.|Bc\.|Ing\.|Dr\.)[^<]*<\/em><\/p>/gi,
    ""
  );
  return out;
}

function resolveUnitForRow(row) {
  const meta = row.metadata ?? {};
  if (meta.editorial_unit_primary) {
    return assignEditorialUnits(row);
  }

  const hay = [
    meta.author_byline,
    meta.author_display_name,
    meta.author_persona,
    row.source_name,
    row.content?.slice?.(0, 500),
  ]
    .filter(Boolean)
    .join(" ");

  const fromText = resolveLegacyUnitFromText(hay);
  if (fromText) {
    return assignEditorialUnits({
      ...row,
      metadata: { ...meta, editorial_unit_primary: fromText },
    });
  }

  if (meta.author_persona && PERSONA_STYLE_TO_CZ_UNIT[meta.author_persona]) {
    return assignEditorialUnits(row);
  }

  if (LEGACY_NAME_RE.test(hay)) {
    return assignEditorialUnits(row);
  }

  return assignEditorialUnits({
    ...row,
    ai_generated: row.ai_generated ?? true,
    metadata: meta,
  });
}

function rowNeedsMigration(row) {
  const meta = row.metadata ?? {};
  if (!meta.editorial_unit_primary) return true;
  const hay = [row.source_name, row.content?.slice?.(0, 800), meta.author_byline, meta.author_display_name]
    .filter(Boolean)
    .join(" ");
  return LEGACY_NAME_RE.test(hay);
}

async function fetchAllArticles() {
  const all = [];
  let offset = 0;
  while (true) {
    const { data: rows, error } = await admin
      .from("articles")
      .select(
        "id, title, slug, content, source_name, locale, audience, rubric_slug, public_topic, min_access_level, ai_generated, metadata"
      )
      .order("published_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);
    if (!rows?.length) break;
    all.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function main() {
  const rows = await fetchAllArticles();

  let updated = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    if (!rowNeedsMigration(row)) {
      skipped++;
      continue;
    }
    const assignment = resolveUnitForRow(row) ?? assignEditorialUnits(row);

    const metaPatch = buildEditorialMetadataPatch(assignment);
    const newMeta = {
      ...(row.metadata ?? {}),
      ...metaPatch,
      writing_style: row.metadata?.author_persona ?? row.metadata?.writing_style ?? null,
      migrated_editorial_units_at: new Date().toISOString(),
    };

    const primaryLabel = formatEditorialUnitDisplay(
      assignment.primary ?? LEGACY_DEFAULT_UNIT,
      "cs",
      assignment.aiAssisted
    );
    const cleanedContent = stripPersonalBylinesFromHtml(row.content);

    const payload = {
      source_name: primaryLabel,
      ai_generated: assignment.aiAssisted,
      content: cleanedContent,
      metadata: newMeta,
      updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      console.log(JSON.stringify({ slug: row.slug, primary: assignment.primary, ai: assignment.aiAssisted }));
      updated++;
      continue;
    }

    const { error: upErr } = await admin.from("articles").update(payload).eq("id", row.id);
    if (upErr) {
      console.error(`Failed ${row.slug}:`, upErr.message);
      continue;
    }
    updated++;
  }

  console.log(
    JSON.stringify({
      ok: true,
      dryRun,
      scanned: rows?.length ?? 0,
      updated,
      skipped,
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
