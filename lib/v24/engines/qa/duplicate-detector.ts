import type { V24ContentDraft } from "@/lib/v24/types";

function normalizeKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

export function detectDuplicateInDraft(draft: V24ContentDraft, existingTitles: string[]) {
  const key = normalizeKey(draft.title);
  const hit = existingTitles.find((t) => normalizeKey(t) === key);
  if (hit) return { isDuplicate: true, reason: `shodný nadpis: ${hit}` };

  const topicHit = existingTitles.find(
    (t) => normalizeKey(t).includes(key.slice(0, 20)) || key.includes(normalizeKey(t).slice(0, 20))
  );
  if (topicHit && key.length > 15) {
    return { isDuplicate: true, reason: `podobné téma: ${topicHit}` };
  }

  return { isDuplicate: false, reason: "" };
}
