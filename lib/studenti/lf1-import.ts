/**
 * LF1.CZ materials parser + Supabase upsert.
 * LEGAL: metadata + external links only — no file hosting.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const LF1_BASE = "https://lf1.cz";
export const LF1_SOURCE_PAGE = "https://lf1.cz/materialy-ke-stazeni/";
export const LF1_SOURCE_ATTRIBUTION =
  "Zdroj: LF UK Praha — studentský portál LF1.CZ (lf1.cz). MedScopeGlobal pouze kurátoruje a odkazuje na originál.";

export type Lf1MaterialRow = {
  title: string;
  subject: string;
  rocnik: number | null;
  category: "recent" | "rocnik" | "general";
  external_url: string;
  file_type: string;
  source_name: string;
  source_url: string;
  source_attribution: string;
  hosting_mode: "external_link";
  is_active: boolean;
  scraped_at: string;
};

export function normalizeLf1Url(href: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.replace(/^\.\.\/\.\.\//, `${LF1_BASE}/`);
}

export function fileTypeFromUrl(url: string) {
  const clean = url.split("?")[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "unknown";
}

function decodeHtml(text: string) {
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

function parseRocnik(header: string) {
  const m = header.trim().match(/^(\d+)\.\s*ročník$/i);
  if (m) return { rocnik: Number(m[1]), category: "rocnik" as const };
  if (/naposled/i.test(header)) return { rocnik: 0, category: "recent" as const };
  return { rocnik: null, category: "general" as const };
}

function extractEntryContent(html: string) {
  const start = html.indexOf('class="entry-content');
  if (start < 0) return html;
  const slice = html.slice(start);
  const end = slice.indexOf("</article>");
  return end >= 0 ? slice.slice(0, end) : slice;
}

export function parseLf1MaterialsHtml(html: string): Lf1MaterialRow[] {
  const content = extractEntryContent(html);
  const sections = content.split(/<h1[^>]*>/i).slice(1);
  const materials: Lf1MaterialRow[] = [];
  const seen = new Set<string>();
  const scrapedAt = new Date().toISOString();

  for (const section of sections) {
    const headerEnd = section.indexOf("</h1>");
    if (headerEnd < 0) continue;
    const header = decodeHtml(section.slice(0, headerEnd).replace(/<[^>]+>/g, ""));
    const { rocnik, category } = parseRocnik(header);
    const body = section.slice(headerEnd);

    const rowRe =
      /<td>\s*([^<]+?)\s*<\/td>\s*<td>[\s\S]*?<a\s+href=(?:["'])?([^"'\s>]+)(?:["'])?[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = rowRe.exec(body)) !== null) {
      const subject = decodeHtml(match[1].replace(/<[^>]+>/g, ""));
      const externalUrl = normalizeLf1Url(match[2]);
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
        source_attribution: LF1_SOURCE_ATTRIBUTION,
        hosting_mode: "external_link",
        is_active: true,
        scraped_at: scrapedAt,
      });
    }
  }

  return materials;
}

export function summarizeLf1Materials(materials: Lf1MaterialRow[]) {
  const byRocnik: Record<string, number> = {};
  const bySubject: Record<string, number> = {};
  for (const m of materials) {
    const key = m.rocnik === null ? "general" : String(m.rocnik);
    byRocnik[key] = (byRocnik[key] ?? 0) + 1;
    bySubject[m.subject] = (bySubject[m.subject] ?? 0) + 1;
  }
  return { total: materials.length, byRocnik, bySubject };
}

export async function fetchLf1MaterialsPage() {
  const res = await fetch(LF1_SOURCE_PAGE, {
    headers: { "User-Agent": "MedScopeGlobal-Indexer/1.0 (+https://medscopeglobal.com)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`LF1 fetch failed: ${res.status}`);
  return res.text();
}

export async function upsertLf1Materials(
  supabase: SupabaseClient,
  materials: Lf1MaterialRow[]
) {
  const BATCH = 100;
  let upserted = 0;
  for (let i = 0; i < materials.length; i += BATCH) {
    const batch = materials.slice(i, i + BATCH);
    const { error } = await supabase.from("student_materials").upsert(batch, {
      onConflict: "external_url,rocnik",
    });
    if (error) throw new Error(error.message);
    upserted += batch.length;
  }
  return upserted;
}

export async function runLf1MaterialsImport(supabase: SupabaseClient) {
  const html = await fetchLf1MaterialsPage();
  const materials = parseLf1MaterialsHtml(html);
  const summary = summarizeLf1Materials(materials);
  const upserted = await upsertLf1Materials(supabase, materials);
  return { ...summary, upserted };
}
