import { readV25Json } from "@/lib/v25/data-store";
import { CZ_MEDICAL_FACULTIES, getFacultyBySlug } from "@/lib/v25/universities-data";
import { fetchFacultyLive } from "@/lib/v25/universities-fetch";
import {
  loadUniversitiesReportFromDb,
  persistUniversitiesReport,
} from "@/lib/v25/universities-persist";

export type V25UniversityFaculty = {
  slug: string;
  name: string;
  url: string;
  city: string;
  ok?: boolean;
  status?: number;
  fetchedAt?: string;
  title?: string;
  description?: string;
  linkCount?: number;
  newArticles?: number;
  updates?: number;
  error?: string | null;
};

export type V25UniversitiesReport = {
  at: string;
  provider: string;
  faculties: V25UniversityFaculty[];
  totals: {
    fetched: number;
    ok: number;
    failed: number;
    newArticles: number;
    updates: number;
  };
};

/** Cached scrape rows keep stale URLs — always prefer the static faculty catalog. */
function mergeWithStaticCatalog(faculty: V25UniversityFaculty): V25UniversityFaculty {
  const staticFaculty = getFacultyBySlug(faculty.slug);
  if (!staticFaculty) return faculty;
  return {
    ...faculty,
    name: staticFaculty.name,
    url: staticFaculty.url,
    city: staticFaculty.city,
  };
}

export function loadUniversitiesReport(): V25UniversitiesReport | null {
  return readV25Json<V25UniversitiesReport>("v25/universities/index.json");
}

export async function loadUniversitiesReportAsync(): Promise<V25UniversitiesReport | null> {
  const fromDb = await loadUniversitiesReportFromDb();
  if (fromDb?.faculties?.length) return fromDb;
  return loadUniversitiesReport();
}

export async function listUniversitiesForUiAsync(): Promise<V25UniversityFaculty[]> {
  const report = await loadUniversitiesReportAsync();
  if (report?.faculties?.length) return report.faculties.map(mergeWithStaticCatalog);
  return CZ_MEDICAL_FACULTIES.map((f) => ({
    slug: f.slug,
    name: f.name,
    url: f.url,
    city: f.city,
    ok: undefined,
  }));
}

/** Veřejná stránka — pokud chybí uložený sběr, ověří web fakulty naživo. */
export async function getFacultyForPublicUi(slug: string): Promise<V25UniversityFaculty | null> {
  const staticFaculty = getFacultyBySlug(slug);
  if (!staticFaculty) return null;

  const report = await loadUniversitiesReportAsync();
  const cached = report?.faculties?.find((f) => f.slug === slug);
  if (cached?.fetchedAt) {
    return mergeWithStaticCatalog({ ...staticFaculty, ...cached });
  }

  const live = await fetchFacultyLive(staticFaculty);
  return mergeWithStaticCatalog({ ...staticFaculty, ...live });
}

export function listUniversitiesForUi(): V25UniversityFaculty[] {
  const report = loadUniversitiesReport();
  if (report?.faculties?.length) return report.faculties.map(mergeWithStaticCatalog);
  return CZ_MEDICAL_FACULTIES.map((f) => ({
    slug: f.slug,
    name: f.name,
    url: f.url,
    city: f.city,
    ok: undefined,
  }));
}

export { CZ_MEDICAL_FACULTIES, getFacultyBySlug, persistUniversitiesReport };
