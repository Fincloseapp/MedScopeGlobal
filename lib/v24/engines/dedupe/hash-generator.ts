import crypto from "node:crypto";
import type { V24ContentDraft } from "@/lib/v24/types";

export function buildTopicHash(draft: Pick<V24ContentDraft, "section" | "title" | "contentType" | "specialty">) {
  const raw = [draft.section, draft.contentType, draft.specialty ?? "", draft.title]
    .join("|")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}
