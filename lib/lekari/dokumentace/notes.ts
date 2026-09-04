import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { tryGetPublicEnv } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type DokumentaceNoteRow = {
  id: string;
  user_id: string;
  template_id: string | null;
  mode: string | null;
  specialty: string | null;
  transcript: string | null;
  note: string;
  title: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type DokumentaceNoteFields = {
  userId: string;
  note: string;
  transcript?: string | null;
  templateId?: string | null;
  mode?: string | null;
  specialty?: string | null;
  title?: string | null;
  source?: string | null;
};

function deriveTitle(fields: DokumentaceNoteFields): string {
  if (fields.title?.trim()) return fields.title.trim().slice(0, 120);
  const firstLine = fields.note
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  if (firstLine) return firstLine.slice(0, 80);
  return fields.templateId ? `Zápis · ${fields.templateId}` : "Zápis Dokumentace";
}

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table")
  );
}

/**
 * User-JWT client only — never the service role.
 * RLS on dokumentace_notes is `auth.uid() = user_id`; service_role would bypass it.
 */
export async function createDokumentaceUserClient() {
  const pubEnv = tryGetPublicEnv();
  if (!pubEnv) {
    throw new Error("User-scoped Supabase env missing; refusing to bypass RLS.");
  }
  const cookieStore = await cookies();
  return createServerClient(pubEnv.url, pubEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component / read-only cookies
        }
      },
    },
  });
}

async function sessionUser(client: SupabaseClient): Promise<User> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user?.id) {
    throw new Error("Přihlášení vyžadováno.");
  }
  return user;
}

async function assertSamePhysician(client: SupabaseClient, userId: string): Promise<User> {
  const user = await sessionUser(client);
  if (user.id !== userId) {
    throw new Error("Session mismatch — refusing to touch another physician's notes.");
  }
  return user;
}

function ownRowsOnly(rows: DokumentaceNoteRow[], userId: string): DokumentaceNoteRow[] {
  return rows.filter((row) => row.user_id === userId);
}

async function saveNoteFallback(fields: DokumentaceNoteFields): Promise<DokumentaceNoteRow> {
  const admin = createServiceRoleClient();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const title = deriveTitle(fields);
  const row: DokumentaceNoteRow = {
    id,
    user_id: fields.userId,
    template_id: fields.templateId ?? null,
    mode: fields.mode ?? null,
    specialty: fields.specialty ?? null,
    transcript: fields.transcript ?? null,
    note: fields.note,
    title,
    source: fields.source ?? "web",
    created_at: now,
    updated_at: now,
  };

  // Temporary bridge until dokumentace_notes exists: account-scoped log row only.
  const { error } = await admin.from("ai_agent_logs").insert({
    user_id: fields.userId,
    agent: "dokumentace_note",
    prompt_hash: id.slice(0, 32),
    status: "ok",
    details: { kind: "dokumentace_note", note: row },
  });
  if (error) throw new Error(error.message);
  return row;
}

export async function saveDokumentaceNote(
  fields: DokumentaceNoteFields
): Promise<DokumentaceNoteRow> {
  const client = await createDokumentaceUserClient();
  await assertSamePhysician(client, fields.userId);

  const now = new Date().toISOString();
  const payload = {
    user_id: fields.userId,
    note: fields.note,
    transcript: fields.transcript ?? null,
    template_id: fields.templateId ?? null,
    mode: fields.mode ?? null,
    specialty: fields.specialty ?? null,
    title: deriveTitle(fields),
    source: fields.source ?? "web",
    updated_at: now,
  };

  const { data, error } = await client
    .from("dokumentace_notes")
    .insert(payload)
    .select("*")
    .single();

  if (!error && data) {
    const row = data as DokumentaceNoteRow;
    if (row.user_id !== fields.userId) {
      throw new Error("RLS violation: insert returned another physician's row.");
    }
    return row;
  }
  if (isMissingTable(error)) return saveNoteFallback(fields);
  throw new Error(error?.message ?? "Uložení zápisu selhalo.");
}

async function listNotesFallback(userId: string, limit: number): Promise<DokumentaceNoteRow[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("ai_agent_logs")
    .select("details, created_at, user_id")
    .eq("user_id", userId)
    .eq("agent", "dokumentace_note")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const notes: DokumentaceNoteRow[] = [];
  for (const row of data ?? []) {
    if (row.user_id !== userId) continue;
    const details = (row.details ?? {}) as { kind?: string; note?: DokumentaceNoteRow };
    if (
      details.kind === "dokumentace_note" &&
      details.note?.id &&
      details.note.user_id === userId
    ) {
      notes.push(details.note);
    }
  }
  return notes;
}

export async function listDokumentaceNotes(
  userId: string,
  limit = 30
): Promise<DokumentaceNoteRow[]> {
  const client = await createDokumentaceUserClient();
  await assertSamePhysician(client, userId);
  const capped = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await client
    .from("dokumentace_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(capped);

  if (!error) return ownRowsOnly((data ?? []) as DokumentaceNoteRow[], userId);
  if (isMissingTable(error)) return listNotesFallback(userId, capped);
  throw new Error(error.message);
}

export async function getDokumentaceNote(
  userId: string,
  id: string
): Promise<DokumentaceNoteRow | null> {
  const client = await createDokumentaceUserClient();
  await assertSamePhysician(client, userId);
  const { data, error } = await client
    .from("dokumentace_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (!error) {
    const row = (data as DokumentaceNoteRow | null) ?? null;
    if (row && row.user_id !== userId) return null;
    return row;
  }
  if (isMissingTable(error)) {
    const fallback = await listNotesFallback(userId, 100);
    return fallback.find((n) => n.id === id && n.user_id === userId) ?? null;
  }
  throw new Error(error.message);
}

export async function updateDokumentaceNote(
  userId: string,
  id: string,
  patch: Partial<
    Pick<DokumentaceNoteFields, "note" | "transcript" | "title" | "templateId" | "mode" | "specialty">
  >
): Promise<DokumentaceNoteRow> {
  const client = await createDokumentaceUserClient();
  await assertSamePhysician(client, userId);
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.transcript !== undefined) row.transcript = patch.transcript;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.templateId !== undefined) row.template_id = patch.templateId;
  if (patch.mode !== undefined) row.mode = patch.mode;
  if (patch.specialty !== undefined) row.specialty = patch.specialty;

  const { data, error } = await client
    .from("dokumentace_notes")
    .update(row)
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const updated = data as DokumentaceNoteRow;
  if (updated.user_id !== userId) {
    throw new Error("RLS violation: update returned another physician's row.");
  }
  return updated;
}

export async function deleteDokumentaceNote(userId: string, id: string): Promise<void> {
  const client = await createDokumentaceUserClient();
  await assertSamePhysician(client, userId);
  const { error } = await client
    .from("dokumentace_notes")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw new Error(error.message);
}
