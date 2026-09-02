import { requireAdmin } from "@/lib/auth/admin";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { createClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/**
 * Admin mutations: cookie gate (`ms_admin_gate`) or a Supabase user with role=admin.
 * Layout already uses the gate; actions must match so David can save from /admin.
 */
export async function requireAdminAccess(): Promise<{
  supabaseUserId: string | null;
}> {
  const session = await requireAdmin();
  if (await isAdminGateOpen()) {
    return { supabaseUserId: session.ok ? session.user.id : null };
  }
  if (!session.ok) {
    throw new Error("Unauthorized");
  }
  return { supabaseUserId: session.user.id };
}

/** Service role after authz so RLS does not hide rows from gate-only login. */
export async function getAuthorizedAdminClient() {
  await requireAdminAccess();
  const service = tryCreateServiceRoleClient();
  if (service) return service;
  return createClient();
}

export async function createAdminReadClient() {
  return tryCreateServiceRoleClient() ?? (await createClient());
}

/** author_id for inserts when the operator is on the password gate only. */
export async function resolveAdminWriterId(): Promise<string> {
  const { supabaseUserId } = await requireAdminAccess();
  if (supabaseUserId) return supabaseUserId;

  const admin = tryCreateServiceRoleClient();
  if (admin) {
    const { data } = await admin
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  throw new Error(
    "Chybí účet autora. Přihlaste se i přes Supabase admin účet, nebo založte uživatele s rolí admin."
  );
}
