import { createClient } from "@/lib/supabase/server";

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

export async function listStudentMaterials(
  query: StudentMaterialsQuery = {}
): Promise<{ materials: StudentMaterial[]; total: number }> {
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
  if (error) throw new Error(error.message);

  return {
    materials: (data ?? []) as StudentMaterial[],
    total: count ?? data?.length ?? 0,
  };
}

export async function listStudentMaterialSubjects(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_materials")
    .select("subject")
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  const subjects = new Set<string>();
  for (const row of data ?? []) {
    if (row.subject) subjects.add(row.subject);
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
