import { generateJsonFromLlm } from "@/lib/ai/chat-json";
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
import { V26_EDITORIAL_VERSION } from "@/lib/v26/version";

export type { V26RewriteInput, V26RewriteResult, V26ArticleMetadata };

export async function rewriteToV26Standard(
  input: V26RewriteInput & { seed?: string }
): Promise<V26RewriteResult> {
  const persona = input.persona ?? pickPersonaForArticle(input.seed ?? input.title);
  const audience = input.audience ?? "public";

  const system = buildV26SystemPrompt(audience, persona, input.topic);
  const user = buildV26UserPrompt({ ...input, persona });

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
      if (!validation.ok) {
        content = wrapContentInV26Structure({
          title: parsed.title ?? input.title,
          excerpt: parsed.excerpt ?? input.excerpt ?? input.title,
          bodyHtml: content || input.content.slice(0, 3000),
          personaName: persona.displayName,
          persona,
          topic: input.topic ?? "zivotni-styl",
        });
        validation = validateV26Structure(content);
      }
      return {
        title: (parsed.title ?? input.title).slice(0, 300),
        excerpt: (parsed.excerpt ?? input.excerpt ?? input.title).slice(0, 500),
        content,
        metadata: {
          editorial_version: V26_EDITORIAL_VERSION,
          author_persona: persona.id,
          author_display_name: persona.displayName,
          author_byline: persona.byline ?? persona.displayName,
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

export function applyPersonaToWriterName(persona: AuthorPersona): string {
  return `${persona.displayName} · MedScopeGlobal`;
}

export { pickPersonaForArticle, mergeV26Metadata, validateV26Structure };
