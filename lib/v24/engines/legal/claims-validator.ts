import type { V24ContentDraft } from "@/lib/v24/types";

const BANNED_CLAIMS = [
  /schváleno\s+MZČR\s+pro\s+léčbu/i,
  /oficiální\s+doporučení\s+pro\s+všechny/i,
  /bez\s+vedlejších\s+účinků/i,
  /100%\s+bezpečné/i,
];

export function validateClaims(draft: V24ContentDraft) {
  const text = `${draft.title} ${draft.summary} ${draft.bodyHtml}`;
  const issues = BANNED_CLAIMS.filter((re) => re.test(text)).map(
    (re) => `zakázané zdravotní tvrzení: ${re.source}`
  );
  if (!draft.sourceName && draft.contentType === "article") {
    issues.push("chybí uvedení zdroje");
  }
  return { passed: issues.length === 0, issues };
}
