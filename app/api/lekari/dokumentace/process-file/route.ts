import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { assertDokumentaceAccess } from "@/lib/lekari/dokumentace/access";
import { getDokumentaceTemplate } from "@/lib/lekari/dokumentace/templates";
import { transcribeAudio } from "@/lib/lekari/dokumentace/stt";
import { structureDokumentaceNote } from "@/lib/lekari/dokumentace/structure";
import { saveDokumentaceNote } from "@/lib/lekari/dokumentace/notes";

export const runtime = "nodejs";
export const maxDuration = 300;

const BUCKET = "media";
const PREFIX = "mediktor-temp";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  total: z.number().int().min(1).max(40),
  filename: z.string().min(1).max(180),
  mimeType: z.string().min(1).max(120),
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
});

async function downloadAssembled(
  userId: string,
  sessionId: string,
  total: number
): Promise<Buffer> {
  const admin = createServiceRoleClient();
  const parts: Buffer[] = [];
  const paths: string[] = [];

  for (let i = 0; i < total; i++) {
    const path = `${PREFIX}/${userId}/${sessionId}/${String(i).padStart(3, "0")}.part`;
    paths.push(path);
    const { data, error } = await admin.storage.from(BUCKET).download(path);
    if (error || !data) {
      throw new Error(`Chybí část souboru ${i + 1}/${total}. Nahrajte soubor znovu.`);
    }
    parts.push(Buffer.from(await data.arrayBuffer()));
  }

  // best-effort cleanup
  try {
    await admin.storage.from(BUCKET).remove(paths);
  } catch {
    // ignore
  }

  const assembled = Buffer.concat(parts);
  if (assembled.byteLength === 0) {
    throw new Error("Složený soubor je prázdný.");
  }
  if (assembled.byteLength > 25 * 1024 * 1024) {
    throw new Error("Soubor po složení přesahuje 25 MB.");
  }
  return assembled;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_process_file",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  const access = await assertDokumentaceAccess(user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup process-file." }, { status: 400 });
  }

  const template = getDokumentaceTemplate(body.templateId);
  const source = body.source?.trim() || "mobile-file";

  try {
    const buffer = await downloadAssembled(user.id, body.sessionId, body.total);
    const { text: transcript, provider } = await transcribeAudio(
      buffer,
      body.mimeType,
      body.filename
    );
    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "Přepis je prázdný — soubor se nepodařilo rozpoznat." },
        { status: 422 }
      );
    }

    const note = await structureDokumentaceNote({
      transcript,
      mode: body.mode,
      templateId: template.id,
      specialty: body.specialty,
    });

    await logAiAgentUsage({
      userId: user.id,
      agent: "dokumentace",
      prompt: `process-file:${body.mode}:${template.id}:${provider}:${body.filename}:${transcript.slice(0, 180)}`,
      status: "ok",
    });

    let savedId: string | null = null;
    try {
      const admin = createServiceRoleClient();
      const saved = await saveDokumentaceNote(admin, {
        userId: user.id,
        note,
        transcript,
        templateId: template.id,
        mode: body.mode,
        specialty: body.specialty,
        source,
      });
      savedId = saved.id;
    } catch {
      // best-effort
    }

    return NextResponse.json({
      transcript,
      note,
      provider,
      templateId: template.id,
      remaining: Math.max(0, access.remaining - 1),
      saved: Boolean(savedId),
      noteId: savedId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Zpracování souboru selhalo.";
    await logAiAgentUsage({
      userId: user.id,
      agent: "dokumentace",
      prompt: "process-file:error",
      status: "error",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
