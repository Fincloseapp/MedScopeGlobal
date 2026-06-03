import { createClient } from "@/lib/supabase/server";

export async function getVipStatus(userId: string | undefined) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("vip_subscriptions")
    .select("active, ends_at")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (!data?.active) return false;
  if (data.ends_at && new Date(data.ends_at) < new Date()) return false;
  return true;
}
