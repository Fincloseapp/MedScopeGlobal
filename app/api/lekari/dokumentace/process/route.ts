import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { assertDokumentaceAccess } from "@/lib/lekari/dokumentace/access";
import {
  DOKUMENTACE_MAX_UPLOAD_BYTES,
  getDokumentaceTemplate,
} from "@/lib/lekari/dokumentace/templates";
import { transcribeAudio } from "@/lib/lekari/dokumentace/stt";
import { structureDokumentaceNote } from "@/lib/lekari/dokumentace/structure";
import { saveDokumentaceNote } from "@/lib/lekari/dokumentace/notes";
import { dokumentaceLocaleFromForm, dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";
import { fillOrdiApi, getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const maxDuration = 300;

function resolveSource(request: Request, form: FormData): string {
  const header = request.headers.get("x-dokumentace-source");
  const field = form.get("source");
  if (typeof field === "string" && field.trim()) return field.trim().slice(0, 40);
  if (header?.trim()) return header.trim().slice(0, 40);
  return "web";
}

function collectAudioFiles(form: FormData): File[] {
  const files: File[] = [];
  const all = form.getAll("audio");
  for (const item of all) {
    if (item && typeof item !== "string") files.push(item);
  }
  if (files.length === 0) {
    const single = form.get("file");
    if (single && typeof single !== "string") files.push(single);
  }
  // audio_0, audio_1, …
  for (const [key, value] of form.entries()) {
    if (/^audio_\d+$/.test(key) && value && typeof value !== "string") {
      files.push(value);
    }
  }
  return files;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_process",
  });
  if (!guard.ok) return guard.response;

  const headerLocale = dokumentaceLocaleFromRequest(request);
  const access = await assertDokumentaceAccess(user?.id, headerLocale);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: getOrdiZapisApiCopy(headerLocale).errBadForm },
      { status: 400 }
    );
  }

  const locale = dokumentaceLocaleFromForm(request, form);
  const copy = getOrdiZapisApiCopy(locale);
  const files = collectAudioFiles(form);
  if (files.length === 0) {
    return NextResponse.json(
      { error: copy.errMissingAudio },
      { status: 400 }
    );
  }

  const modeRaw = String(form.get("mode") ?? "consultation");
  const templateId = String(form.get("templateId") ?? "ambulantni-zprava");
  const specialty = String(form.get("specialty") ?? "").trim() || undefined;
  const mode =
    modeRaw === "dictation" || modeRaw === "verbatim" ? modeRaw : "consultation";
  const template = getDokumentaceTemplate(templateId);
  const source = resolveSource(request, form);

  const parts: string[] = [];
  const providers: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mimeType = file.type || "audio/webm";
      const buffer = Buffer.from(await file.arrayBuffer());

      if (buffer.byteLength === 0) continue;
      if (buffer.byteLength > DOKUMENTACE_MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          {
            error: fillOrdiApi(copy.errSegmentLimit, { n: i + 1 }),
          },
          { status: 413 }
        );
      }

      const { text, provider } = await transcribeAudio(buffer, mimeType, undefined, locale);
      if (text) {
        parts.push(text);
        providers.push(provider);
      }
    }

    const transcript = parts.join("\n\n").trim();
    if (!transcript) {
      return NextResponse.json(
        { error: copy.errEmptyTranscript },
        { status: 422 }
      );
    }

    const note = await structureDokumentaceNote({
      transcript,
      mode,
      templateId: template.id,
      specialty,
      locale,
    });

    await logAiAgentUsage({
      userId: user!.id,
      agent: "dokumentace",
      prompt: `process:${mode}:${template.id}:${providers.join("+")}:segs=${files.length}:${transcript.slice(0, 200)}`,
      status: "ok",
    });

    let savedId: string | null = null;
    try {
      const saved = await saveDokumentaceNote({
        userId: user!.id,
        note,
        transcript,
        templateId: template.id,
        mode,
        specialty,
        source,
      });
      savedId = saved.id;
    } catch {
      // Note persistence is best-effort; processing still succeeds.
    }

    return NextResponse.json({
      transcript,
      note,
      provider: providers.join("+") || null,
      templateId: template.id,
      remaining: Math.max(0, access.remaining - 1),
      saved: Boolean(savedId),
      noteId: savedId,
      segments: files.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Zpracování selhalo.";
    await logAiAgentUsage({
      userId: user!.id,
      agent: "dokumentace",
      prompt: "process:error",
      status: "error",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
