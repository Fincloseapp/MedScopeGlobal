import type { V24ContentDraft } from "@/lib/v24/types";

export function buildIllustrationMeta(draft: V24ContentDraft) {
  const label =
    draft.contentType === "differential-diagnosis"
      ? "Schéma diferenciální diagnostiky"
      : draft.contentType === "treatment-plan"
        ? "Klinické schéma léčby"
        : draft.contentType === "case-study"
          ? "Kazuistika — klinický přehled"
          : "Odborná medicínská ilustrace";

  return {
    alt: `${label}: ${draft.title}`,
    style: "clinical-schematic",
    section: draft.section,
    safeForPublic: true,
  };
}
