import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import type { V4dLanguage, V4dSpecialty } from "@/lib/v4d/constants";
import type { MedicalAiCategories } from "@/lib/v4d/categorize";

export type ProcessedMedicalText = {
  title: string;
  content_cs: string;
  summary_clinician: string;
  summary_patient: string;
  metadata: Record<string, unknown>;
};

export async function processMedicalTextWithAi(input: {
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  originalLanguage: V4dLanguage;
  specialty: V4dSpecialty;
  categories: MedicalAiCategories;
}): Promise<ProcessedMedicalText> {
  const fallback = buildFallback(input);

  if (!isLlmConfigured()) return fallback;

  const system = `Jsi odborný lékařský editor MedScopeGlobal. Přelož a zpracuj medicínský text do češtiny.
Vědecký styl, citace zdroje, bez vymyšlených dat. JSON only.`;

  const user = `Zdroj: ${input.sourceName}
URL: ${input.sourceUrl}
Jazyk originálu: ${input.originalLanguage}
Obor: ${input.specialty}
Kategorie: ${JSON.stringify(input.categories)}
Titulek: ${input.title}
Surový text: ${input.description.slice(0, 4000)}

Vrať JSON:
{
  "title": "český název",
  "content_cs": "HTML tělo (h2: Klíčová zjištění, Klinický dopad, Doporučení, Zdroj)",
  "summary_clinician": "shrnutí pro lékaře 3-5 vět",
  "summary_patient": "srozumitelné shrnutí pro pacienty 2-4 věty",
  "metadata": { "translated_from": "${input.originalLanguage}", "evidence": "..." }
}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 2500 });
    if (!raw) return fallback;
    const p = JSON.parse(raw) as ProcessedMedicalText;
    return {
      title: p.title?.slice(0, 300) ?? input.title,
      content_cs: p.content_cs ?? fallback.content_cs,
      summary_clinician: p.summary_clinician ?? fallback.summary_clinician,
      summary_patient: p.summary_patient ?? fallback.summary_patient,
      metadata: { ...fallback.metadata, ...(p.metadata ?? {}) },
    };
  } catch {
    return fallback;
  }
}

function buildFallback(input: {
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  originalLanguage: V4dLanguage;
  specialty: V4dSpecialty;
}): ProcessedMedicalText {
  const excerpt = input.description.slice(0, 400);
  return {
    title: input.title,
    content_cs: `<h2>Shrnutí</h2><p>${excerpt}</p><h2>Zdroj</h2><p><a href="${input.sourceUrl}">${input.sourceName}</a></p>`,
    summary_clinician: excerpt || "Odborné shrnutí bude doplněno po AI zpracování.",
    summary_patient:
      "Zjednodušené shrnutí pro pacienty bude doplněno. Konzultujte lékaře.",
    metadata: {
      translated_from: input.originalLanguage,
      specialty: input.specialty,
      ai_fallback: true,
    },
  };
}
