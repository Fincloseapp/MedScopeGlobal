import { createClient } from "@/lib/supabase/server";
import lf1MaterialsExport from "@/public/data/lf1-student-materials.json";

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

function filterMaterials(materials: StudentMaterial[], query: StudentMaterialsQuery) {
  const limit = Math.min(query.limit ?? 500, 1000);
  const offset = query.offset ?? 0;
  const q = query.q?.trim().toLowerCase();

  let filtered = materials.filter((m) => {
    if (query.rocnik !== undefined && query.rocnik !== null && m.rocnik !== query.rocnik) {
      return false;
    }
    if (query.subject && m.subject !== query.subject) return false;
    if (q && !m.title.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q)) {
      return false;
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
): Promise<{ materials: StudentMaterial[]; total: number; source: "db" | "json" }> {
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
    return {
      materials: (data ?? []) as StudentMaterial[],
      total: count ?? data?.length ?? 0,
      source: "db",
    };
  }

  const fallback = filterMaterials(loadJsonFallback(), query);
  return { ...fallback, source: "json" };
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

export function computeMaterialsStats(materials: Pick<StudentMaterial, "rocnik">[]) {
  const byRocnik: Record<string, number> = {};
  for (const row of materials) {
    const key = row.rocnik === null ? "general" : String(row.rocnik);
    byRocnik[key] = (byRocnik[key] ?? 0) + 1;
  }
  return { total: materials.length, byRocnik };
}
