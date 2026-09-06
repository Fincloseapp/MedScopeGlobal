import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  listDokumentaceNotes,
  saveDokumentaceNote,
} from "@/lib/lekari/dokumentace/notes";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { dokumentaceLocaleFromUrl } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  note: z.string().min(1).max(200_000),
  transcript: z.string().max(200_000).optional().nullable(),
  templateId: z.string().max(80).optional().nullable(),
  mode: z.string().max(40).optional().nullable(),
  specialty: z.string().max(120).optional().nullable(),
  title: z.string().max(160).optional().nullable(),
  source: z.string().max(40).optional().nullable(),
});

export async function GET(request: Request) {
  const locale = dokumentaceLocaleFromUrl(request);
  const copy = getOrdiZapisApiCopy(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_notes_list",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: copy.errLoginRequired }, { status: 401 });
  }

  const eligibility = await getDokumentaceEligibility(user.id, locale);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: eligibility.message, code: "DOCTOR_VERIFICATION_REQUIRED" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "30");

  try {
    const notes = await listDokumentaceNotes(user.id, Number.isFinite(limit) ? limit : 30);
    return NextResponse.json({ notes });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Načtení selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const locale = dokumentaceLocaleFromUrl(request);
  const copy = getOrdiZapisApiCopy(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_notes_create",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: copy.errLoginRequired }, { status: 401 });
  }

  const eligibility = await getDokumentaceEligibility(user.id, locale);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: eligibility.message, code: "DOCTOR_VERIFICATION_REQUIRED" },
      { status: 403 }
    );
  }

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: copy.errInvalidInput }, { status: 400 });
  }

  const sourceHeader = request.headers.get("x-dokumentace-source");
  const source = body.source ?? sourceHeader ?? "web";

  try {
    const row = await saveDokumentaceNote({
      userId: user.id,
      note: body.note,
      transcript: body.transcript,
      templateId: body.templateId,
      mode: body.mode,
      specialty: body.specialty,
      title: body.title,
      source,
    });
    return NextResponse.json({ note: row }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : copy.errSaveFailed;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
