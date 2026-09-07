import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { parseArenaRef } from "@/lib/growth/arena/refs";
import { latestKnowledge, writeBus, writeKnowledge } from "@/lib/growth/arena/store";
import { isArenaTeamSlug } from "@/lib/growth/arena/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const ref = parseArenaRef(url.searchParams.get("team"));
  if (!ref) return NextResponse.json({ error: "team" }, { status: 400 });
  const row = await latestKnowledge(ref.team, ref.section);
  return NextResponse.json({ ok: true, knowledge: row });
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    team?: string;
    section?: string;
    styleKey?: string;
    kFactor?: number;
    insight?: string;
  };
  if (!isArenaTeamSlug(body.team)) {
    return NextResponse.json({ error: "team" }, { status: 400 });
  }
  const saved = await writeKnowledge({
    teamSlug: body.team,
    section: body.section === "dokscope" || body.section === "mediprep" ? body.section : "vialongevita",
    styleKey: String(body.styleKey ?? "clinical-short").slice(0, 40),
    kFactor: Number(body.kFactor ?? 0),
    insight: String(body.insight ?? "").slice(0, 500),
  });
  await writeBus({
    teamSlug: body.team,
    fromRole: "analyst",
    toRole: "content",
    kind: "knowledge",
    body: { id: saved.id, k: saved.kFactor },
  });
  return NextResponse.json({ ok: true, knowledge: saved });
}
