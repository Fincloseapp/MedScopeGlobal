#!/usr/bin/env node
/**
 * Probe homepage chrome + /articles + sleep article for every GLOBAL_LOCALE.
 * Usage: MEDSCOPE_ORIGIN=http://localhost:3000 pnpm exec tsx scripts/i18n-locale-matrix.ts
 */
import { writeFileSync } from "node:fs";
import { GLOBAL_LOCALES } from "../lib/ecosystem/locales";
import { localeToPathSegment } from "../lib/i18n/locale-path";
import { getPortalUi } from "../lib/i18n/portal-copy";
import { getDemoArticleTranslation } from "../lib/verejnost/demo-magazine-i18n";

const origin = (process.env.MEDSCOPE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
const slug = "verejnost-zivotni-styl-zdravy-spanek";

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${origin}${path}`, { redirect: "follow" });
  return { status: res.status, html: await res.text() };
}

type Row = {
  locale: string;
  prefix: string;
  homeOk: boolean;
  articlesOk: boolean;
  detailOk: boolean;
  notes: string[];
};

async function main() {
  const rows: Row[] = [];
  for (const loc of GLOBAL_LOCALES) {
    const prefix = `/${localeToPathSegment(loc.code)}`;
    const cta = getPortalUi(loc.code).readMagazine;
    const title = getDemoArticleTranslation(slug, loc.code)?.title ?? "";
    const titleBit = title.slice(0, 18);
    const notes: string[] = [];
    const row: Row = {
      locale: loc.code,
      prefix,
      homeOk: false,
      articlesOk: false,
      detailOk: false,
      notes,
    };
    try {
      const home = await fetchHtml(prefix);
      row.homeOk = home.status === 200 && home.html.includes(cta);
      if (loc.code !== "cs" && home.html.includes("Číst magazín")) {
        notes.push("homepage still has Czech CTA");
        row.homeOk = false;
      }
      if (!home.html.includes(cta)) notes.push(`homepage missing CTA ${cta}`);
    } catch (e) {
      notes.push(`homepage error ${(e as Error).message}`);
    }
    try {
      const listing = await fetchHtml(`${prefix}/articles`);
      row.articlesOk = listing.status === 200 && listing.html.includes(titleBit);
      if (!listing.html.includes(titleBit)) notes.push("listing missing sleep title");
    } catch (e) {
      notes.push(`listing error ${(e as Error).message}`);
    }
    try {
      const detail = await fetchHtml(`${prefix}/article/${slug}`);
      row.detailOk = detail.status === 200 && detail.html.includes(titleBit);
      if (loc.code !== "cs" && /<h1[^>]*>Zdravý spánek/.test(detail.html)) {
        notes.push("detail still has Czech H1");
        row.detailOk = false;
      }
      if (!detail.html.includes(titleBit)) notes.push("detail missing sleep title");
    } catch (e) {
      notes.push(`detail error ${(e as Error).message}`);
    }
    rows.push(row);
    const mark = row.homeOk && row.articlesOk && row.detailOk ? "OK" : "FAIL";
    console.log(`${mark}\t${loc.code}\thome=${row.homeOk}\tarticles=${row.articlesOk}\tdetail=${row.detailOk}\t${notes.join("; ")}`);
  }
  const out = "/opt/cursor/artifacts/locale_mutation_matrix.json";
  writeFileSync(out, JSON.stringify({ origin, rows }, null, 2));
  const ok = rows.filter((r) => r.homeOk && r.articlesOk && r.detailOk).length;
  console.log(`\nReadable ${ok}/${rows.length} → ${out}`);
  if (ok !== rows.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
