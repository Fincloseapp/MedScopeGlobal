import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { assertDokumentaceAccess } from "@/lib/lekari/dokumentace/access";
import { structureDokumentaceNote } from "@/lib/lekari/dokumentace/structure";
import {
  DOKUMENTACE_MODES,
  DOKUMENTACE_TEMPLATES,
} from "@/lib/lekari/dokumentace/templates";
import { saveDokumentaceNote } from "@/lib/lekari/dokumentace/notes";
import { dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const maxDuration = 180;

const bodySchema = z.object({
  transcript: z.string().min(1).max(400_000),
  mode: z.enum(["consultation", "dictation", "verbatim"]),
  templateId: z.enum([
    "ambulantni-zprava",
    "soap",
    "anamneza",
    "propousteci-zprava",
    "specialista",
    "prakticky-lekar",
  ]),
  specialty: z.string().max(120).optional(),
  source: z.string().max(40).optional(),
  locale: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_structure",
  });
  if (!guard.ok) return guard.response;

  const headerLocale = dokumentaceLocaleFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: getOrdiZapisApiCopy(headerLocale).unauthShort },
      { status: 401 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: getOrdiZapisApiCopy(headerLocale).errInvalidInput,
        modes: DOKUMENTACE_MODES.map((m) => m.id),
        templates: DOKUMENTACE_TEMPLATES.map((t) => t.id),
      },
      { status: 400 }
    );
  }

  const locale = dokumentaceLocaleFromRequest(request, body.locale);
  const access = await assertDokumentaceAccess(user.id, locale);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const sourceHeader = request.headers.get("x-dokumentace-source");
  const source = body.source ?? sourceHeader ?? "web";

  try {
    const note = await structureDokumentaceNote({
      transcript: body.transcript,
      mode: body.mode,
      templateId: body.templateId,
      specialty: body.specialty,
      locale,
    });

    await logAiAgentUsage({
      userId: user.id,
      agent: "dokumentace",
      prompt: `structure:${body.mode}:${body.templateId}:${body.transcript.slice(0, 200)}`,
      status: "ok",
    });

    let savedId: string | null = null;
    try {
      const saved = await saveDokumentaceNote({
        userId: user.id,
        note,
        transcript: body.transcript,
        templateId: body.templateId,
        mode: body.mode,
        specialty: body.specialty,
        source,
      });
      savedId = saved.id;
    } catch {
      // best-effort
    }

    return NextResponse.json({
      note,
      templateId: body.templateId,
      remaining: access.ok ? access.remaining : undefined,
      saved: Boolean(savedId),
      noteId: savedId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : getOrdiZapisApiCopy(locale).errStructure;
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
