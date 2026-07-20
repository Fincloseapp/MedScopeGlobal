/**
 * Editorial unit attribution for video surfaces (osvěta + Academy).
 * Replaces personal presenter names with unified editorial labels.
 */

import {
  editorialUnitLabel,
  formatEditorialUnitDisplay,
  isEditorialUnitId,
  type EditorialLocale,
  type EditorialUnitId,
} from "@/lib/editorial/units";
import { pickEditorialUnitForArticle } from "@/lib/v26/editorial-unit-rotation";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";

/** Osvěta avatar_type → CZ editorial unit */
export const OSVETA_AVATAR_TO_UNIT: Record<string, EditorialUnitId> = {
  friendly_doctor: "medscope_cz_odborna",
  nurse: "medscope_cz_info_team",
  wellness_coach: "medscope_cz_klinicky_obsah",
};

/** Academy avatar_type → editorial unit */
export const ACADEMY_AVATAR_TO_UNIT: Record<string, EditorialUnitId> = {
  european_medical_lecturer: "medscope_medical_knowledge_lab",
  friendly_doctor: "medscope_cz_odborna",
  nurse: "medscope_cz_info_team",
  wellness_coach: "medscope_cz_klinicky_obsah",
};

const OSVETA_CATEGORY_TO_UNIT: Record<string, EditorialUnitId> = {
  prevence: "medscope_cz_info_team",
  nemoc: "medscope_cz_klinicka",
  dlouhovekost: "medscope_cz_klinicky_obsah",
  "zivotni-styl": "medscope_cz_klinicky_obsah",
};

export type VideoEditorialInput = {
  avatarType?: string | null;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
  audience?: "academy" | "osveta";
  locale?: EditorialLocale;
  aiAssisted?: boolean;
  /** Video slug — used for deterministic editorial unit rotation (osvěta). */
  slug?: string | null;
};

export function assignVideoEditorialUnit(input: VideoEditorialInput): EditorialUnitId {
  const meta = input.metadata ?? {};

  const avatarType = String(input.avatarType ?? "").trim();

  // Osvěta: always rotate across editorial units by slug (same model as public articles).
  if (input.audience === "osveta") {
    const seed = String(input.slug ?? meta.slug ?? input.category ?? "osveta").trim();
    return pickEditorialUnitForArticle(`osveta:${seed}`, new Date(), 0).primary;
  }

  if (isEditorialUnitId(meta.editorial_unit_primary)) {
    return meta.editorial_unit_primary;
  }

  if (input.audience === "academy") {
    return ACADEMY_AVATAR_TO_UNIT[avatarType] ?? "medscope_medical_knowledge_lab";
  }

  if (avatarType && OSVETA_AVATAR_TO_UNIT[avatarType]) {
    return OSVETA_AVATAR_TO_UNIT[avatarType]!;
  }

  const category = String(input.category ?? "").trim();
  if (category && OSVETA_CATEGORY_TO_UNIT[category]) {
    return OSVETA_CATEGORY_TO_UNIT[category]!;
  }

  return "medscope_cz_odborna";
}

export function getVideoEditorialLabel(input: VideoEditorialInput): string {
  const locale = input.locale ?? "cs";
  const meta = input.metadata ?? {};
  const aiAssisted = input.aiAssisted ?? meta.ai_assisted === true;
  const unitId = assignVideoEditorialUnit(input);
  return formatEditorialUnitDisplay(unitId, locale, aiAssisted);
}

export function buildVideoEditorialMetadataPatch(input: VideoEditorialInput): Record<string, unknown> {
  const unitId = assignVideoEditorialUnit(input);
  const aiAssisted = input.aiAssisted ?? (input.metadata?.ai_assisted !== false);
  const label = formatEditorialUnitDisplay(unitId, "cs", aiAssisted);
  return {
    editorial_unit_primary: unitId,
    ai_assisted: aiAssisted,
    presenter_name: null,
    presenter: null,
    host_name: null,
    author_display_name: label,
    author_byline: label,
    author_persona: null,
    language: "cs",
  };
}

export function videoAttributionAltText(input: VideoEditorialInput): string {
  return `Video: ${getVideoEditorialLabel(input)}`;
}

/** Strip first-person presenter intros from video scripts for TTS/display. */
export function stripPersonalVideoIntro(script: string): string {
  let s = String(script ?? "").trim();
  if (!s) return s;

  const introPatterns = [
    /^Ahoj!\s*Jsem\s+(?:doktor|doktorka|mudr\.?)\s+\w+[^.!?]*[.!?]\s*/i,
    /^Zdravím\s+vás!\s*Jsem\s+sestra\s+\w+[^.!?]*[.!?]\s*/i,
    /^Dobrý\s+den!\s*Jsem\s+(?:wellness\s+kouč|kouč)\s+\w+[^.!?]*[.!?]\s*/i,
    /^Zdravím!\s*(?:Petra|Klára|Martin)[^.!?]*[.!?]\s*/i,
    /^Ahoj!\s*Doktor\s+Martin\s+zase\s+na\s+scéně\.\s*/i,
    /^Ahoj,\s*tady\s+sestra\s+\w+[^.!?]*[.!?]\s*/i,
    /^Dobrý\s+den!\s*Doktor\s+Martin\s+s\s+dnešním\s+tipem\.\s*/i,
    /^Dobrý\s+den!\s*Jsem\s+wellness\s+kouč\s+\w+[^.!?]*[.!?]\s*/i,
  ];

  for (const re of introPatterns) {
    s = s.replace(re, "");
  }

  return s.trim();
}

export function prepareVideoScriptForSpeech(input: {
  title?: string | null;
  script?: string | null;
  excerpt?: string | null;
}): string {
  const cleaned = stripPersonalVideoIntro(input.script ?? "");
  // Video scripts already carry their own open — skip article broadcast intro.
  return prepareArticleForSpeech(
    {
      title: input.title,
      excerpt: input.excerpt,
      content: cleaned || input.script,
    },
    { withBroadcastIntro: false, withClosing: false }
  );
}

// Re-export for convenience in UI
export { editorialUnitLabel };
