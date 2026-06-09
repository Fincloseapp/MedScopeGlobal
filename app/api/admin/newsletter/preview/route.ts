import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { buildNewsletterDraft } from "@/lib/v23/newsletter/engine";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await buildNewsletterDraft();
    const admin = createServiceRoleClient();
    const issueDate = new Date().toISOString().slice(0, 10);
    const { data: draft } = await admin.from("newsletters").select("*").eq("slug", issueDate).maybeSingle();

    revalidatePath("/admin/newsletter");
    revalidatePath("/newsletter");

    return NextResponse.json({ ok: true, draft, sources: result.sources });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
