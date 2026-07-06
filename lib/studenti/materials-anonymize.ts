/**
 * Anonymize student material metadata for public MedScopeGlobal UI.
 * Internal DB retains source_url / external_url for audit; never expose in public API.
 */

const ACADEMIC_PREFIX =
  /\b(MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.|doc\.|prof\.|Prof\.)\s*/gi;

const PROF_REFERENCE =
  /\b(?:k|podle|u|od|pro|na)\s+(?:prof\.|Prof\.|doc\.|Doc\.)\s*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]*(?:ovi|em|a|e|u)?/gi;

const PREFIXED_NAME =
  /\b(?:MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.|doc\.)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+)?/g;

const HONORIFIC_NAME =
  /\b(?:pana|paní|lorda|lady|sira)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:a|ovi|em|é|u)?/gi;

const LEADING_NAME =
  /^(?:MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+)?\s*[-–—:,]\s*/i;

/** Strip personal / academic author names from material titles. */
export function anonymizeMaterialTitle(title: string): string {
  let t = title.trim();
  if (!t) return title;

  t = t.replace(LEADING_NAME, "");
  t = t.replace(PROF_REFERENCE, (match) => {
    if (/^podle/i.test(match)) return "podle učitele";
    if (/^k\s/i.test(match)) return "k učiteli";
    return "";
  });
  t = t.replace(HONORIFIC_NAME, "vyučujícího");
  t = t.replace(PREFIXED_NAME, "");
  t = t.replace(ACADEMIC_PREFIX, "");

  t = t
    .replace(/\s*[-–—]\s*[-–—]\s*/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-–—:,]\s*/, "")
    .replace(/\s+[-–—:,]\s*$/, "")
    .trim();

  return t.length >= 3 ? t : title;
}

export const PUBLIC_SOURCE_LABEL = "MedScopeGlobal · studijní materiály";

export const PUBLIC_LEGAL_NOTICE =
  "Materiály jsou určeny výhradně pro studijní účely. © MedScopeGlobal.";
