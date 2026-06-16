import { NextResponse } from "next/server";
import { getTextbookBySlug, listTextbooks } from "@/lib/academy/db";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  try {
    if (slug) {
      const textbook = await getTextbookBySlug(slug);
      if (!textbook) {
        return NextResponse.json({ error: "Učebnice nenalezena" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, textbook });
    }

    const textbooks = await listTextbooks();
    return NextResponse.json({ ok: true, textbooks });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { title?: string; slug?: string; content_ref?: string };
    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: "title a slug jsou povinné" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("textbooks")
      .insert({
        title: body.title.trim(),
        slug: body.slug.trim(),
        content_ref: body.content_ref ?? null,
        status: "draft",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, textbook: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
