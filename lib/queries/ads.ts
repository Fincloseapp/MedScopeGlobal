import { createClient } from "@/lib/supabase/server";
import type { AdRow } from "@/types/database";

function isWithinSchedule(row: AdRow): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (row.start_date && row.start_date > today) return false;
  if (row.end_date && row.end_date < today) return false;
  if (row.ad_status && row.ad_status !== "active" && row.ad_status !== "approved") {
    return row.active;
  }
  return true;
}

export async function getActiveAds(placement?: string | null) {
  const supabase = await createClient();
  let query = supabase.from("ads").select("*").eq("active", true);

  if (placement) {
    query = query.eq("placement", placement);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveAds", error);
    return [];
  }
  return ((data ?? []) as AdRow[]).filter(isWithinSchedule);
}

export async function getActiveAdsByPlacement(placement: string, limit = 3) {
  const ads = await getActiveAds(placement);
  return ads.slice(0, limit);
}
