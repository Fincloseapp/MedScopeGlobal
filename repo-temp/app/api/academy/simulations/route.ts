import { NextResponse } from "next/server";
import { getSimulationBySlug, listClinicalSimulations } from "@/lib/academy/db";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  try {
    if (slug) {
      const simulation = await getSimulationBySlug(slug);
      if (!simulation) {
        return NextResponse.json({ error: "Simulace nenalezena" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, simulation });
    }

    const simulations = await listClinicalSimulations();
    return NextResponse.json({ ok: true, simulations });
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
      title?: string;
      slug?: string;
      difficulty?: string;
      scenario_json?: Record<string, unknown>;
    };

    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: "title a slug jsou povinné" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("clinical_simulations")
      .insert({
        title: body.title.trim(),
        slug: body.slug.trim(),
        difficulty: body.difficulty ?? "intermediate",
        scenario_json: body.scenario_json ?? {},
        status: "draft",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, simulation: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
