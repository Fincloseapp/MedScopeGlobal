import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { buildNewsletterLayout, type LayoutPolish } from "@/lib/v23/newsletter/build-layout";
import type { V23NewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { isJsonLikeText, sanitizeNewsletterText } from "@/lib/v23/newsletter/sanitize";

type AiPolishResponse = {
  headline?: string;
  intro?: string;
  sectionIntros?: Record<string, string>;
  topicSummaries?: Record<string, string>;
};

function cleanPolish(raw: AiPolishResponse): LayoutPolish {
  const polish: LayoutPolish = {};
  if (raw.headline && !isJsonLikeText(raw.headline)) {
    polish.headline = sanitizeNewsletterText(raw.headline);
  }
  if (raw.intro && !isJsonLikeText(raw.intro)) {
    polish.intro = sanitizeNewsletterText(raw.intro);
  }
  if (raw.sectionIntros && typeof raw.sectionIntros === "object") {
    polish.sectionIntros = {};
    for (const [k, v] of Object.entries(raw.sectionIntros)) {
      if (typeof v === "string" && !isJsonLikeText(v)) {
        polish.sectionIntros[k] = sanitizeNewsletterText(v);
      }
    }
  }
  if (raw.topicSummaries && typeof raw.topicSummaries === "object") {
    polish.topicSummaries = {};
    for (const [k, v] of Object.entries(raw.topicSummaries)) {
      if (typeof v === "string" && !isJsonLikeText(v)) {
        polish.topicSummaries[k] = sanitizeNewsletterText(v);
      }
    }
  }
  return polish;
}

export async function generateNewsletterLayoutWithAi(
  sources: V23NewsletterSources,
  issueDate: string
): Promise<V23NewsletterLayout> {
  const base = buildNewsletterLayout(sources, issueDate);

  if (!isLlmConfigured()) return base;

  const titlesPreview = {
    studies: sources.studies.map((s) => s.title),
    articles: sources.articles.map((a) => a.title),
    manualTopics: sources.pendingTopics,
  };

  const system = `Jsi editor českého odborného medicínského newsletteru MedScopeGlobal.
Vrať POUZE JSON objekt s klíči: headline (string), intro (string, 2-3 věty), sectionIntros (objekt id→text), topicSummaries (objekt téma→krátké shrnutí).
NEVRACEJ seznam článků, studií ani položek — pouze texty úvodů.
Čeština, profesionální medicínský styl, bez anglicismů a bez JSON v hodnotách.
Povolená id sekcí v sectionIntros: studie, clanky, legislativa, digital-health, leky, univerzity, doporucujeme.`;

  const user = `Datum vydání: ${issueDate}\nTémata k zapracování: ${sources.pendingTopics.join("; ") || "žádná"}\nNáhled titulků: ${JSON.stringify(titlesPreview)}`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 900 });
    if (!raw || isJsonLikeText(raw)) return base;
    const parsed = JSON.parse(raw) as AiPolishResponse;
    const polish = cleanPolish(parsed);
    return buildNewsletterLayout(sources, issueDate, polish);
  } catch {
    return base;
  }
}
