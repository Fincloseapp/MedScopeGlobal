/** Legal, geo, age, and inclusivity rules for editorial images */

import { CONTENT_GUARDRAILS } from "@/lib/ecosystem/autonomous";
import {
  classifyCoverTopic,
  isBrokenCoverUrl,
  isClinicalOrBrainCoverUrl,
  isDeniedStockUrl,
  isFoodCoverUrl,
  isStaleGenericStockUrl,
  type CoverVisualTopic,
} from "@/lib/ecosystem/editorial/images/cover";
import type { EditorialTopic } from "../desks";
import type { ImageComplianceResult } from "./types";

/** Blocked visual topics — politics, violence, stereotypes, misleading health */
export const BLOCKED_IMAGE_TOPICS = [
  ...CONTENT_GUARDRAILS.blockedTopics,
  "politics",
  "political",
  "election",
  "war",
  "violence",
  "weapon",
  "stereotype",
  "discrimination",
  "partisan",
  "protest rally",
  "flag waving",
  "miracle cure",
  "before after weight loss",
  "extreme body transformation",
] as const;

export const BLOCKED_IMAGE_URL_PATTERNS = [
  /politic/i,
  /election/i,
  /war/i,
  /weapon/i,
  /gun/i,
  /protest/i,
  /partisan/i,
  /miracle/i,
  /weight.?loss.?before/i,
] as const;

/** Inclusive imagery guidelines — globally acceptable health editorial */
export const INCLUSIVITY_RULES = {
  representAgeGroups: ["young_adult", "middle_aged", "seniors"],
  requireDiverseRepresentation: true,
  avoidSingleEthnicityDefault: true,
  seniorsFriendly: true,
  noMedicalFearImagery: true,
  noMisleadingClinicalClaims: true,
} as const;

export const TOPIC_VISUAL_GUIDELINES: Record<
  EditorialTopic,
  { mood: string; avoid: string[]; focus: string[] }
> = {
  longevity: {
    mood: "calm, optimistic, active aging",
    avoid: ["extreme anti-aging", "miracle pills", "celebrity endorsements"],
    focus: ["movement", "nutrition", "sleep", "prevention"],
  },
  lifestyle: {
    mood: "warm, everyday wellness",
    avoid: ["luxury excess", "diet shaming", "unrealistic fitness"],
    focus: ["balanced meals", "walking", "mindfulness", "habits"],
  },
  seniors: {
    mood: "dignified, accessible, supportive",
    avoid: ["frailty stereotypes", "patronizing poses", "isolation tropes"],
    focus: ["community", "mobility", "care coordination", "independence"],
  },
  trending: {
    mood: "informative, neutral, evidence-led",
    avoid: ["alarmist headlines", "political health debates", "sensationalism"],
    focus: ["research", "public health", "prevention updates"],
  },
};

const PLACEHOLDER_PATTERNS = [
  /^$/,
  /^data:/,
  /placeholder/i,
  /via\.placeholder/i,
  /picsum\.photos/i,
  /dummyimage/i,
];

/** Articles without a suitable hero image (missing, placeholder, or stale generic) */
export function isMissingOrStaleHeroImage(coverUrl: string | null | undefined): boolean {
  if (!coverUrl?.trim()) return true;
  const url = coverUrl.trim();
  if (PLACEHOLDER_PATTERNS.some((p) => p.test(url))) return true;
  if (isBrokenCoverUrl(url) || isStaleGenericStockUrl(url)) return true;
  return false;
}

export function scanTextForBlockedTopics(text: string): string[] {
  const lower = text.toLowerCase();
  return BLOCKED_IMAGE_TOPICS.filter((term) => lower.includes(term.toLowerCase()));
}

/** Global deny list — brain-on-stick, doctor-phone, v25 clinical stock leftovers. */
export function isDeniedEditorialImageUrl(url: string | null | undefined): boolean {
  return isDeniedStockUrl(url);
}

