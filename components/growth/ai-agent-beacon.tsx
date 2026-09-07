"use client";

import { useEffect } from "react";
import { AI_REF_COOKIE, AI_REF_MAX_AGE_SEC, parseAiAgentFromSearch } from "@/lib/growth/ai-agent-program";
import { readAiRefFromDocumentCookie } from "@/lib/growth/ai-ref-cookie";
import { detectAiReferrer } from "@/lib/growth/ai-referrer";

/** Captures legal AI-agent attribution. Renders nothing. */
export function AiAgentBeacon({ locale = "cs" }: { locale?: string }) {
  useEffect(() => {
    const fromUrl = parseAiAgentFromSearch(window.location.search);
    const fromReferer = detectAiReferrer(document.referrer);
    const existing = readAiRefFromDocumentCookie();
    const agent = fromUrl ?? existing ?? fromReferer;
    if (!agent) return;
    document.cookie = `${AI_REF_COOKIE}=${encodeURIComponent(agent)}; Path=/; Max-Age=${AI_REF_MAX_AGE_SEC}; SameSite=Lax`;
    const fresh = fromUrl ?? (!existing ? fromReferer : null);
    if (!fresh) return;
    if (existing === fresh) return;
    void fetch("/api/growth/ai-referral", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent,
        locale,
        path: window.location.pathname,
        kind: "visit",
      }),
    }).catch(() => {
      /* best-effort */
    });
  }, [locale]);
  return null;
}
