import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type V4cModule =
  | "studie"
  | "leky"
  | "legislativa"
  | "digital-health"
  | "novinky"
  | "newsletter";

const SYSTEM: Record<V4cModule, string> = {
  studie:
    "Extrahuj revmatologické studie. Vrať JSON v češtině: titleCs, subtitle, summary, methodology, results, conclusion, clinicalImpact, keyPoints[], studyType (rct|meta-analysis|cohort|pilot|review), specialty, region, image_description, metadata.",
  leky: "Extrahuj novinku o léku. Vrať JSON: title, summary, drug_name, status (new|approved|pipeline), agency, image_description.",
  legislativa: "Shrň legislativní položku. Vrať JSON: title, summary, category, source, image_description.",
  "digital-health":
    "Vytvoř odborný článek o digitálním zdravotnictví v češtině. Vrať JSON: title, summary, topic, whatIsCs, trendsCs, risksCs, legislationCs, clinicalImpactCs, examplesCs, keyPointsCs[], image_description, sources[{name,url,tier}]. Použij zdroje MZČR, eZdraví, SÚKL, WHO, EMA, NIH. Profesionální styl magazínu.",
  novinky: "Shrň univerzitní/výzkumnou novinku. Vrať JSON: title, summary, university, tag, image_description.",
  newsletter: "Vytvoř newsletter sekce. Vrať JSON: title, sections[], pdf_text_outline, layout_notes.",
};

export async function extractWithAi(
  module: V4cModule,
  input: { title: string; raw: string; sourceUrl?: string; sourceName?: string }
): Promise<Record<string, unknown>> {
  const fallback = {
    title: input.title,
    summary: input.raw.slice(0, 500) || "Shrnutí bude doplněno po review.",
    image_description: "Abstract medical editorial illustration, blue tones",
    metadata: { sourceUrl: input.sourceUrl, sourceName: input.sourceName },
  };

  if (!isLlmConfigured()) return fallback;

  try {
    const content = await generateJsonFromLlm({
      system: SYSTEM[module],
      user: `${input.sourceName ?? ""}\n${input.sourceUrl ?? ""}\n${input.title}\n${input.raw.slice(0, 4000)}`,
      maxTokens: 900,
    });
    if (!content) return fallback;
    return { ...fallback, ...JSON.parse(content) };
  } catch {
    return fallback;
  }
}

export function placeholderImageUrl(seed: string): string {
  const q = encodeURIComponent(seed.slice(0, 40));
  return `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&sig=${q.length}`;
}

export function slugifyV4c(title: string): string {
  return `${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .concat(`-${Date.now().toString(36)}`);
}
