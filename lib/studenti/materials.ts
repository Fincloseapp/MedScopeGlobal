import { createClient } from "@/lib/supabase/server";
import lf1MaterialsExport from "@/public/data/lf1-student-materials.json";
import { anonymizeMaterialTitle } from "@/lib/studenti/materials-anonymize";

/** Full record — admin / server-side only. */
export type StudentMaterial = {
  id: string;
  title: string;
  subject: string;
  rocnik: number | null;
  category: "recent" | "rocnik" | "general";
  external_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  description: string | null;
  source_name: string;
  source_url: string;
  source_attribution: string;
  hosting_mode: "external_link" | "hosted";
  storage_path: string | null;
  scraped_at: string;
};

/** Public-safe shape — no external URLs or source attribution. */
export type PublicStudentMaterial = {
  id: string;
  display_title: string;
  subject: string;
  rocnik: number | null;
  category: "recent" | "rocnik" | "general";
  file_type: string | null;
  file_size_bytes: number | null;
  description: string | null;
  /** @deprecated Use read_path — kept for API compatibility */
  can_preview: boolean;
  /** @deprecated Use read_path */
  preview_path: string;
  read_path: string;
};

export type StudentMaterialsQuery = {
  rocnik?: number | null;
  subject?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

type JsonExport = {
  materials: StudentMaterial[];
};

const jsonFallback = (lf1MaterialsExport as JsonExport).materials ?? [];

function loadJsonFallback(): StudentMaterial[] {
  return jsonFallback;
}

export function toPublicMaterial(m: StudentMaterial): PublicStudentMaterial {
  const readPath = `/studenti/materialy/${m.id}/cist`;
  return {
    id: m.id,
    display_title: anonymizeMaterialTitle(m.title),
    subject: m.subject,
    rocnik: m.rocnik,
    category: m.category,
    file_type: m.file_type,
    file_size_bytes: m.file_size_bytes,
    description: m.description,
    can_preview: true,
    preview_path: readPath,
    read_path: readPath,
  };
}

function filterMaterials(materials: StudentMaterial[], query: StudentMaterialsQuery) {
  const limit = Math.min(query.limit ?? 500, 1000);
  const offset = query.offset ?? 0;
  const q = query.q?.trim().toLowerCase();

  let filtered = materials.filter((m) => {
    if (query.rocnik !== undefined && query.rocnik !== null && m.rocnik !== query.rocnik) {
      return false;
    }
    if (query.subject && m.subject !== query.subject) return false;
    if (q) {
      const display = anonymizeMaterialTitle(m.title).toLowerCase();
      if (!display.includes(q) && !m.title.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  filtered = filtered.sort(
    (a, b) => a.subject.localeCompare(b.subject, "cs") || a.title.localeCompare(b.title, "cs")
  );

  const total = filtered.length;
  return { materials: filtered.slice(offset, offset + limit), total };
}

export async function listStudentMaterials(
  query: StudentMaterialsQuery = {}
): Promise<{ materials: PublicStudentMaterial[]; total: number; source: "db" | "json" }> {
  const supabase = await createClient();
  const limit = Math.min(query.limit ?? 500, 1000);
  const offset = query.offset ?? 0;

  let dbQuery = supabase
    .from("student_materials")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("subject", { ascending: true })
    .order("title", { ascending: true })
    .range(offset, offset + limit - 1);

  if (query.rocnik !== undefined && query.rocnik !== null) {
    dbQuery = dbQuery.eq("rocnik", query.rocnik);
  }

  if (query.subject) {
    dbQuery = dbQuery.eq("subject", query.subject);
  }

  if (query.q) {
    dbQuery = dbQuery.or(`title.ilike.%${query.q}%,subject.ilike.%${query.q}%`);
  }

  const { data, error, count } = await dbQuery;
  if (!error && (data?.length ?? 0) > 0) {
    const raw = (data ?? []) as StudentMaterial[];
    return {
      materials: raw.map(toPublicMaterial),
      total: count ?? raw.length,
      source: "db",
    };
  }

  const fallback = filterMaterials(loadJsonFallback(), query);
  return {
    materials: fallback.materials.map(toPublicMaterial),
    total: fallback.total,
    source: "json",
  };
}

export async function getStudentMaterialById(id: string): Promise<StudentMaterial | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_materials")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!error && data) return data as StudentMaterial;

  return loadJsonFallback().find((m) => m.id === id) ?? null;
}

export async function listStudentMaterialSubjects(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_materials")
    .select("subject")
    .eq("is_active", true);

  const subjects = new Set<string>();
  if (!error) {
    for (const row of data ?? []) {
      if (row.subject) subjects.add(row.subject);
    }
  }
  if (subjects.size === 0) {
    for (const row of loadJsonFallback()) subjects.add(row.subject);
  }
  return [...subjects].sort((a, b) => a.localeCompare(b, "cs"));
}

export function computeMaterialsStats(materials: Pick<PublicStudentMaterial, "rocnik">[]) {
  const byRocnik: Record<string, number> = {};
  for (const row of materials) {
    const key = row.rocnik === null ? "general" : String(row.rocnik);
    byRocnik[key] = (byRocnik[key] ?? 0) + 1;
  }
  return { total: materials.length, byRocnik };
}
