import { readV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
import { CZ_MEDICAL_FACULTIES, getFacultyBySlug } from "@/lib/v25/universities-data";

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

export function loadUniversitiesReport(): V25UniversitiesReport | null {
  return readV25Json<V25UniversitiesReport>("v25/universities/index.json");
}

export function listUniversitiesForUi(): V25UniversityFaculty[] {
  const report = loadUniversitiesReport();
  if (report?.faculties?.length) return report.faculties;
  return CZ_MEDICAL_FACULTIES.map((f) => ({
    slug: f.slug,
    name: f.name,
    url: f.url,
    city: f.city,
    ok: undefined,
  }));
}

export { CZ_MEDICAL_FACULTIES, getFacultyBySlug };
