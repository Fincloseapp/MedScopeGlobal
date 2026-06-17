import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitPublicOsvetaQuiz } from "@/lib/verejnost/osveta/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Přihlaste se pro kvíz a XP" }, { status: 401 });
  }

  let body: { answers?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatný JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.answers) || !body.answers.length) {
    return NextResponse.json({ ok: false, error: "Chybí odpovědi" }, { status: 400 });
  }

  try {
    const result = await submitPublicOsvetaQuiz(user.id, id, body.answers);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
