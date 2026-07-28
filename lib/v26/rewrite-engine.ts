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
  polishCzechFields,
  stripRssArtifacts,
  toCzechExcerpt,
  toCzechTitle,
} from "@/lib/v22/translate";

export type { V26RewriteInput, V26RewriteResult, V26ArticleMetadata };

async function ensureCzechFields(input: {
  title: string;
  excerpt: string;
  content: string;
}): Promise<{ title: string; excerpt: string; content: string }> {
  let title = stripRssArtifacts(input.title);
  let excerpt = stripRssArtifacts(input.excerpt);
  let content = input.content.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "");

  const titleBad =
    isEnglishDominant(title) ||
    isEnglishDominantTitle(title) ||
    /Odborný přehled/i.test(title) ||
    /\b(Comment|does risk disappear|stability promotes)\b/i.test(title);

  if (titleBad) {
    const translated = await generateTextFromLlm({
      system:
        "Přelož medicínský titulek zdravotní zprávy do češtiny. Vrať pouze přeložený titulek — srozumitelná čeština, max 110 znaků, bez uvozovek a bez angličtiny. Nikdy neponechávej slova Comment, Editorial ani anglické věty.",
      user: title.replace(/^Odborný přehled[^:]*:\s*/i, "").trim() || title,
      maxTokens: 200,
      temperature: 0.2,
    });
    if (
      translated?.trim() &&
      !isEnglishDominant(translated) &&
      !isEnglishDominantTitle(translated) &&
      !/\b(Comment|does risk disappear)\b/i.test(translated)
    ) {
      title = translated.trim().slice(0, 300);
    } else {
      title = toCzechTitle(title, "zdravotní zpravodajství");
    }
  }

  const excerptBad =
    isEnglishDominant(excerpt) ||
    looksLikeTemplateCzechExcerpt(excerpt) ||
    isEnglishDominantTitle(excerpt) ||
    !excerpt.trim();

  if (excerptBad) {
    const translatedExcerpt = await generateTextFromLlm({
      system:
        "Napiš český perex (2 věty) k zdravotní zprávě. Odborný, konkrétní tón, bez šablonových frází redakce a bez angličtiny. Nezačínej generickým „Shrnutí zahraniční…“.",
      user: `Titulek: ${title}\nPůvodní perex: ${excerpt}\nObsah:\n${stripRssArtifacts(content).slice(0, 900)}`,
      maxTokens: 280,
      temperature: 0.3,
    });
    if (
      translatedExcerpt?.trim() &&
      !isEnglishDominant(translatedExcerpt) &&
      !looksLikeTemplateCzechExcerpt(translatedExcerpt)
    ) {
      excerpt = translatedExcerpt.trim().slice(0, 500);
    } else {
      excerpt = toCzechExcerpt(null, title);
    }
  }

  // Hard Czech-only pass for display-quality fields.
  const polished = polishCzechFields({ title, excerpt, content }, "cs");
  return {
    title: polished.title,
    excerpt: polished.excerpt ?? excerpt,
    content: polished.content ?? content,
  };
}

export async function rewriteToV26Standard(
  input: V26RewriteInput & { seed?: string }
): Promise<V26RewriteResult> {
  const persona = input.persona ?? pickPersonaForArticle(input.seed ?? input.title);
  const audience = input.audience ?? "public";

  const system = buildV26SystemPrompt(audience, persona, input.topic);
  const user = `${buildV26UserPrompt({ ...input, persona })}

DŮLEŽITÉ: Titulek, perex i tělo musí být výhradně v češtině. Neponechávej anglické věty, CDATA/]]> ani hybridní „Odborný přehled: English title“ / „Comment …“.`;

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
      content = ensured.content;

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

  const fallback = buildFallbackRewrite({ ...input, persona });
  const ensuredFallback = await ensureCzechFields({
    title: fallback.title,
    excerpt: fallback.excerpt,
    content: fallback.content,
  });
  return { ...fallback, ...ensuredFallback };
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
