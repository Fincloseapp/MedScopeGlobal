import { type AiAgentSlug } from "@/lib/growth/ai-agent-program";
import { requestCountry } from "@/lib/growth/request-country";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

/**
 * Named assistant crawlers only. Generic search bots (Googlebot, bingbot,
 * Applebot, DuckDuckBot) must not be dumped onto a vendor slug.
 */
const CRAWLER_RULES: { test: RegExp; agent: Exclude<AiAgentSlug, "other"> }[] = [
  { test: /chatgpt-user|gptbot|oai-searchbot/i, agent: "chatgpt" },
  { test: /claude-user|claudebot|anthropic-ai|claude-searchbot|claude-web/i, agent: "claude" },
  { test: /google-extended|google-cloudvertexbot|gemini-deep-research|gemini-app/i, agent: "gemini" },
  { test: /perplexitybot|perplexity-user/i, agent: "perplexity" },
  { test: /copilot-user|microsoft-copilot/i, agent: "copilot" },
  { test: /grokbot|grok-crawler|xai-crawler|xai-grok/i, agent: "grok" },
  { test: /youbot|you-search/i, agent: "you" },
  { test: /duckassistbot|duckassist/i, agent: "duckassist" },
  { test: /meta-externalagent|meta-externalfetcher/i, agent: "meta-ai" },
  { test: /applebot-extended/i, agent: "apple" },
  { test: /amazonbot/i, agent: "amazon" },
  { test: /deepseekbot|deepseek-crawler|deepseek/i, agent: "deepseek" },
  { test: /mistralai-user|mistralai-crawler|mistralai/i, agent: "mistral" },
  { test: /cursor-crawler|cursorbot/i, agent: "cursor" },
];

export function detectAiCrawler(userAgent?: string | null): Exclude<AiAgentSlug, "other"> | null {
  const ua = String(userAgent ?? "").trim();
  if (!ua) return null;
  for (const rule of CRAWLER_RULES) {
    if (rule.test.test(ua)) return rule.agent;
  }
  return null;
}

export async function logAiCrawlerVisit(
  request: Request,
  path: string,
  locale?: string | null
): Promise<void> {
  const agent = detectAiCrawler(request.headers.get("user-agent"));
  if (!agent) return;
  const url = new URL(request.url);
  const edition = (locale ?? url.searchParams.get("lang") ?? "en").slice(0, 16);
  const country = requestCountry(request.headers);
  await logMonetizationEvent("ai_agent_visit", {
    agent,
    locale: edition,
    path,
    via: "crawler",
    ...(country ? { country } : {}),
  });
}
