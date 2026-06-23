import type { V24ContentDraft } from "@/lib/v24/types";

export function generateMeta(draft: V24ContentDraft, keywords: string[]) {
  const title = `${draft.title.slice(0, 55)} | MedScopeGlobal`;
  const description = draft.summary.slice(0, 155).trim();
  return { title, description, keywords };
}
