import { NextResponse } from "next/server";
import { normalizeAiAgentSlug } from "@/lib/growth/ai-agent-program";
import { requestCountry } from "@/lib/growth/request-country";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { agent?: string; locale?: string; path?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const agent = normalizeAiAgentSlug(body.agent);
  if (!agent) return NextResponse.json({ ok: false }, { status: 400 });
  const kind = body.kind === "checkout" ? "ai_agent_checkout" : "ai_agent_visit";
  const country = requestCountry(request.headers);
  await logMonetizationEvent(kind, {
    agent,
    locale: String(body.locale ?? "").slice(0, 16),
    path: String(body.path ?? "").slice(0, 180),
    ...(country ? { country } : {}),
  });
  return NextResponse.json({ ok: true });
}
