import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { MarketingProposalStatus, MarketerId } from "@/lib/queries/marketing";

export const dynamic = "force-dynamic";

const VALID_STATUS = new Set<MarketingProposalStatus>(["pending", "approved", "rejected"]);
const VALID_MARKETERS = new Set<MarketerId>(["public", "students", "pro"]);

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as MarketingProposalStatus | null;
  const marketerId = url.searchParams.get("marketer") as MarketerId | null;
  const limit = Number(url.searchParams.get("limit") ?? 50);

  const admin = createServiceRoleClient();
  let q = admin
    .from("marketing_proposals")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && VALID_STATUS.has(status)) q = q.eq("status", status);
  if (marketerId && VALID_MARKETERS.has(marketerId)) q = q.eq("marketer_id", marketerId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, proposals: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: MarketingProposalStatus;
      coordinator_notes?: string;
    };

    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (!body.status || !VALID_STATUS.has(body.status)) {
      return NextResponse.json({ error: "valid status required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();

    if (body.status === "approved") {
      const { data: proposal, error: fetchErr } = await admin
        .from("marketing_proposals")
        .select("*")
        .eq("id", body.id)
        .single();
      if (fetchErr) throw fetchErr;

      const targeting = (proposal.targeting ?? {}) as Record<string, unknown>;
      const base = {
        title: proposal.title,
        body_html: proposal.body_html,
        type: proposal.campaign_type ?? "inline",
        affiliate_url: proposal.affiliate_url,
        cta_text: proposal.cta_text,
        active: true,
        proposal_id: proposal.id,
        updated_at: new Date().toISOString(),
      };

      let table: string;
      let row: Record<string, unknown>;

      if (proposal.marketer_id === "public") {
        table = "public_ad_campaigns";
        row = { ...base, target_topics: targeting.target_topics ?? [] };
      } else if (proposal.marketer_id === "students") {
        table = "student_ad_campaigns";
        row = {
          ...base,
          study_years: targeting.study_years ?? [],
          med_tracks: targeting.med_tracks ?? [],
          target_topics: targeting.target_topics ?? [],
        };
      } else {
        table = "pro_ad_campaigns";
        row = {
          ...base,
          target_specialties: targeting.target_specialties ?? [],
          b2b_category: targeting.b2b_category ?? null,
        };
      }

      const { error: campErr } = await admin.from(table).insert(row);
      if (campErr) throw campErr;
    }

    const { data, error } = await admin
      .from("marketing_proposals")
      .update({
        status: body.status,
        coordinator_notes: body.coordinator_notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, proposal: data });
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
  const { error } = await admin.from("marketing_proposals").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: id });
}
