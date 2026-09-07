import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { isArenaTeamSlug, type ArenaRole, ARENA_ROLES } from "@/lib/growth/arena/config";
import { writeBus } from "@/lib/growth/arena/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    team?: string;
    from?: string;
    to?: string;
    kind?: string;
    body?: Record<string, unknown>;
  };
  if (!isArenaTeamSlug(body.team)) {
    return NextResponse.json({ error: "team" }, { status: 400 });
  }
  const from = ARENA_ROLES.includes(body.from as ArenaRole) ? (body.from as ArenaRole) : "analyst";
  const to = ARENA_ROLES.includes(body.to as ArenaRole) ? (body.to as ArenaRole) : "content";
  await writeBus({
    teamSlug: body.team,
    fromRole: from,
    toRole: to,
    kind: String(body.kind ?? "note").slice(0, 40),
    body: body.body ?? {},
  });
  return NextResponse.json({ ok: true });
}
