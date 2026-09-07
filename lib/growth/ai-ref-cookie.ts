import { AI_REF_COOKIE, normalizeAiAgentSlug, type AiAgentSlug } from "@/lib/growth/ai-agent-program";

export function readAiRefFromCookieHeader(cookieHeader?: string | null): AiAgentSlug | null {
  const raw = String(cookieHeader ?? "");
  const match = raw.match(new RegExp(`(?:^|;\\s*)${AI_REF_COOKIE}=([^;]+)`));
  if (!match?.[1]) return null;
  try {
    return normalizeAiAgentSlug(decodeURIComponent(match[1]));
  } catch {
    return normalizeAiAgentSlug(match[1]);
  }
}

export function readAiRefFromDocumentCookie(): AiAgentSlug | null {
  if (typeof document === "undefined") return null;
  return readAiRefFromCookieHeader(document.cookie);
}
