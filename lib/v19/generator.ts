import { groqChatCompletion } from "@/lib/ai/groq";
import { pickTopic, type V19SourceTopic } from "@/lib/v19/sources";
import { specialtyLabel } from "@/lib/v19/specialties";
import { languageNameForPrompt } from "@/lib/v19/localize";
import { applyV19Safety, validateV19Article } from "@/lib/v19/safety";
import { withV19GroqSlot } from "@/lib/v19/concurrency";
import type { V19ArticlePayload, V19GeneratedArticle, V19Specialty } from "@/lib/v19/types";
import { buildV19DedupHash } from "@/lib/v19/dedup";
import { formatV19ContentHtml } from "@/lib/v19/format-content";

type RawLlmArticle = {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  clinicalImpact?: string;
  angle?: string;
};

export async function generateV19Article(params: {
  specialty: V19Specialty;
  locale: string;
  topic: V19SourceTopic;
  existingTitles: string[];
  angleHint?: string;
}): Promise<{ article: V19GeneratedArticle | null; model?: string; skipped?: boolean }> {
  const { specialty, locale, topic, existingTitles, angleHint } = params;
  const lang = languageNameForPrompt(locale);
  const date = new Date().toISOString();
  const specLabel = specialtyLabel(specialty, locale);

  const system = `Jsi odborný medicínský editor MedScope v19.
Piš v jazyce: ${lang}.
Vytvoř VLASTNÍ shrnutí — nikdy nekopíruj texty ze zdrojů.
Bez dávkování léků, bez konkrétních léčebných postupů, bez klinických instrukcí.
Vrať pouze validní JSON objekt.`;

  const user = `Obor: ${specLabel}
Zdroj (pouze kontext): ${topic.sourceName} — ${topic.sourceUrl}
Téma: ${topic.topic}
Kontext: ${topic.briefingHint}
${angleHint ? `Nový úhel: ${angleHint}` : ""}
${existingTitles.length ? `Vyhni se podobnosti těmto titulům: ${existingTitles.slice(0, 8).join(" | ")}` : ""}

Vrať JSON:
{
  "title": "max 60 znaků",
  "summary": "2-3 věty",
  "keyPoints": ["3-6 bodů"],
  "clinicalImpact": "1-2 věty dopadu na praxi",
  "angle": "stručný popis úhlu"
}`;

  const result = await withV19GroqSlot(() =>
    groqChatCompletion({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.35,
      maxTokens: 1200,
      jsonMode: true,
    })
  );

  if (!result?.content) return { article: null };

  let raw: RawLlmArticle;
  try {
    raw = JSON.parse(result.content) as RawLlmArticle;
  } catch {
    return { article: null, model: result.model };
  }

  const payload: V19ArticlePayload = applyV19Safety({
    title: (raw.title ?? topic.topic).slice(0, 60),
    date,
    specialty,
    specialtyLabel: specLabel,
    summary: raw.summary ?? "",
    keyPoints: (raw.keyPoints ?? []).slice(0, 6),
    clinicalImpact: raw.clinicalImpact ?? "",
    sourceUrl: topic.sourceUrl,
    sourceName: topic.sourceName,
    sourceTier: topic.tier,
    topic: topic.topic,
    locale,
    angle: raw.angle ?? angleHint,
  });

  const validation = validateV19Article(payload);
  if (!validation.safe || payload.keyPoints.length < 3) {
    return { article: null, model: result.model };
  }

  const hashDedup = buildV19DedupHash(
    payload.title,
    payload.topic,
    payload.sourceUrl,
    payload.date
  );

  const article: V19GeneratedArticle = {
    ...payload,
    hashDedup,
    contentHtml: formatV19ContentHtml(payload, locale),
    model: result.model,
  };

  return { article, model: result.model };
}

export function pickTopicForSpecialty(
  specialty: V19Specialty,
  used: Set<string>
): V19SourceTopic | null {
  return pickTopic(specialty, used);
}
