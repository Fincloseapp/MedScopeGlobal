import { getSiteUrl } from "@/lib/config/site-url";
import { submitIndexNow } from "@/lib/seo/indexnow";
import type { ArenaTeamSlug } from "@/lib/growth/arena/config";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { AFRICA_DISCOVERY_LOCALES } from "@/lib/growth/africa-markets";
import { arenaHopUrl } from "@/lib/growth/arena/refs";
import { looksLikeSpam } from "@/lib/growth/arena/metrics";
import type { ContentDraft } from "@/lib/growth/arena/content-agent";
import { localeToPathSegment } from "@/lib/i18n/locale-path";

export type DistributionResult = {
  team: ArenaTeamSlug;
  submitted: number;
  status: number;
  skippedSpam: number;
  draftsHeld: number;
  error?: string;
};

/** Legal reach only: IndexNow + hop URLs. Social drafts stay queued. Never posts to Reddit/X/TikTok. */
export async function distributeTeamReach(input: {
  team: ArenaTeamSlug;
  quota: number;
  drafts: ContentDraft[];
}): Promise<DistributionResult> {
  const spamDrafts = input.drafts.filter((row) => row.spam || looksLikeSpam(row.body));
  if (spamDrafts.length > 0) {
    return {
      team: input.team,
      submitted: 0,
      status: 0,
      skippedSpam: spamDrafts.length,
      draftsHeld: input.drafts.filter((row) => row.channel === "social-draft").length,
      error: "spam_blocked",
    };
  }

  const origin = getSiteUrl();
  const urls = new Set<string>();
  for (const locale of ARENA_DISCOVERY_LOCALES) {
    urls.add(arenaHopUrl({ team: input.team, section: "vialongevita", locale, base: origin }));
  }
  for (const locale of ARENA_DISCOVERY_LOCALES) {
    urls.add(arenaHopUrl({ team: input.team, section: "dokscope", locale, base: origin }));
  }
  urls.add(arenaHopUrl({ team: input.team, section: "mediprep", locale: "cs", base: origin }));
  for (const locale of AFRICA_DISCOVERY_LOCALES) {
    const prefix = `${origin}/${localeToPathSegment(locale)}`;
    urls.add(`${prefix}/predplatne`);
    urls.add(`${prefix}/verejnost/osveta`);
    urls.add(`${prefix}/promo/klipy`);
    urls.add(`${prefix}/firmy/reklama/nova`);
  }
  const list = [...urls].slice(0, Math.max(ARENA_DISCOVERY_LOCALES.length, input.quota));
  const ping = await submitIndexNow(list);
  return {
    team: input.team,
    submitted: ping.submitted,
    status: ping.status,
    skippedSpam: 0,
    draftsHeld: input.drafts.filter((row) => row.channel === "social-draft").length,
    error: ping.error,
  };
}
