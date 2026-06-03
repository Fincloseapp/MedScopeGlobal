import { createClient } from "@/lib/supabase/server";
import type { AdRow } from "@/types/database";

export async function getActiveAds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveAds", error);
    return [];
  }
  return (data ?? []) as AdRow[];
}
