import { NextResponse } from "next/server";
import {
  AI_REF_COOKIE,
  AI_REF_MAX_AGE_SEC,
  attributionUrl,
  normalizeAiAgentSlug,
} from "@/lib/growth/ai-agent-program";
import { parseArenaRef, arenaHopPath } from "@/lib/growth/arena/refs";
import { requestCountry } from "@/lib/growth/request-country";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

const SECTION_COOKIE = "ms_ai_section";

/** Shared hop: query `/r/ai?ref=claude` and path `/r/ai/claude`. */
export async function handleAiHop(request: Request, pathAgent?: string): Promise<NextResponse> {
  const url = new URL(request.url);
  const rawRef =
    url.searchParams.get("ref") ??
    url.searchParams.get("agent") ??
    url.searchParams.get("utm_source") ??
    pathAgent ??
    "";
  const agent = normalizeAiAgentSlug(rawRef);
  const arena = parseArenaRef(rawRef, url.searchParams.get("section"));
  const locale = (url.searchParams.get("locale") ?? "en").slice(0, 16);
  const toParam = url.searchParams.get("to");
  const dest =
    toParam === "apps"
      ? "/aplikace"
      : toParam === "newsletter"
        ? "/newsletter/posledni"
        : toParam === "articles"
          ? "/articles"
          : arena
            ? arenaHopPath(arena.section, locale)
            : "/predplatne";

  if (agent) {
    const country = requestCountry(request.headers);
    await logMonetizationEvent("ai_agent_visit", {
      agent,
      locale,
      path: dest,
      via: "hop",
      ...(country ? { country } : {}),
      ...(arena
        ? { team: arena.team, section: arena.section, role: arena.role ?? "distribution" }
        : {}),
    });
  }

  const target = agent
    ? attributionUrl(dest, locale, agent)
    : attributionUrl(dest, locale, "other");
  const response = NextResponse.redirect(target, 302);
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  if (agent) {
    response.cookies.set(AI_REF_COOKIE, agent, {
      path: "/",
      maxAge: AI_REF_MAX_AGE_SEC,
      sameSite: "lax",
    });
  }
  if (arena) {
    response.cookies.set(SECTION_COOKIE, arena.section, {
      path: "/",
      maxAge: AI_REF_MAX_AGE_SEC,
      sameSite: "lax",
    });
  }
  return response;
}
