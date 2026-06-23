import { createServiceRoleClient } from "@/lib/supabase/service";

export async function logAdminEvent(
  event: string,
  data: Record<string, unknown>
) {
  try {
    const admin = createServiceRoleClient();
    await admin.from("logs").insert({
      event,
      data,
    });
  } catch (e) {
    console.error("logAdminEvent failed", event, e);
  }
}
