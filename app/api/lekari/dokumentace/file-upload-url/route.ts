import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { withApiGuard } from "@/lib/security/api-guard";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "media";
const PREFIX = "mediktor-temp";

/**
 * Issue a short-lived signed upload URL so the phone can PUT the file
 * straight to Supabase Storage (avoids Vercel body limits / Failed to fetch).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "dokumentace_file_upload_url",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  const eligibility = await getDokumentaceEligibility(user.id);
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
    return NextResponse.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const bytes = Number(body.byteLength ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return NextResponse.json({ error: "Chybí velikost souboru." }, { status: 400 });
  }
  if (bytes > 25 * 1024 * 1024) {
    return NextResponse.json(
      {
        error:
          "Soubor je větší než 25 MB. Nahrajte kratší nahrávku nebo použijte Nahrávat v OrdiZapisu.",
      },
      { status: 413 }
    );
  }

  const rawName = String(body.filename || "recording.m4a");
  const extMatch = rawName.toLowerCase().match(/\.([a-z0-9]{2,5})$/);
  const ext = extMatch?.[1] || "m4a";
  const path = `${PREFIX}/${user.id}/${randomUUID()}.${ext}`;
  const mimeType = String(body.mimeType || "audio/mp4").slice(0, 120);

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: true });

    if (error || !data?.token || !data?.path) {
      return NextResponse.json(
        {
          error: error?.message || "Nepodařilo se připravit upload URL.",
          fallback: "chunked",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      mimeType,
      maxFileBytes: 25 * 1024 * 1024,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage není dostupný.";
    return NextResponse.json({ error: message, fallback: "chunked" }, { status: 502 });
  }
}
