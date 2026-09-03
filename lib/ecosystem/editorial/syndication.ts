/** Syndication rules — meaningful sharing/adoption across locales */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { attachDeskComments, buildDeskComment } from "@/lib/editorial/desk-comments";
import { getDeskForLocale, getSyndicationHubDesks } from "./desks";

export type SyndicationMode =
  | "original"
  | "adapted_translation"
  | "summary_adaptation"
  | "cross_reference";

export type SyndicationRule = {
  sourceLocale: GlobalLocaleCode;
  targetLocales: GlobalLocaleCode[];
  mode: SyndicationMode;
  minQualityScore?: number;
  requiresComplianceReview: boolean;
  preserveAuthorAttribution: boolean;
  maxAgeDays?: number;
};

/** Hub locales syndicate outward; leaf locales adopt from hubs */
export const SYNDICATION_RULES: SyndicationRule[] = [
  {
    sourceLocale: "cs",
    targetLocales: ["sk", "pl"],
    mode: "adapted_translation",
    requiresComplianceReview: true,
    preserveAuthorAttribution: true,
    maxAgeDays: 14,
  },
  {
    sourceLocale: "cs",
    targetLocales: ["en", "en-US", "de"],
    mode: "summary_adaptation",
    requiresComplianceReview: true,
    preserveAuthorAttribution: true,
    maxAgeDays: 7,
  },
  {
    sourceLocale: "en-US",
    targetLocales: ["en"],
    mode: "cross_reference",
    requiresComplianceReview: false,
    preserveAuthorAttribution: true,
    maxAgeDays: 3,
  },
  {
    sourceLocale: "en-US",
    targetLocales: ["cs", "de", "fr", "es", "it", "pl"],
    mode: "adapted_translation",
    requiresComplianceReview: true,
    preserveAuthorAttribution: true,
    maxAgeDays: 10,
  },
  {
    sourceLocale: "en",
    targetLocales: ["fr", "es", "it", "pt", "pt-BR", "de", "pl", "ru", "uk", "zh-CN", "ja"],
    mode: "summary_adaptation",
    requiresComplianceReview: true,
    preserveAuthorAttribution: true,
    maxAgeDays: 10,
  },
  {
    sourceLocale: "de",
    targetLocales: ["cs", "sk", "pl", "hu"],
    mode: "adapted_translation",
    requiresComplianceReview: true,
    preserveAuthorAttribution: true,
    maxAgeDays: 14,
  },
];

export type SyndicationCandidate = {
  sourceArticleId: string;
  sourceSlug: string;
  sourceLocale: GlobalLocaleCode;
  targetLocale: GlobalLocaleCode;
  mode: SyndicationMode;
  sourceAuthorUnitId?: string;
};

export function getSyndicationTargets(sourceLocale: GlobalLocaleCode): SyndicationRule[] {
  return SYNDICATION_RULES.filter((r) => r.sourceLocale === sourceLocale);
}

export function canSyndicateTo(
  sourceLocale: GlobalLocaleCode,
  targetLocale: GlobalLocaleCode
): SyndicationRule | undefined {
  return SYNDICATION_RULES.find(
    (r) => r.sourceLocale === sourceLocale && r.targetLocales.includes(targetLocale)
  );
}

export function isSyndicationHub(locale: GlobalLocaleCode): boolean {
  return getSyndicationHubDesks().some((d) => d.locale === locale);
}

export function buildSyndicationMetadata(candidate: SyndicationCandidate): Record<string, unknown> {
  const comment = buildDeskComment({
    fromLocale: candidate.targetLocale,
    onLocale: candidate.sourceLocale,
    kind: candidate.mode === "cross_reference" ? "cross_reference" : "borrow",
  });
  return attachDeskComments(
    {
      syndicated_from: candidate.sourceArticleId,
      syndicated_from_slug: candidate.sourceSlug,
      syndicated_from_locale: candidate.sourceLocale,
      syndication_mode: candidate.mode,
      syndicated_at: new Date().toISOString(),
      original_author_unit: candidate.sourceAuthorUnitId ?? null,
      native_first: true,
    },
    comment
  );
}

export function getAdoptableSourceLocales(targetLocale: GlobalLocaleCode): GlobalLocaleCode[] {
  const sources = new Set<GlobalLocaleCode>();
  for (const rule of SYNDICATION_RULES) {
    if (rule.targetLocales.includes(targetLocale)) {
      sources.add(rule.sourceLocale);
    }
  }
  if (sources.size === 0) {
    const hub = getDeskForLocale(targetLocale);
    if (!hub.syndicationHub) sources.add("cs");
  }
  return [...sources];
}
