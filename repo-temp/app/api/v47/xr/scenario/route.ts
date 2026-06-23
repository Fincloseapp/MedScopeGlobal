import { buildXrScenario } from "@/lib/v47/xr/scenario";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await parseV47Body<{ topic?: string; difficulty?: string }>(req);
  if (!body?.topic?.trim()) return v47Json({ error: "topic required" }, 400);
  const scenario = buildXrScenario({ topic: body.topic, difficulty: body.difficulty });
  return v47Json({ ok: true, scenario, scaffold: true });
}
