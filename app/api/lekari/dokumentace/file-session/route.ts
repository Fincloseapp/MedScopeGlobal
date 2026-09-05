import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { dokumentaceLocaleFromRequest } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a chunked phone-file upload session (bypasses browser audio decode). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_file_session",
  });
  if (!guard.ok) return guard.response;
  const locale = dokumentaceLocaleFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: getOrdiZapisApiCopy(locale).errLoginRequired },
      { status: 401 }
    );
  }

  const eligibility = await getDokumentaceEligibility(user.id, locale);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: eligibility.message, code: "DOCTOR_VERIFICATION_REQUIRED" },
      { status: 403 }
    );
  }

  let body: { byteLength?: number; filename?: string; mimeType?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // optional body
  }

  const bytes = Number(body.byteLength ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return NextResponse.json({ error: "Chybí velikost souboru." }, { status: 400 });
  }
  if (bytes > 25 * 1024 * 1024) {
    return NextResponse.json(
      {
        error:
          "Soubor je větší než 25 MB (limit přepisu). Nahrajte kratší nahrávku nebo použijte Nahrávat v OrdiZapisu.",
      },
      { status: 413 }
    );
  }

  const sessionId = randomUUID();
  return NextResponse.json({
    sessionId,
    maxChunkBytes: 3_000_000,
    maxFileBytes: 25 * 1024 * 1024,
  });
}
