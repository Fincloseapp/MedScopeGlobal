import { createServiceRoleClient } from "@/lib/supabase/service";

const SYSTEM_EMAIL = "ingest@medscopeglobal.internal";
const SYSTEM_NAME = "MedScopeGlobal Editorial";

/** Ensures a service author exists for automated article ingestion. */
export async function ensureIngestionAuthor(): Promise<string | null> {
  if (process.env.INGESTION_AUTHOR_ID) {
    return process.env.INGESTION_AUTHOR_ID;
  }

  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", SYSTEM_EMAIL)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: adminRow } = await admin
    .from("users")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  if (adminRow?.id) return adminRow.id as string;

  const { data: anyRow } = await admin
    .from("users")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (anyRow?.id) return anyRow.id as string;

  const { data: created, error: authErr } =
    await admin.auth.admin.createUser({
      email: SYSTEM_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: SYSTEM_NAME },
    });

  if (authErr || !created.user?.id) {
    console.error("ensureIngestionAuthor auth", authErr?.message);
    return null;
  }

  const id = created.user.id;
  const { error: profileErr } = await admin.from("users").upsert(
    {
      id,
      email: SYSTEM_EMAIL,
      full_name: SYSTEM_NAME,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    console.error("ensureIngestionAuthor profile", profileErr.message);
    return id;
  }

  return id;
}
