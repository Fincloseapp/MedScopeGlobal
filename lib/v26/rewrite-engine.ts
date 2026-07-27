import { generateJsonFromLlm, generateTextFromLlm } from "@/lib/ai/chat-json";
import {
  buildFallbackRewrite,
  buildV26SystemPrompt,
  buildV26UserPrompt,
  mergeV26Metadata,
  validateV26Structure,
  wrapContentInV26Structure,
  type V26ArticleMetadata,
  type V26RewriteInput,
  type V26RewriteResult,
} from "@/lib/v26/editorial-standard";
import { pickPersonaForArticle, type AuthorPersona } from "@/lib/v26/personas";
import {
  assignEditorialUnits,
  buildEditorialMetadataPatch,
  formatEditorialUnitDisplay,
} from "@/lib/editorial/units";
import { V26_EDITORIAL_VERSION } from "@/lib/v26/version";
import { isEnglishDominantTitle } from "@/lib/v26/editorial-prompts.mjs";
import {
  isEnglishDominant,
  looksLikeTemplateCzechExcerpt,
  toCzechExcerpt,
  toCzechTitle,
} from "@/lib/v22/translate";

export type { V26RewriteInput, V26RewriteResult, V26ArticleMetadata };

async function ensureCzechFields(input: {
  title: string;
  excerpt: string;
  content: string;
}): Promise<{ title: string; excerpt: string }> {
  let title = input.title;
  let excerpt = input.excerpt;

  const titleBad =
    isEnglishDominant(title) ||
    isEnglishDominantTitle(title) ||
    /Odborný přehled/i.test(title);

  if (titleBad) {
    const translated = await generateTextFromLlm({
      system:
        "Přelož medicínský titulek zdravotní zprávy do češtiny. Vrať pouze přeložený titulek — srozumitelná čeština, max 110 znaků, bez uvozovek a bez angličtiny.",
      user: title.replace(/^Odborný přehled[^:]*:\s*/i, "").trim() || title,
      maxTokens: 200,
      temperature: 0.2,
    });
    if (
      translated?.trim() &&
      !isEnglishDominant(translated) &&
      !isEnglishDominantTitle(translated)
    ) {
      title = translated.trim().slice(0, 300);
    } else {
      title = toCzechTitle(title, "zdravotní zpravodajství");
    }
  }

  const excerptBad =
    isEnglishDominant(excerpt) ||
    looksLikeTemplateCzechExcerpt(excerpt) ||
    isEnglishDominantTitle(excerpt);

  if (excerptBad) {
    const translatedExcerpt = await generateTextFromLlm({
      system:
        "Napiš český perex (2 věty) k zdravotní zprávě. Odborný, konkrétní tón, bez šablonových frází redakce a bez angličtiny.",
      user: `Titulek: ${title}\nPůvodní perex: ${excerpt}\nObsah:\n${input.content.slice(0, 900)}`,
      maxTokens: 280,
      temperature: 0.3,
    });
    if (translatedExcerpt?.trim() && !isEnglishDominant(translatedExcerpt)) {
      excerpt = translatedExcerpt.trim().slice(0, 500);
    } else {
      excerpt = toCzechExcerpt(null, title);
    }
  }

  return { title, excerpt };
}

export async function rewriteToV26Standard(
  input: V26RewriteInput & { seed?: string }
): Promise<V26RewriteResult> {
  const persona = input.persona ?? pickPersonaForArticle(input.seed ?? input.title);
  const audience = input.audience ?? "public";

  const system = buildV26SystemPrompt(audience, persona, input.topic);
  const user = `${buildV26UserPrompt({ ...input, persona })}

DŮLEŽITÉ: Titulek i perex musí být výhradně v češtině. Neponechávej anglické věty ani hybridní „Odborný přehled: English title“.`;

  try {
    const raw = await generateJsonFromLlm({ system, user, maxTokens: 5000, temperature: 0.35 });
    if (raw) {
      const parsed = JSON.parse(raw) as {
        title?: string;
        excerpt?: string;
        bodyHtml?: string;
      };
      let content = parsed.bodyHtml ?? "";
      let validation = validateV26Structure(content);
      const assignment = assignEditorialUnits({
        audience,
        public_topic: input.topic ?? null,
        ai_generated: true,
        metadata: { author_persona: persona.id },
      });
      const unitLabel = formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted);

      const ensured = await ensureCzechFields({
        title: (parsed.title ?? input.title).slice(0, 300),
        excerpt: (parsed.excerpt ?? input.excerpt ?? input.title).slice(0, 500),
        content: content || input.content,
      });

      if (!validation.ok) {
        content = wrapContentInV26Structure({
          title: ensured.title,
          excerpt: ensured.excerpt,
          bodyHtml: content || input.content.slice(0, 3000),
          personaName: unitLabel,
          persona,
          topic: input.topic ?? "zivotni-styl",
        });
        validation = validateV26Structure(content);
      }
      return {
        title: ensured.title,
        excerpt: ensured.excerpt,
        content,
        metadata: {
          editorial_version: V26_EDITORIAL_VERSION,
          writing_style: persona.id,
          ...buildEditorialMetadataPatch(assignment),
          source_citation: input.sourceCitation,
          rewritten_at: new Date().toISOString(),
        },
        validation,
      };
    }
  } catch (e) {
    console.warn("v26 rewrite LLM failed", e);
  }

  return buildFallbackRewrite({ ...input, persona });
}

export function applyPersonaToWriterName(persona: AuthorPersona, topic?: string | null): string {
  const assignment = assignEditorialUnits({
    audience: "public",
    public_topic: topic ?? null,
    ai_generated: true,
    metadata: { author_persona: persona.id },
  });
  return formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted);
}

export { pickPersonaForArticle, mergeV26Metadata, validateV26Structure };
