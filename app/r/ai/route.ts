import { NextResponse } from "next/server";
import {
  AI_REF_COOKIE,
  AI_REF_MAX_AGE_SEC,
  attributionUrl,
  normalizeAiAgentSlug,
} from "@/lib/growth/ai-agent-program";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

export const dynamic = "force-dynamic";

/** Stable hop for AI agents: /r/ai?ref=claude&locale=de&to=predplatne */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const agent = normalizeAiAgentSlug(
    url.searchParams.get("ref") ?? url.searchParams.get("agent") ?? url.searchParams.get("utm_source")
  );
  const locale = (url.searchParams.get("locale") ?? "en").slice(0, 16);
  const dest = url.searchParams.get("to") === "apps" ? "/aplikace" : "/predplatne";

  if (agent) {
    await logMonetizationEvent("ai_agent_visit", {
      agent,
      locale,
      path: dest,
      via: "hop",
    });
  }

  const target = agent ? attributionUrl(dest, locale, agent) : attributionUrl(dest, locale, "other");
  const response = NextResponse.redirect(target, 302);
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (agent) {
    response.cookies.set(AI_REF_COOKIE, agent, {
      path: "/",
      maxAge: AI_REF_MAX_AGE_SEC,
      sameSite: "lax",
    });
  }
  return response;
}
