"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedAdminClient } from "@/lib/auth/require-admin-access";
import { logAdminEvent } from "@/lib/logging";

export async function saveAd(input: {
  id?: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  placement: string | null;
}) {
  const supabase = await getAuthorizedAdminClient();
  const payload = {
    title: input.title.trim(),
    image_url: input.image_url.trim(),
    link_url: input.link_url?.trim() || null,
    active: input.active,
    placement: input.placement?.trim() || null,
  };

  if (input.id) {
    const { error } = await supabase.from("ads").update(payload).eq("id", input.id);
    if (error) throw error;
    await logAdminEvent("AD_UPDATE", { ad_id: input.id });
  } else {
    const { data, error } = await supabase
      .from("ads")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    await logAdminEvent("AD_CREATE", { ad_id: data.id });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
}

export async function deleteAd(id: string) {
  const supabase = await getAuthorizedAdminClient();
  const { error } = await supabase.from("ads").delete().eq("id", id);
  if (error) throw error;
  await logAdminEvent("AD_DELETE", { ad_id: id });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
}

export async function setAdActive(id: string, active: boolean) {
  const supabase = await getAuthorizedAdminClient();
  const { error } = await supabase.from("ads").update({ active }).eq("id", id);
  if (error) throw error;
  await logAdminEvent("AD_ACTIVATE", { ad_id: id, active });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
}
