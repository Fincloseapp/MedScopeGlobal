import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import {
  listManualAdPlacements,
  createManualAdPlacement,
  updateManualAdPlacement,
  deleteManualAdPlacement,
  updateProposalStatus,
  type ManualAdAudience,
  type ManualAdZone,
  type MarketingProposalStatus,
} from "@/lib/queries/marketing";

export const dynamic = "force-dynamic";

const VALID_AUDIENCES = new Set<ManualAdAudience>(["public", "student", "pro"]);
const VALID_ZONES = new Set<ManualAdZone>(["header", "sidebar", "inline", "footer", "article", "custom_path"]);
const VALID_PROPOSAL_STATUS = new Set<MarketingProposalStatus>(["pending", "approved", "rejected"]);

export type ManualAdInput = {
  audience?: ManualAdAudience;
  placement_zone?: ManualAdZone;
  target_path?: string;
  campaign_id?: string | null;
  html?: string;
  active?: boolean;
  priority?: number;
  created_by?: string | null;
};

function sanitizePlacement(body: ManualAdInput) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.audience !== undefined) {
    if (!VALID_AUDIENCES.has(body.audience)) throw new Error("invalid audience");
    row.audience = body.audience;
  }
  if (body.placement_zone !== undefined) {
    if (!VALID_ZONES.has(body.placement_zone)) throw new Error("invalid placement_zone");
    row.placement_zone = body.placement_zone;
  }
  if (body.target_path !== undefined) row.target_path = body.target_path.trim() || "/*";
  if (body.campaign_id !== undefined) row.campaign_id = body.campaign_id;
  if (body.html !== undefined) row.html = body.html;
  if (body.active !== undefined) row.active = Boolean(body.active);
  if (body.priority !== undefined) {
    row.priority = Math.min(100, Math.max(1, Number(body.priority)));
  }
  if (body.created_by !== undefined) row.created_by = body.created_by;
  return row;
}

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const audience = url.searchParams.get("audience") as ManualAdAudience | null;
  const activeOnly = url.searchParams.get("active") === "1";

  try {
    const placements = await listManualAdPlacements({
      audience: audience && VALID_AUDIENCES.has(audience) ? audience : undefined,
      activeOnly,
    });
    return NextResponse.json({ ok: true, placements });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ManualAdInput;
    if (!body.audience || !VALID_AUDIENCES.has(body.audience)) {
      return NextResponse.json({ error: "valid audience required" }, { status: 400 });
    }
    if (!body.placement_zone || !VALID_ZONES.has(body.placement_zone)) {
      return NextResponse.json({ error: "valid placement_zone required" }, { status: 400 });
    }
    if (!body.html?.trim()) {
      return NextResponse.json({ error: "html required" }, { status: 400 });
    }

    const placement = await createManualAdPlacement({
      audience: body.audience,
      placement_zone: body.placement_zone,
      target_path: body.target_path?.trim() || "/*",
      campaign_id: body.campaign_id ?? null,
      html: body.html,
      active: body.active !== false,
      priority: Math.min(100, Math.max(1, Number(body.priority ?? 50))),
      created_by: body.created_by ?? null,
    });

    return NextResponse.json({ ok: true, placement });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ManualAdInput & {
      id?: string;
      proposal_id?: string;
      proposal_status?: MarketingProposalStatus;
      coordinator_notes?: string;
    };

    // Approve/reject marketing proposal via manual-ads endpoint
    if (body.proposal_id && body.proposal_status) {
      if (!VALID_PROPOSAL_STATUS.has(body.proposal_status)) {
        return NextResponse.json({ error: "valid proposal_status required" }, { status: 400 });
      }
      const proposal = await updateProposalStatus(
        body.proposal_id,
        body.proposal_status,
        body.coordinator_notes
      );
      return NextResponse.json({ ok: true, proposal });
    }

    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const row = sanitizePlacement(body);
    const placement = await updateManualAdPlacement(body.id, row);
    return NextResponse.json({ ok: true, placement });
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

  try {
    await deleteManualAdPlacement(id);
    return NextResponse.json({ ok: true, deleted: id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
