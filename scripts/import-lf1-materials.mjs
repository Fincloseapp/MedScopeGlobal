/**
 * Import LF1.CZ study materials metadata into Supabase.
 *
 * LEGAL APPROACH (do not change without legal review):
 * - LF1.CZ hosts unofficial student-uploaded materials; no explicit open license.
 * - We store METADATA ONLY and deep-link to original files on lf1.cz.
 * - We do NOT download or re-host PDFs/DOCs in Supabase Storage.
 * - Attribution on every record: source_name, source_url, source_attribution.
 * - MedScopeGlobal is curator/index, NOT original publisher.
 * - Copyright remains with original authors / LF1.CZ uploaders.
 *
 * Usage: node scripts/import-lf1-materials.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

const LF1_BASE = "https://lf1.cz";
const LF1_SOURCE_PAGE = "https://lf1.cz/materialy-ke-stazeni/";
const SOURCE_ATTRIBUTION =
  "Zdroj: LF UK Praha — studentský portál LF1.CZ (lf1.cz). MedScopeGlobal pouze kurátoruje a odkazuje na originál.";

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

function normalizeUrl(href) {
  const trimmed = href.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.replace(/^\.\.\/\.\.\//, `${LF1_BASE}/`);
}

function fileTypeFromUrl(url) {
  const clean = url.split("?")[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "unknown";
}

function parseRocnik(header) {
  const m = header.trim().match(/^(\d+)\.\s*ročník$/i);
  if (m) return { rocnik: Number(m[1]), category: "rocnik" };
  if (/naposled/i.test(header)) return { rocnik: 0, category: "recent" };
  return { rocnik: null, category: "general" };
}

function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8222;/g, '"')
    .replace(/&#8220;/g, '"')
    .trim();
}

function extractEntryContent(html) {
  const start = html.indexOf('class="entry-content');
  if (start < 0) return html;
  const slice = html.slice(start);
  const end = slice.indexOf("</article>");
  return end >= 0 ? slice.slice(0, end) : slice;
}

function parseMaterials(html) {
  const content = extractEntryContent(html);
  const sections = content.split(/<h1[^>]*>/i).slice(1);
  const materials = [];
  const seen = new Set();

  for (const section of sections) {
    const headerEnd = section.indexOf("</h1>");
    if (headerEnd < 0) continue;
    const header = decodeHtml(section.slice(0, headerEnd).replace(/<[^>]+>/g, ""));
    const { rocnik, category } = parseRocnik(header);
    const body = section.slice(headerEnd);

    const rowRe =
      /<td>\s*([^<]+?)\s*<\/td>\s*<td>[\s\S]*?<a\s+href=(?:["'])?([^"'\s>]+)(?:["'])?[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = rowRe.exec(body)) !== null) {
      const subject = decodeHtml(match[1].replace(/<[^>]+>/g, ""));
      const externalUrl = normalizeUrl(match[2]);
      const title = decodeHtml(match[3].replace(/<[^>]+>/g, ""));

      if (!title || !externalUrl.includes("/wp-content/uploads/")) continue;

      const key = `${externalUrl}::${rocnik ?? "null"}`;
      if (seen.has(key)) continue;
      seen.add(key);

      materials.push({
        title,
        subject,
        rocnik,
        category,
        external_url: externalUrl,
        file_type: fileTypeFromUrl(externalUrl),
        source_name: "LF1.CZ",
        source_url: LF1_SOURCE_PAGE,
        source_attribution: SOURCE_ATTRIBUTION,
        hosting_mode: "external_link",
        is_active: true,
        scraped_at: new Date().toISOString(),
      });
    }
  }

  return materials;
}

function summarize(materials) {
  const byRocnik = {};
  const bySubject = {};
  for (const m of materials) {
    const key = m.rocnik === null ? "general" : String(m.rocnik);
    byRocnik[key] = (byRocnik[key] ?? 0) + 1;
    bySubject[m.subject] = (bySubject[m.subject] ?? 0) + 1;
  }
  return { byRocnik, bySubject, total: materials.length };
}

async function fetchLf1Page() {
  const res = await fetch(LF1_SOURCE_PAGE, {
    headers: { "User-Agent": "MedScopeGlobal-Indexer/1.0 (+https://medscopeglobal.com)" },
  });
  if (!res.ok) throw new Error(`LF1 fetch failed: ${res.status}`);
  return res.text();
}

async function upsertMaterials(supabase, materials) {
  const BATCH = 100;
  let upserted = 0;
  for (let i = 0; i < materials.length; i += BATCH) {
    const batch = materials.slice(i, i + BATCH);
    const { error } = await supabase.from("student_materials").upsert(batch, {
      onConflict: "external_url,rocnik",
    });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    upserted += batch.length;
    console.log(`  upserted ${upserted}/${materials.length}`);
  }
  return upserted;
}

async function main() {
  console.log("Fetching LF1.CZ materials page...");
  const html = await fetchLf1Page();
  const materials = parseMaterials(html);
  const summary = summarize(materials);

  console.log(`Parsed ${summary.total} materials`);
  console.log("By ročník:", summary.byRocnik);
  console.log("Top subjects:", Object.entries(summary.bySubject).sort((a, b) => b[1] - a[1]).slice(0, 10));

  if (DRY_RUN) {
    console.log("\nDry run — no DB writes.");
    fs.writeFileSync(
      path.join(root, "scripts", "_lf1-materials-preview.json"),
      JSON.stringify({ summary, sample: materials.slice(0, 5) }, null, 2)
    );
    return;
  }

  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Upserting to student_materials...");
  await upsertMaterials(supabase, materials);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
