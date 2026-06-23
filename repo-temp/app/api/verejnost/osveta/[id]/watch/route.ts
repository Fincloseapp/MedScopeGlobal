import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardPublicOsvetaWatchXp } from "@/lib/verejnost/osveta/db";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Přihlaste se pro získání XP" }, { status: 401 });
  }

  try {
    const result = await awardPublicOsvetaWatchXp(user.id, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
