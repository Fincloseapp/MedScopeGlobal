#!/usr/bin/env node
/**
 * Pre-extract text for legacy LF1 study materials (DOC, RTF, PPT, ZIP, RAR).
 * Stores results in student_materials.extracted_text for serverless reading mode.
 *
 * Usage:
 *   node scripts/extract-student-material-text.mjs [--dry-run] [--only=doc] [--limit=50]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import WordExtractor from "word-extractor";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1]?.toLowerCase();
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0") || 0;

const TARGET_TYPES = ["doc", "rtf", "ppt", "pptx", "zip", "rar", "7z"];
const extractor = new WordExtractor();

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = fs.readFileSync(path.join(root, f), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* ignore */
    }
  }
}

function normalize(text) {
  return String(text ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchBytes(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MedScopeGlobal/1.0 (material-text-batch)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function extractDoc(buffer) {
  const extracted = await extractor.extract(buffer);
  return normalize(
    [extracted.getBody(), extracted.getHeaders(), extracted.getFootnotes(), extracted.getEndnotes()]
      .map((p) => String(p ?? "").trim())
      .filter(Boolean)
      .join("\n\n")
  );
}

function extractRtf(buffer) {
  let rtf = buffer.toString("latin1");
  rtf = rtf.replace(/\\'([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  rtf = rtf.replace(/\\par[d]?/gi, "\n");
  rtf = rtf.replace(/\\tab/gi, "\t");
  rtf = rtf.replace(/\\[a-z]+(-?\d+)?[ ]?/gi, "");
  rtf = rtf.replace(/[{}]/g, "");
  rtf = rtf.replace(/\\([\\{}])/g, "$1");
  return normalize(rtf);
}

async function listZip(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const names = Object.keys(zip.files)
    .filter((n) => !zip.files[n].dir)
    .sort((a, b) => a.localeCompare(b, "cs"));
  if (!names.length) return "Archiv ZIP neobsahuje žádné soubory.";
  return normalize(
    `Obsah archivu ZIP (${names.length} souborů):\n\n${names.map((n) => `• ${n}`).join("\n")}`
  );
}

function listRar(buffer) {
  const names = new Set();
  const latin = buffer.toString("latin1");
  const re = /[\w\u0080-\u024F][\w\u0080-\u024F\s.\-_()]{0,120}\.(pdf|doc|docx|ppt|pptx|txt|rtf|zip|rar|7z|jpg|png|xls|xlsx|bmp|gif)/gi;
  for (const match of latin.matchAll(re)) names.add(match[0].trim());
  const unique = [...names].sort((a, b) => a.localeCompare(b, "cs"));
  if (!unique.length) {
    return "Archiv RAR — seznam souborů se nepodařilo načíst. Stáhněte archiv pro plný obsah.";
  }
  return normalize(
    `Obsah archivu RAR (${unique.length} souborů):\n\n${unique.map((n) => `• ${n}`).join("\n")}`
  );
}

function extractPpt(buffer) {
  const chunks = new Set();
  const utf16 = buffer.toString("utf16le");
  const utf16Matches = utf16.match(/[\p{L}\p{N}][\p{L}\p{N}\s.,;:!?\-–—()[\]/]{8,}/gu);
  if (utf16Matches) utf16Matches.forEach((m) => chunks.add(m.trim()));
  const latin = buffer.toString("latin1");
  const latinMatches = latin.match(/[A-Za-zÁ-Žá-ž0-9][A-Za-zÁ-Žá-ž0-9\s.,;:!?\-–—()[\]/]{8,}/g);
  if (latinMatches) latinMatches.forEach((m) => chunks.add(m.trim()));
  const deduped = [...chunks]
    .filter((c) => c.length >= 12 && !/^Microsoft PowerPoint/i.test(c))
    .slice(0, 200);
  if (!deduped.length) throw new Error("empty ppt");
  return normalize(deduped.join("\n\n"));
}

async function extractMaterial(row) {
  const fileType = (row.file_type ?? "").toLowerCase();
  const buffer = await fetchBytes(row.external_url);

  if (fileType === "doc") return { kind: "text", content: await extractDoc(buffer) };
  if (fileType === "rtf") return { kind: "text", content: extractRtf(buffer) };
  if (fileType === "ppt" || fileType === "pptx") return { kind: "text", content: extractPpt(buffer) };
  if (fileType === "zip") return { kind: "text", content: await listZip(buffer) };
  if (fileType === "rar" || fileType === "7z") return { kind: "text", content: listRar(buffer) };
  throw new Error(`unsupported type: ${fileType}`);
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let query = supabase
  .from("student_materials")
  .select("id, title, file_type, external_url, extracted_text")
  .eq("is_active", true)
  .is("extracted_text", null)
  .in("file_type", ONLY ? [ONLY] : TARGET_TYPES)
  .order("file_type")
  .order("title");

if (LIMIT > 0) query = query.limit(LIMIT);

const { data: rows, error } = await query;
if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

console.log(`Found ${rows?.length ?? 0} materials to extract${DRY_RUN ? " (dry run)" : ""}`);
const stats = { ok: 0, fail: 0, skip: 0 };

for (const row of rows ?? []) {
  const label = `[${row.file_type}] ${row.title.slice(0, 60)}`;
  try {
    const { kind, content } = await extractMaterial(row);
    if (!content || content.length < 20) {
      console.log(`SKIP (too short) ${label}`);
      stats.skip++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`OK (dry) ${label} — ${content.length} chars`);
      stats.ok++;
      continue;
    }
    const { error: upErr } = await supabase
      .from("student_materials")
      .update({
        extracted_text: content,
        extracted_kind: kind,
        text_extracted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (upErr) throw upErr;
    console.log(`OK ${label} — ${content.length} chars`);
    stats.ok++;
  } catch (e) {
    console.error(`FAIL ${label}:`, e.message ?? e);
    stats.fail++;
  }
}

console.log(JSON.stringify({ ...stats, total: rows?.length ?? 0 }, null, 2));
