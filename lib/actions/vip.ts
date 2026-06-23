"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminEvent } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function upsertVip(input: {
  user_id: string;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const admin = createServiceRoleClient();
  const { data: existing } = await admin
    .from("vip_subscriptions")
    .select("user_id")
    .eq("user_id", input.user_id)
    .maybeSingle();

  const payload = {
    user_id: input.user_id,
    active: input.active,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
  };

  const error = existing
    ? (
        await admin
          .from("vip_subscriptions")
          .update({
            active: payload.active,
            starts_at: payload.starts_at,
            ends_at: payload.ends_at,
          })
          .eq("user_id", input.user_id)
      ).error
    : (await admin.from("vip_subscriptions").insert(payload)).error;

  if (error) throw error;

  await logAdminEvent("VIP_UPSERT", {
    user_id: input.user_id,
    active: input.active,
    ends_at: input.ends_at,
  });

  revalidatePath("/admin/vip");
  revalidatePath("/account");
}

export async function deactivateVip(userId: string) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("vip_subscriptions")
    .update({ active: false })
    .eq("user_id", userId);
  if (error) throw error;
  await logAdminEvent("VIP_DEACTIVATE", { user_id: userId });
  revalidatePath("/admin/vip");
}
