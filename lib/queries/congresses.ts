import { createClient } from "@/lib/supabase/server";
import type { CongressEventRow } from "@/types/database";

export async function getCongressEvents(filters?: {
  specialty?: string;
  region?: string;
  from?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("congress_events")
    .select("*")
    .eq("published", true)
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (filters?.specialty) {
    query = query.ilike("specialty", `%${filters.specialty}%`);
  }
  if (filters?.region) {
    query = query.ilike("region", `%${filters.region}%`);
  }
  if (filters?.from) {
    query = query.gte("starts_at", filters.from);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getCongressEvents", error);
    return [];
  }
  return (data ?? []) as CongressEventRow[];
}

export async function getCongressBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("congress_events")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as CongressEventRow;
}

export async function getUpcomingCongresses(limit = 6) {
  const now = new Date().toISOString();
  const events = await getCongressEvents({ from: now });
  return events.slice(0, limit);
}
