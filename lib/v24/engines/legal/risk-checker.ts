import type { V24ContentDraft } from "@/lib/v24/types";

const HIGH_RISK = [
  /vyléčí\s+vás/i,
  /zaručen/i,
  /bez\s+lékaře/i,
  /okamžitě\s+přestaňte/i,
  /alternativa\s+k\s+chemoterapii/i,
  /tajný\s+recept/i,
];

export function checkLegalRisk(draft: V24ContentDraft) {
  const text = `${draft.title} ${draft.summary} ${draft.bodyHtml}`;
  const issues = HIGH_RISK.filter((re) => re.test(text)).map((re) => `rizikové tvrzení: ${re.source}`);
  return { passed: issues.length === 0, issues };
}
