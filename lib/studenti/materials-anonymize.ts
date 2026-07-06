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
  /\b(?:pana|paní|lorda|lady|sira)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]*(?:a|ovi|em|é|u)?/gi;

/** Czech professor nickname derivatives (e.g. Lordoviny). */
const LORD_NICKNAME = /\b[Ll]ordovin[\wáčďéěíňóřšťúůýž]*/gi;

/** Trailing English author attribution lists. */
const MADE_BY_AUTHORS = /\s*\bmade\s+by\b[\s\S]*$/gi;

/** Trailing "by Handle" attribution (e.g. by Langenbeck). */
const BY_AUTHOR = /\s+\bby\b\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!?\s*$/i;

/** Trailing comma author credit (e.g. ", Matěj Rúra"). */
const TRAILING_COMMA_AUTHOR =
  /,\s+(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+\s+)?[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!?\s*$/g;

/** Trailing informal single-word handles (e.g. "- Spongebob"). */
const TRAILING_INFORMAL_HANDLE = /\s[-–—]\s+(?:Spongebob)\s*$/gi;

/** Trailing dash author credit, optional year suffix (e.g. "- Jirka Beneš", "- Lubomír Tekeli r. 2016"). */
const TRAILING_DASH_AUTHOR =
  /\s[-–—]\s+(?:(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!?(?:\s+r\.\s*\d{4})?)|(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!))(?:\s+r\.\s*\d{4})?\s*$/g;

/** Parenthetical author credit (full name or surname, min 3 chars). */
const PAREN_AUTHOR =
  /\s*\((?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+\s+)?[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]{2,}\)\s*/g;

/** Embedded trailing nickname + surname without separator (e.g. "... r.2018 Jirka Beneš!"). */
const EMBEDDED_TRAILING_AUTHOR =
  /\s+(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+\s+)?[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!\s*$/g;

/** "dle Jirky Beneše" style attribution. */
const DLE_AUTHOR =
  /\s*,?\s*\bdle\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]*(?:y|ě|a|u|í|é|ovi|em)?\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]*/g;

/** "Fůze Beneše a Mikšíka" style merged credits. */
const FUZE_AUTHORS =
  /\s*[-–—:,]?\s*[Ff]ůze\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+\s+a\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+!?\s*$/g;

const LEADING_NAME =
  /^(?:MUDr\.|Mgr\.|Bc\.|PhDr\.|RNDr\.|Ing\.|Dr\.|Doc\.)\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][\wáčďéěíňóřšťúůýž]+)?\s*[-–—:,]\s*/i;

/** Strip personal / academic author names from material titles. */
export function anonymizeMaterialTitle(title: string): string {
  let t = title.trim();
  if (!t) return title;

  t = t.replace(LEADING_NAME, "");
  t = t.replace(MADE_BY_AUTHORS, "");
  t = t.replace(BY_AUTHOR, "");
  t = t.replace(DLE_AUTHOR, "");
  t = t.replace(FUZE_AUTHORS, "");
  t = t.replace(TRAILING_INFORMAL_HANDLE, "");
  t = t.replace(PAREN_AUTHOR, " ");
  t = t.replace(TRAILING_DASH_AUTHOR, "");
  t = t.replace(TRAILING_COMMA_AUTHOR, "");
  t = t.replace(EMBEDDED_TRAILING_AUTHOR, "");
  t = t.replace(PROF_REFERENCE, (match) => {
    if (/^podle/i.test(match)) return "podle učitele";
    if (/^k\s/i.test(match)) return "k učiteli";
    return "";
  });
  t = t.replace(HONORIFIC_NAME, "vyučujícího");
  t = t.replace(LORD_NICKNAME, "materiály");
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
