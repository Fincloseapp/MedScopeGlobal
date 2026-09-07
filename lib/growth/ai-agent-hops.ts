import { RANKED_AI_AGENT_SLUGS, agentHopPathUrl, agentHopUrl } from "@/lib/growth/ai-agent-program";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { getSiteUrl } from "@/lib/config/site-url";

const ROTATE_CHUNK = 4;
const ROTATE_MS = 15 * 60 * 1000;

/** Pay markets — every ranked agent gets a predplatne hop here each cron tick. */
export const CONVERSION_HOP_LOCALES = [
  "cs",
  "sk",
  "de",
  "fr",
  "en",
  "en-US",
  "en-UK",
  "es",
  "it",
  "pt",
  "ja",
] as const;

export function rankedAgentHopUrls(
  base = getSiteUrl(),
  locales: readonly string[] = ARENA_DISCOVERY_LOCALES,
  agents: readonly string[] = RANKED_AI_AGENT_SLUGS
): string[] {
  const urls: string[] = [];
  for (const agent of agents) {
    for (const locale of locales) {
      urls.push(agentHopUrl(agent, locale, base));
    }
  }
  return urls;
}

/** Four ranked agents × every edition per 15-minute slot so IndexNow covers 4–16. */
export function rotatedRankedAgentHopUrls(at = new Date(), base = getSiteUrl()): string[] {
  const slots = Math.ceil(RANKED_AI_AGENT_SLUGS.length / ROTATE_CHUNK);
  const slot = Math.floor(at.getTime() / ROTATE_MS) % slots;
  const agents = RANKED_AI_AGENT_SLUGS.slice(slot * ROTATE_CHUNK, slot * ROTATE_CHUNK + ROTATE_CHUNK);
  return rankedAgentHopUrls(base, ARENA_DISCOVERY_LOCALES, agents);
}

export function priorityAgentHopUrls(base = getSiteUrl()): string[] {
  return RANKED_AI_AGENT_SLUGS.map((agent) => agentHopUrl(agent, "en", base));
}

/**
 * Every ranked agent, every pay-market locale, query + path hop.
 * Extra query hops land on the newsstand and article hub (year-first pay).
 * IndexNow ping is not a visit and not a win — it only asks Bing/Yandex to fetch.
 */
export function conversionHopUrls(base = getSiteUrl()): string[] {
  const urls = new Set<string>();
  for (const agent of RANKED_AI_AGENT_SLUGS) {
    for (const locale of CONVERSION_HOP_LOCALES) {
      urls.add(agentHopUrl(agent, locale, base));
      urls.add(agentHopPathUrl(agent, locale, base));
      urls.add(agentHopUrl(agent, locale, base, "newsletter"));
      urls.add(agentHopUrl(agent, locale, base, "articles"));
    }
  }
  return [...urls];
}
