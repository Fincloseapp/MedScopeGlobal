"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminEvent } from "@/lib/logging";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function sendNotificationToUser(input: {
  user_id: string;
  title: string;
  body: string | null;
  priority?: boolean;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const admin = createServiceRoleClient();
  const { error } = await admin.from("notifications").insert({
    user_id: input.user_id,
    title: input.title.trim(),
    body: input.body?.trim() || null,
    priority: input.priority ?? false,
    read: false,
  });

  if (error) throw error;

  await logAdminEvent("NOTIFICATION_SEND_USER", {
    user_id: input.user_id,
    title: input.title,
  });

  revalidatePath("/admin/notifications");
}

export async function broadcastNotificationToVip(input: {
  title: string;
  body: string | null;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const admin = createServiceRoleClient();
  const { data: subs, error: subErr } = await admin
    .from("vip_subscriptions")
    .select("user_id")
    .eq("active", true);

  if (subErr) throw subErr;

  const rows =
    subs?.map((s) => ({
      user_id: s.user_id,
      title: input.title.trim(),
      body: input.body?.trim() || null,
      priority: true,
      read: false,
    })) ?? [];

  if (rows.length === 0) {
    return;
  }

  const { error } = await admin.from("notifications").insert(rows);
  if (error) throw error;

  await logAdminEvent("NOTIFICATION_BROADCAST_VIP", {
    recipients: rows.length,
    title: input.title,
  });

  revalidatePath("/admin/notifications");
}
