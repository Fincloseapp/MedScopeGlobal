import { type AiAgentSlug } from "@/lib/growth/ai-agent-program";

/**
 * Human click from a chat UI. Generic search (google.com, bing.com, facebook.com)
 * must not become an agent — that would invent Alfa/Beta credit.
 */
const HOST_AGENT: Record<string, Exclude<AiAgentSlug, "other">> = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "claude.ai": "claude",
  "gemini.google.com": "gemini",
  "bard.google.com": "gemini",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "copilot.microsoft.com": "copilot",
  "copilot.cloud.microsoft": "copilot",
  "grok.com": "grok",
  "grok.x.ai": "grok",
  "you.com": "you",
  "duck.ai": "duckassist",
  "meta.ai": "meta-ai",
  "www.meta.ai": "meta-ai",
  "chat.deepseek.com": "deepseek",
  "chat.mistral.ai": "mistral",
  "lechat.mistral.ai": "mistral",
  "cursor.com": "cursor",
  "www.cursor.com": "cursor",
};

function hostname(raw?: string | null): { host: string; path: string } | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return { host: url.hostname.toLowerCase(), path: url.pathname.toLowerCase() };
  } catch {
    return null;
  }
}

export function detectAiReferrer(referer?: string | null): Exclude<AiAgentSlug, "other"> | null {
  const parsed = hostname(referer);
  if (!parsed) return null;
  const mapped = HOST_AGENT[parsed.host];
  if (mapped) return mapped;
  if (parsed.host === "bing.com" || parsed.host === "www.bing.com") {
    if (parsed.path.includes("/chat") || parsed.path.includes("/copilot")) return "copilot";
    return null;
  }
  if (parsed.host === "x.com" || parsed.host === "www.x.com" || parsed.host === "twitter.com") {
    if (parsed.path.includes("/i/grok") || parsed.path.includes("/grok")) return "grok";
    return null;
  }
  if (parsed.host === "amazon.com" || parsed.host === "www.amazon.com" || parsed.host === "q.amazon.com") {
    if (parsed.host === "q.amazon.com" || parsed.path.includes("/q/") || parsed.path.startsWith("/q")) {
      return "amazon";
    }
    return null;
  }
  if (parsed.host === "duckduckgo.com" || parsed.host === "www.duckduckgo.com") {
    if (parsed.path.includes("aichat") || parsed.path.includes("chat")) return "duckassist";
    return null;
  }
  return null;
}
