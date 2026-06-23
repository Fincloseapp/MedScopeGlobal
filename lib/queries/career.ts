import { createClient } from "@/lib/supabase/server";
import type { JobPostingRow } from "@/types/database";

export async function getJobPostings(filters?: {
  specialization?: string;
  region?: string;
  employmentType?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("job_postings")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.specialization) {
    query = query.ilike("specialization", `%${filters.specialization}%`);
  }
  if (filters?.region) {
    query = query.ilike("region", `%${filters.region}%`);
  }
  if (filters?.employmentType) {
    query = query.eq("employment_type", filters.employmentType);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getJobPostings", error);
    return [];
  }
  return (data ?? []) as JobPostingRow[];
}

export async function getJobById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as JobPostingRow;
}

export async function getFeaturedJobs(limit = 3) {
  const all = await getJobPostings();
  return all.filter((j) => j.featured).slice(0, limit).length
    ? all.filter((j) => j.featured).slice(0, limit)
    : all.slice(0, limit);
}
