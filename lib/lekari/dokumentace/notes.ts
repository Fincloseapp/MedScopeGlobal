import type { SupabaseClient } from "@supabase/supabase-js";
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

async function saveNoteFallback(
  fields: DokumentaceNoteFields
): Promise<DokumentaceNoteRow> {
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

  // Temporary bridge until dokumentace_notes migration is applied:
  // store payload in ai_agent_logs.details for cross-device sync under the account.
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
  adminOrUserClient: SupabaseClient,
  fields: DokumentaceNoteFields
): Promise<DokumentaceNoteRow> {
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

  const { data, error } = await adminOrUserClient
    .from("dokumentace_notes")
    .insert(payload)
    .select("*")
    .single();

  if (!error && data) return data as DokumentaceNoteRow;

  // Table missing or RLS — fall back to account-scoped log storage.
  return saveNoteFallback(fields);
}

async function listNotesFallback(userId: string, limit: number): Promise<DokumentaceNoteRow[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("ai_agent_logs")
    .select("details, created_at")
    .eq("user_id", userId)
    .eq("agent", "dokumentace_note")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const notes: DokumentaceNoteRow[] = [];
  for (const row of data ?? []) {
    const details = (row.details ?? {}) as { kind?: string; note?: DokumentaceNoteRow };
    if (details.kind === "dokumentace_note" && details.note?.id) {
      notes.push(details.note);
    }
  }
  return notes;
}

export async function listDokumentaceNotes(
  userId: string,
  limit = 30
): Promise<DokumentaceNoteRow[]> {
  const admin = createServiceRoleClient();
  const capped = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await admin
    .from("dokumentace_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(capped);

  if (!error) return (data ?? []) as DokumentaceNoteRow[];
  return listNotesFallback(userId, capped);
}

export async function getDokumentaceNote(
  userId: string,
  id: string
): Promise<DokumentaceNoteRow | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("dokumentace_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (!error) return (data as DokumentaceNoteRow | null) ?? null;

  const fallback = await listNotesFallback(userId, 100);
  return fallback.find((n) => n.id === id) ?? null;
}

export async function updateDokumentaceNote(
  userId: string,
  id: string,
  patch: Partial<Pick<DokumentaceNoteFields, "note" | "transcript" | "title" | "templateId" | "mode" | "specialty">>
): Promise<DokumentaceNoteRow> {
  const admin = createServiceRoleClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.transcript !== undefined) row.transcript = patch.transcript;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.templateId !== undefined) row.template_id = patch.templateId;
  if (patch.mode !== undefined) row.mode = patch.mode;
  if (patch.specialty !== undefined) row.specialty = patch.specialty;

  const { data, error } = await admin
    .from("dokumentace_notes")
    .update(row)
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DokumentaceNoteRow;
}

export async function deleteDokumentaceNote(userId: string, id: string): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("dokumentace_notes")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw new Error(error.message);
}