export function validateVisualTopicMatch(input: {
  url: string;
  articleTitle?: string | null;
  articleSlug?: string | null;
  excerpt?: string | null;
  visualTopic?: CoverVisualTopic;
}): string[] {
  const issues: string[] = [];

  if (isDeniedEditorialImageUrl(input.url)) {
    issues.push("URL matches denied editorial stock (brain-on-stick, doctor-phone, or blocked v25/Unsplash ID)");
  }

  const visual =
    input.visualTopic ??
    classifyCoverTopic({
      title: input.articleTitle,
      slug: input.articleSlug,
      excerpt: input.excerpt,
    });

  if (visual === "food") {
    if (isClinicalOrBrainCoverUrl(input.url)) {
      issues.push("Food/nutrition article must not use clinical, lab, or brain imagery");
    } else if (input.url.includes("/assets/covers/") && !isFoodCoverUrl(input.url)) {
      issues.push("Food article must use food or produce cover from local pool");
    }
  }

  if (
    (visual === "sleep" || visual === "calm") &&
    isClinicalOrBrainCoverUrl(input.url)
  ) {
    issues.push("Sleep/wellness article must not use clinical or brain stock");
  }

  return issues;
}

export function validateImageCompliance(input: {
  url: string;
  altTextCs: string;
  altTextEn: string;
  topic: EditorialTopic;
  articleTitle?: string;
  articleSlug?: string;
  excerpt?: string | null;
  visualTopic?: CoverVisualTopic;
}): ImageComplianceResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (isDeniedEditorialImageUrl(input.url)) {
    issues.push("Denied editorial stock URL (brain-on-stick, doctor-phone, or blocked remote ID)");
  }

  for (const pattern of BLOCKED_IMAGE_URL_PATTERNS) {
    if (pattern.test(input.url)) {
      issues.push(`URL matches blocked pattern: ${pattern.source}`);
    }
  }

  const altBlocked = [
    ...scanTextForBlockedTopics(input.altTextCs),
    ...scanTextForBlockedTopics(input.altTextEn),
  ];
  for (const term of altBlocked) {
    issues.push(`Alt text contains blocked term: ${term}`);
  }

  const titleBlocked = input.articleTitle
    ? scanTextForBlockedTopics(input.articleTitle)
    : [];
  for (const term of titleBlocked) {
    if (/politic|election|war|violence/i.test(term)) {
      issues.push(`Article title suggests blocked visual context: ${term}`);
    }
  }

  if (!input.altTextCs.trim() || input.altTextCs.length < 12) {
    issues.push("Czech alt text too short for accessibility");
    suggestions.push("Add descriptive Czech alt text (min. 12 chars)");
  }

  if (!input.altTextEn.trim() || input.altTextEn.length < 12) {
    issues.push("English alt text too short for accessibility");
    suggestions.push("Add descriptive English alt text (min. 12 chars)");
  }

  const guidelines = TOPIC_VISUAL_GUIDELINES[input.topic];
  const altCombined = `${input.altTextCs} ${input.altTextEn}`.toLowerCase();
  for (const avoid of guidelines.avoid) {
    if (altCombined.includes(avoid.toLowerCase())) {
      issues.push(`Alt text conflicts with ${input.topic} guideline: ${avoid}`);
    }
  }

  for (const mismatch of validateVisualTopicMatch({
    url: input.url,
    articleTitle: input.articleTitle,
    articleSlug: input.articleSlug,
    excerpt: input.excerpt,
    visualTopic: input.visualTopic,
  })) {
    issues.push(mismatch);
  }

  if (!altCombined.includes("ilustr") && !altCombined.includes("illustr") && !altCombined.includes("photo")) {
    suggestions.push("Prefer alt text that clarifies editorial/stock context");
  }

  return {
    passed: issues.length === 0,
    issues,
    suggestions,
  };
}
