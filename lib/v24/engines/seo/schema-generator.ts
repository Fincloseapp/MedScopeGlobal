import type { V24ContentDraft } from "@/lib/v24/types";

export function buildMedicalSchema(
  draft: V24ContentDraft,
  meta: { title: string; description: string; keywords: string[] }
) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: meta.title,
    description: meta.description,
    inLanguage: draft.locale === "cs" ? "cs-CZ" : "en",
    about: {
      "@type": "MedicalCondition",
      name: draft.title,
    },
    keywords: meta.keywords.join(", "),
    publisher: {
      "@type": "Organization",
      name: "MedScopeGlobal",
      url: "https://medscopeglobal.com",
    },
  };
}
