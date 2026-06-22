import { NextResponse } from "next/server";
import { listMarketplaceListings } from "@/lib/academy/db";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const listings = await listMarketplaceListings();
    return NextResponse.json({ ok: true, listings });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      course_id?: string;
      price_czk?: number;
      status?: string;
    };

    if (!body.course_id) {
      return NextResponse.json({ error: "course_id je povinný" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("marketplace_courses")
      .insert({
        course_id: body.course_id,
        price_czk: body.price_czk ?? 0,
        status: body.status ?? "listed",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, listing: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
