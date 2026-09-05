import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  deleteDokumentaceNote,
  getDokumentaceNote,
  updateDokumentaceNote,
} from "@/lib/lekari/dokumentace/notes";
import { dokumentaceLocaleFromUrl } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  note: z.string().min(1).max(200_000).optional(),
  transcript: z.string().max(200_000).optional().nullable(),
  title: z.string().max(160).optional().nullable(),
  templateId: z.string().max(80).optional().nullable(),
  mode: z.string().max(40).optional().nullable(),
  specialty: z.string().max(120).optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const copy = getOrdiZapisApiCopy(dokumentaceLocaleFromUrl(request));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_notes_get",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: copy.errLoginRequired }, { status: 401 });
  }

  try {
    const note = await getDokumentaceNote(user.id, id);
    if (!note) return NextResponse.json({ error: copy.errNoteNotFound }, { status: 404 });
    return NextResponse.json({ note });
  } catch (e) {
    const message = e instanceof Error ? e.message : copy.errSaveFailed;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const copy = getOrdiZapisApiCopy(dokumentaceLocaleFromUrl(request));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_notes_patch",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: copy.errLoginRequired }, { status: 401 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: copy.errInvalidInput }, { status: 400 });
  }

  try {
    const existing = await getDokumentaceNote(user.id, id);
    if (!existing) return NextResponse.json({ error: copy.errNoteNotFound }, { status: 404 });
    const note = await updateDokumentaceNote(user.id, id, body);
    return NextResponse.json({ note });
  } catch (e) {
    const message = e instanceof Error ? e.message : copy.errSaveFailed;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const copy = getOrdiZapisApiCopy(dokumentaceLocaleFromUrl(request));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_notes_delete",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: copy.errLoginRequired }, { status: 401 });
  }

  try {
    const existing = await getDokumentaceNote(user.id, id);
    if (!existing) return NextResponse.json({ error: copy.errNoteNotFound }, { status: 404 });
    await deleteDokumentaceNote(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : copy.errSaveFailed;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
