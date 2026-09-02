import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { publishNewsletterIssue } from "@/lib/v23/newsletter/engine";
import { revalidateNewsletterSurfaces } from "@/lib/v23/newsletter/revalidate";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishNewsletterIssue();
    const admin = createServiceRoleClient();
    const { data: draft } = await admin.from("newsletters").select("*").eq("id", result.id).maybeSingle();

    revalidateNewsletterSurfaces(result.slug);

    return NextResponse.json({ ok: true, slug: result.slug, draft, sources: result.sources });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
