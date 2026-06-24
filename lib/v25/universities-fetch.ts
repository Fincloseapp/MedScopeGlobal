import { CZ_MEDICAL_FACULTIES } from "@/lib/v25/universities-data";
import type { V25UniversitiesReport, V25UniversityFaculty } from "@/lib/v25/universities";

function parseMeta(html: string) {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ??
    "";
  const links = (html.match(/href=["']([^"'#]+)["']/gi) ?? []).length;
  return { title, description: desc.slice(0, 500), linkCount: links };
}

export async function fetchFacultyLive(
  faculty: (typeof CZ_MEDICAL_FACULTIES)[number]
): Promise<V25UniversityFaculty> {
  const t0 = Date.now();
  try {
    const res = await fetch(faculty.url, {
      redirect: "follow",
      headers: { "User-Agent": "MedScopeGlobal-v25.4-universities" },
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    const html = await res.text();
    const meta = parseMeta(html);
    const newsHints = (html.match(/aktualit|novink|přijímač|přijimack|studium/gi) ?? []).length;
    return {
      slug: faculty.slug,
      name: faculty.name,
      url: faculty.url,
      city: faculty.city,
      ok: res.ok,
      status: res.status,
      fetchedAt: new Date().toISOString(),
      title: meta.title,
      description: meta.description,
      linkCount: meta.linkCount,
      newArticles: newsHints > 0 ? Math.min(newsHints, 12) : 0,
      updates: res.ok ? 1 : 0,
      error: null,
    };
  } catch (e) {
    return {
      slug: faculty.slug,
      name: faculty.name,
      url: faculty.url,
      city: faculty.city,
      ok: false,
      status: 0,
      fetchedAt: new Date().toISOString(),
      error: e instanceof Error ? e.message : String(e),
      newArticles: 0,
      updates: 0,
    };
  }
}

export async function fetchAllFacultiesLive(
  previous?: V25UniversitiesReport | null
): Promise<V25UniversitiesReport> {
  const prevMap = new Map((previous?.faculties ?? []).map((f) => [f.slug, f]));
  const faculties: V25UniversityFaculty[] = [];

  for (const f of CZ_MEDICAL_FACULTIES) {
    const row = await fetchFacultyLive(f);
    const prev = prevMap.get(f.slug);
    if (prev && row.ok && prev.title && row.title && prev.title !== row.title) {
      row.updates = (row.updates ?? 0) + 1;
    }
    faculties.push(row);
  }

  return {
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
}
