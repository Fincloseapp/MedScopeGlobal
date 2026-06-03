import { CATEGORY_SLUGS_FOR_AI } from "@/lib/ingestion/sources";
import type { ContentAccessLevel } from "@/lib/config/access-levels";
import type { IngestionRubric } from "@/lib/ingestion/sources";

export interface ProcessedArticle {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  rubricSlug: IngestionRubric;
  minAccessLevel: ContentAccessLevel;
  locale: string;
}

export function resolveOpenAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || process.env.OPEN_API_KEY?.trim();
}

export function isAiConfigured(): boolean {
  return Boolean(resolveOpenAiKey());
}

function ingestionTargetLocale(): string {
  return (process.env.INGESTION_LOCALE ?? process.env.DEFAULT_SITE_LOCALE ?? "cs")
    .trim()
    .toLowerCase();
}

export async function processWithAi(input: {
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  defaultCategorySlug: string;
  defaultRubric: IngestionRubric;
  defaultAccessLevel: ContentAccessLevel;
}): Promise<ProcessedArticle> {
  const key = resolveOpenAiKey();
  if (!key) {
    return fallbackProcess(input);
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const categories = CATEGORY_SLUGS_FOR_AI.join(", ");

  const system = `You are the MedScopeGlobal medical editorial AI. Produce evidence-based, accurate summaries for clinicians and students. Never invent study data. If the source is insufficient, state limitations clearly. Output valid JSON only.`;

  const user = `Source: ${input.sourceName}
URL: ${input.sourceUrl}
Title: ${input.title}
Summary/raw: ${input.description.slice(0, 3000)}

Assign the best category slug from: ${categories}
Default category: ${input.defaultCategorySlug}
Default rubric: ${input.defaultRubric}
Default access level: ${input.defaultAccessLevel}

Return JSON:
{
  "title": "clear headline",
  "excerpt": "2-3 sentences",
  "content": "HTML article body with h2 sections: Key findings, Clinical relevance, Limitations, Source. Use <p><ul><li>. Include attribution link.",
  "categorySlug": "slug",
  "rubricSlug": "${input.defaultRubric}",
  "minAccessLevel": "public|student|physician",
  "locale": "${ingestionTargetLocale()}"
}

Write the entire article (title, excerpt, content) in the language matching locale: ${ingestionTargetLocale()} (cs = Czech, en = English, de = German, etc.).`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      console.error("OpenAI error", await res.text());
      return fallbackProcess(input);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return fallbackProcess(input);

    const parsed = JSON.parse(raw) as ProcessedArticle;
    return {
      title: parsed.title?.slice(0, 300) ?? input.title,
      excerpt: parsed.excerpt?.slice(0, 500) ?? input.description.slice(0, 280),
      content: parsed.content ?? fallbackProcess(input).content,
      categorySlug: CATEGORY_SLUGS_FOR_AI.includes(
        parsed.categorySlug as (typeof CATEGORY_SLUGS_FOR_AI)[number]
      )
        ? parsed.categorySlug
        : input.defaultCategorySlug,
      rubricSlug: parsed.rubricSlug ?? input.defaultRubric,
      minAccessLevel: ["public", "student", "physician"].includes(
        parsed.minAccessLevel
      )
        ? parsed.minAccessLevel
        : input.defaultAccessLevel,
      locale: parsed.locale ?? ingestionTargetLocale(),
    };
  } catch (e) {
    console.error("AI process failed", e);
    return fallbackProcess(input);
  }
}

function fallbackProcess(input: {
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  defaultCategorySlug: string;
  defaultRubric: IngestionRubric;
  defaultAccessLevel: ContentAccessLevel;
}): ProcessedArticle {
  const loc = ingestionTargetLocale();
  const isCs = loc === "cs" || loc.startsWith("cs");

  const excerpt =
    input.description.slice(0, 320) ||
    (isCs
      ? "Automatické shrnutí z mezinárodního lékařského zdroje."
      : "Automated briefing from an international medical source.");

  const content = isCs
    ? `
<h2>Shrnutí</h2>
<p>${escapeHtml(excerpt)}</p>
<h2>Klinický význam</h2>
<p>Tento článek byl automaticky zpracován ze zdroje <strong>${escapeHtml(input.sourceName)}</strong>. Pro plné redakční zpracování nastavte <code>OPENAI_API_KEY</code>.</p>
<h2>Zdroj</h2>
<p><a href="${escapeAttr(input.sourceUrl)}" rel="noopener noreferrer" target="_blank">Původní publikace</a></p>
<p><em>MedScopeGlobal — ověřte vůči primární literatuře před klinickým použitím.</em></p>
`.trim()
    : `
<h2>Summary</h2>
<p>${escapeHtml(excerpt)}</p>
<h2>Clinical relevance</h2>
<p>This dispatch was ingested automatically from <strong>${escapeHtml(input.sourceName)}</strong>. Enable <code>OPENAI_API_KEY</code> or <code>OPEN_API_KEY</code> for full editorial synthesis.</p>
<h2>Source</h2>
<p><a href="${escapeAttr(input.sourceUrl)}" rel="noopener noreferrer" target="_blank">Read original publication</a></p>
<p><em>MedScopeGlobal — verify against primary literature before clinical application.</em></p>
`.trim();

  return {
    title: input.title,
    excerpt,
    content,
    categorySlug: input.defaultCategorySlug,
    rubricSlug: input.defaultRubric,
    minAccessLevel: input.defaultAccessLevel,
    locale: loc === "cs" ? "cs" : loc.startsWith("en") ? "en" : loc,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
