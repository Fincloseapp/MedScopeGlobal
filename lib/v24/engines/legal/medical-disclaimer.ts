import type { V24ContentDraft } from "@/lib/v24/types";

export function buildMedicalDisclaimer(draft: V24ContentDraft) {
  return [
    "Tento obsah slouží výhradně k odbornému vzdělávání a informování.",
    "Nenahrazuje individuální lékařskou péči ani klinické rozhodování.",
    "MedScopeGlobal neposkytuje konkrétní dávkování ani individuální léčebná doporučení.",
    draft.locale === "cs"
      ? "V souladu s českou legislativou a GDPR — žádné osobní údaje pacientů."
      : "Compliant with EU health information guidelines — no personal patient data.",
  ].join(" ");
}
