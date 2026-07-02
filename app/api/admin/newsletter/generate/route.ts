import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { publishNewsletterIssue } from "@/lib/v23/newsletter/engine";
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

    revalidatePath("/admin/newsletter");
    revalidatePath("/newsletter");
    revalidatePath("/newsletter/posledni");
    revalidatePath("/newsletter/archiv");
    revalidatePath(`/newsletter/${result.slug}`);
    revalidatePath("/");

    return NextResponse.json({ ok: true, slug: result.slug, draft, sources: result.sources });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
