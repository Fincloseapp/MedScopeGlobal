import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { withApiGuard } from "@/lib/security/api-guard";
import { logAiAgentUsage } from "@/lib/security/ai-abuse";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { transcribeAudio } from "@/lib/lekari/dokumentace/stt";
import { dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";

export const runtime = "nodejs";
export const maxDuration = 300;

const BUCKET = "media";
const PREFIX = "mediktor-temp";

const bodySchema = z
  .object({
    /** Whole-file path from signed upload */
    path: z.string().min(8).max(240).optional(),
    /** Chunked upload session */
    sessionId: z.string().uuid().optional(),
    total: z.number().int().min(1).max(40).optional(),
    filename: z.string().min(1).max(180),
    mimeType: z.string().min(1).max(120),
    locale: z.string().max(16).optional(),
  })
  .refine((b) => Boolean(b.path) || Boolean(b.sessionId && b.total), {
    message: "path or sessionId+total required",
  });

function assertOwnedPath(userId: string, path: string): boolean {
  const expected = `${PREFIX}/${userId}/`;
  return path.startsWith(expected) && !path.includes("..");
}

async function downloadFromPath(path: string): Promise<Buffer> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !data) {
    throw new Error("Soubor se nepodařilo načíst ze storage. Nahrajte znovu.");
  }
  try {
    await admin.storage.from(BUCKET).remove([path]);
  } catch {
    // ignore cleanup errors
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  if (buffer.byteLength === 0) throw new Error("Nahraný soubor je prázdný.");
  if (buffer.byteLength > 25 * 1024 * 1024) {
    throw new Error("Soubor přesahuje 25 MB.");
  }
  return buffer;
}

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

  try {
    await admin.storage.from(BUCKET).remove(paths);
  } catch {
    // ignore
  }

  const assembled = Buffer.concat(parts);
  if (assembled.byteLength === 0) throw new Error("Složený soubor je prázdný.");
  if (assembled.byteLength > 25 * 1024 * 1024) {
    throw new Error("Soubor po složení přesahuje 25 MB.");
  }
  return assembled;
}

/** STT only — structure runs in a separate short request (avoids gateway timeouts). */
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

  const eligibility = await getDokumentaceEligibility(user.id);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.message }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup process-file." }, { status: 400 });
  }

  if (body.path && !assertOwnedPath(user.id, body.path)) {
    return NextResponse.json({ error: "Neplatná cesta souboru." }, { status: 403 });
  }

  try {
    const buffer = body.path
      ? await downloadFromPath(body.path)
      : await downloadAssembled(user.id, body.sessionId!, body.total!);

    const locale = dokumentaceLocaleFromRequest(request, body.locale);
    const { text: transcript, provider } = await transcribeAudio(
      buffer,
      body.mimeType,
      body.filename,
      locale
    );
    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "Přepis je prázdný — soubor se nepodařilo rozpoznat." },
        { status: 422 }
      );
    }

    await logAiAgentUsage({
      userId: user.id,
      agent: "dokumentace",
      prompt: `process-file-stt:${provider}:${body.filename}:${transcript.slice(0, 180)}`,
      status: "ok",
    });

    return NextResponse.json({ transcript, provider });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Přepis souboru selhal.";
    await logAiAgentUsage({
      userId: user.id,
      agent: "dokumentace",
      prompt: "process-file-stt:error",
      status: "error",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
