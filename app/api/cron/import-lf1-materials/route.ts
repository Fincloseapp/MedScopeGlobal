import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { runLf1MaterialsImport } from "@/lib/studenti/lf1-import";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Import LF1.CZ study materials metadata (external links only).
 * GET /api/cron/import-lf1-materials
 */
export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const supabase = createServiceRoleClient();
    const result = await runLf1MaterialsImport(supabase);
    return NextResponse.json({
      ok: true,
      legal: {
        hosting: "external_link",
        note: "Metadata index only; files remain on lf1.cz",
      },
      ...result,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
