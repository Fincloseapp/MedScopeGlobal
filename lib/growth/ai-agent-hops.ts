import { RANKED_AI_AGENT_SLUGS, agentHopUrl } from "@/lib/growth/ai-agent-program";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { getSiteUrl } from "@/lib/config/site-url";

const ROTATE_CHUNK = 4;
const ROTATE_MS = 15 * 60 * 1000;

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
