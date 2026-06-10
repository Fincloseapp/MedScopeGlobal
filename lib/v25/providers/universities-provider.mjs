#!/usr/bin/env node
/**
 * v25.1 — sběr dat z českých lékařských fakult
 */
import { writeJson, readJson, appendLog, DATA_ROOT } from "../shared.mjs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const CZ_MEDICAL_FACULTIES = [
  { slug: "lf-uk-1", name: "1. LF UK", url: "https://www.lf1.cuni.cz", city: "Praha" },
  { slug: "lf-uk-2", name: "2. LF UK", url: "https://www.lf2.cuni.cz", city: "Praha" },
  { slug: "lf-uk-3", name: "3. LF UK", url: "https://www.lf3.cuni.cz", city: "Plzeň" },
  { slug: "lf-mu", name: "LF MU Brno", url: "https://www.med.muni.cz", city: "Brno" },
  { slug: "lf-up", name: "LF UP Olomouc", url: "https://www.lf.upol.cz", city: "Olomouc" },
  { slug: "lf-os", name: "LF Ostrava", url: "https://www.osu.cz/lf", city: "Ostrava" },
  { slug: "lf-plzen", name: "LF Plzeň", url: "https://www.lfp.cuni.cz", city: "Plzeň" },
  { slug: "lf-hk", name: "LF Hradec Králové", url: "https://www.lfhk.cuni.cz", city: "Hradec Králové" },
];

function parseMeta(html) {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ??
    "";
  const links = (html.match(/href=["']([^"'#]+)["']/gi) ?? []).length;
  return { title, description: desc.slice(0, 500), linkCount: links };
}

async function fetchFaculty(faculty) {
  const t0 = Date.now();
  try {
    const res = await fetch(faculty.url, {
      redirect: "follow",
      headers: { "User-Agent": "MedScopeGlobal-v25.1-universities" },
      signal: AbortSignal.timeout(25000),
    });
    const html = await res.text();
    const meta = parseMeta(html);
    const newsHints = (html.match(/aktualit|novink|přijímač|přijimack|studium/gi) ?? []).length;
    return {
      ...faculty,
      ok: res.ok,
      status: res.status,
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - t0,
      ...meta,
      newsHints,
      newArticles: newsHints > 0 ? Math.min(newsHints, 12) : 0,
      updates: res.ok ? 1 : 0,
      error: null,
    };
  } catch (e) {
    return {
      ...faculty,
      ok: false,
      status: 0,
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - t0,
      title: "",
      description: "",
      linkCount: 0,
      newsHints: 0,
      newArticles: 0,
      updates: 0,
      error: e.message,
    };
  }
}

export async function runUniversitiesProvider() {
  const previous = readJson("v25/universities/index.json");
  const prevMap = new Map((previous?.faculties ?? []).map((f) => [f.slug, f]));

  const faculties = [];
  for (const f of CZ_MEDICAL_FACULTIES) {
    const row = await fetchFaculty(f);
    const prev = prevMap.get(f.slug);
    if (prev && row.ok && prev.title !== row.title) row.updates += 1;
    faculties.push(row);
    appendLog("v25-universities.log", `${row.ok ? "OK" : "FAIL"} ${f.slug} ${row.status}`);
  }

  const report = {
    at: new Date().toISOString(),
    provider: "universities",
    faculties,
    totals: {
      fetched: faculties.length,
      ok: faculties.filter((f) => f.ok).length,
      failed: faculties.filter((f) => !f.ok).length,
      newArticles: faculties.reduce((s, f) => s + (f.newArticles ?? 0), 0),
      updates: faculties.reduce((s, f) => s + (f.updates ?? 0), 0),
    },
  };

  mkdirSync(join(DATA_ROOT, "v25/universities"), { recursive: true });
  writeJson("v25/universities/index.json", report);

  const state = readJson("v25/system-state.json") ?? {};
  state.universities = report;
  state.providers = [
    {
      id: "universities",
      name: "České LF",
      status: report.totals.failed === 0 ? "ok" : "partial",
      lastRunAt: report.at,
      newItems: report.totals.newArticles,
      updates: report.totals.updates,
      errors: report.totals.failed,
    },
  ];
  const crons = state.crons ?? [];
  const idx = crons.findIndex((c) => c.cronId === "v25-universities");
  const cronEntry = {
    cronId: "v25-universities",
    lastRunAt: report.at,
    durationMs: faculties.reduce((s, f) => s + (f.durationMs ?? 0), 0),
    status: report.totals.failed === 0 ? "ok" : "fail",
    error: report.totals.failed ? `${report.totals.failed} faculties failed` : undefined,
    metrics: report.totals,
  };
  if (idx >= 0) crons[idx] = cronEntry;
  else crons.push(cronEntry);
  state.crons = crons;
  writeJson("v25/system-state.json", state);

  return report;
}

const isMain = process.argv[1]?.includes("universities-provider");
if (isMain) {
  const report = await runUniversitiesProvider();
  console.log(report.totals);
  process.exit(report.totals.failed === 0 ? 0 : 1);
}
