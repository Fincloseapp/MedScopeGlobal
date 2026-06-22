import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export type StudentAdCampaignInput = {
  title?: string;
  body_html?: string;
  type?: string;
  study_years?: number[];
  med_tracks?: string[];
  target_topics?: string[];
  affiliate_url?: string | null;
  cta_text?: string | null;
  frequency?: number;
  active?: boolean;
};

const VALID_TYPES = new Set(["inline", "banner", "sidebar", "footer"]);

function sanitizeCampaign(body: StudentAdCampaignInput) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) row.title = body.title.trim();
  if (body.body_html !== undefined) row.body_html = body.body_html;
  if (body.type !== undefined) {
    if (!VALID_TYPES.has(body.type)) throw new Error("invalid type");
    row.type = body.type;
  }
  if (body.study_years !== undefined) {
    row.study_years = body.study_years.filter((y) => y >= 1 && y <= 6);
  }
  if (body.med_tracks !== undefined) row.med_tracks = body.med_tracks;
  if (body.target_topics !== undefined) row.target_topics = body.target_topics;
  if (body.affiliate_url !== undefined) row.affiliate_url = body.affiliate_url;
  if (body.cta_text !== undefined) row.cta_text = body.cta_text;
  if (body.frequency !== undefined) {
    row.frequency = Math.min(10, Math.max(1, Number(body.frequency)));
  }
  if (body.active !== undefined) row.active = Boolean(body.active);
  return row;
}

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("active") === "1";
  const admin = createServiceRoleClient();
  let q = admin.from("student_ad_campaigns").select("*").order("updated_at", { ascending: false });
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, campaigns: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as StudentAdCampaignInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const row = {
      title: body.title.trim(),
      body_html: body.body_html ?? "",
      type: VALID_TYPES.has(body.type ?? "") ? body.type : "inline",
      study_years: (body.study_years ?? []).filter((y) => y >= 1 && y <= 6),
      med_tracks: body.med_tracks ?? [],
      target_topics: body.target_topics ?? [],
      affiliate_url: body.affiliate_url ?? null,
      cta_text: body.cta_text ?? null,
      frequency: Math.min(10, Math.max(1, Number(body.frequency ?? 1))),
      active: body.active !== false,
    };

    const admin = createServiceRoleClient();
    const { data, error } = await admin.from("student_ad_campaigns").insert(row).select("*").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, campaign: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as StudentAdCampaignInput & { id?: string };
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const row = sanitizeCampaign(body);
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("student_ad_campaigns")
      .update(row)
      .eq("id", body.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, campaign: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createServiceRoleClient();
  const { error } = await admin.from("student_ad_campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: id });
}
