import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { publishNewsletterEditions } from "@/lib/v23/newsletter/engine";
import { revalidateNewsletterSurfaces } from "@/lib/v23/newsletter/revalidate";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { editions, primary } = await publishNewsletterEditions();
    const admin = createServiceRoleClient();
    const { data: draft } = await admin.from("newsletters").select("*").eq("id", primary.id).maybeSingle();

    for (const edition of editions) {
      revalidateNewsletterSurfaces(edition.slug);
    }

    return NextResponse.json({
      ok: true,
      slug: primary.slug,
      editions: editions.map((edition) => ({ slug: edition.slug, locale: edition.locale })),
      draft,
      sources: primary.sources,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
