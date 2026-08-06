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

export const runtime = "nodejs";
export const maxDuration = 180;

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

  const access = await assertDokumentaceAccess(user?.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný multipart formulář." }, { status: 400 });
  }

  const file = form.get("audio") ?? form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Chybí audio soubor (pole audio nebo file)." },
      { status: 400 }
    );
  }

  const modeRaw = String(form.get("mode") ?? "consultation");
  const templateId = String(form.get("templateId") ?? "ambulantni-zprava");
  const specialty = String(form.get("specialty") ?? "").trim() || undefined;
  const mode =
    modeRaw === "dictation" || modeRaw === "verbatim" ? modeRaw : "consultation";
  const template = getDokumentaceTemplate(templateId);

  const mimeType = file.type || "audio/webm";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Prázdný audio soubor." }, { status: 400 });
  }
  if (buffer.byteLength > DOKUMENTACE_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Audio přesahuje limit 25 MB." },
      { status: 413 }
    );
  }

  try {
    const { text: transcript, provider } = await transcribeAudio(buffer, mimeType);
    const note = await structureDokumentaceNote({
      transcript,
      mode,
      templateId: template.id,
      specialty,
    });

    await logAiAgentUsage({
      userId: user!.id,
      agent: "dokumentace",
      prompt: `process:${mode}:${template.id}:${provider}:${transcript.slice(0, 200)}`,
      status: "ok",
    });

    return NextResponse.json({
      transcript,
      note,
      provider,
      templateId: template.id,
      remaining: Math.max(0, access.remaining - 1),
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
