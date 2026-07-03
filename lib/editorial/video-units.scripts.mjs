/**
 * MJS mirror of lib/editorial/video-units.ts for Node migration scripts.
 */

import {
  EDITORIAL_UNITS,
  formatEditorialUnitDisplay,
  editorialUnitLabel,
} from "./units.scripts.mjs";

export const OSVETA_AVATAR_TO_UNIT = {
  friendly_doctor: "medscope_cz_odborna",
  nurse: "medscope_cz_info_team",
  wellness_coach: "medscope_cz_klinicky_obsah",
};

export const ACADEMY_AVATAR_TO_UNIT = {
  european_medical_lecturer: "medscope_medical_knowledge_lab",
  friendly_doctor: "medscope_cz_odborna",
  nurse: "medscope_cz_info_team",
  wellness_coach: "medscope_cz_klinicky_obsah",
};

const OSVETA_CATEGORY_TO_UNIT = {
  prevence: "medscope_cz_info_team",
  nemoc: "medscope_cz_klinicka",
  dlouhovekost: "medscope_cz_klinicky_obsah",
  "zivotni-styl": "medscope_cz_klinicky_obsah",
};

export function assignVideoEditorialUnit(input = {}) {
  const meta = input.metadata ?? {};
  if (meta.editorial_unit_primary && EDITORIAL_UNITS[meta.editorial_unit_primary]) {
    return meta.editorial_unit_primary;
  }

  const avatarType = String(input.avatarType ?? "").trim();
  if (input.audience === "academy") {
    return ACADEMY_AVATAR_TO_UNIT[avatarType] ?? "medscope_medical_knowledge_lab";
  }

  if (avatarType && OSVETA_AVATAR_TO_UNIT[avatarType]) {
    return OSVETA_AVATAR_TO_UNIT[avatarType];
  }

  const category = String(input.category ?? "").trim();
  if (category && OSVETA_CATEGORY_TO_UNIT[category]) {
    return OSVETA_CATEGORY_TO_UNIT[category];
  }

  return "medscope_cz_odborna";
}

export function buildVideoEditorialMetadataPatch(input = {}) {
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

export function stripPersonalVideoIntro(script) {
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

export { formatEditorialUnitDisplay, editorialUnitLabel };
