import {
  buildBlocklistPrompt,
  buildPersonaStylePrompt,
  buildV26StructurePrompt,
  validateV26Structure,
  V26_SECTIONS,
  wrapContentInV26Structure,
} from "./editorial-prompts.mjs";
import type { AuthorPersona } from "./personas";

export { V26_SECTIONS, validateV26Structure, wrapContentInV26Structure };

export interface V26ArticleMetadata {
  editorial_version?: string;
  author_persona?: string;
  author_display_name?: string;
  author_byline?: string;
  source_citation?: {
    name: string;
    url: string;
    originalTitle?: string;
  };
  section?: string;
  rewritten_at?: string;
}

export interface V26RewriteInput {
  title: string;
  excerpt?: string | null;
  content: string;
  audience?: "public" | "student" | "physician";
  persona?: AuthorPersona;
  topic?: string;
  sourceCitation?: V26ArticleMetadata["source_citation"];
}

export interface V26RewriteResult {
  title: string;
  excerpt: string;
  content: string;
  metadata: V26ArticleMetadata;
  validation: ReturnType<typeof validateV26Structure>;
}

export function buildV26SystemPrompt(audience = "public", persona?: AuthorPersona, topic?: string | null): string {
  return `${buildV26StructurePrompt(audience, topic ?? null)}
${persona ? buildPersonaStylePrompt(persona) : ""}
${buildBlocklistPrompt()}
Vrať JSON: { "title": string, "excerpt": string (2–3 věty), "bodyHtml": string (HTML s <p>, <h2>, <ul>) }`;
}

export function buildV26UserPrompt(input: V26RewriteInput): string {
  const cite = input.sourceCitation
    ? `\nZdroj k citaci: ${input.sourceCitation.name} — ${input.sourceCitation.url}`
    : "";
  return `Přepiš článek do redakčního standardu v26 (sekce A–D):
Titulek: ${input.title}
Perex: ${input.excerpt ?? ""}
Obsah:
${input.content.slice(0, 12000)}${cite}
Zachovej medicínskou přesnost. Délka 700–1200 slov.`;
}

export function mergeV26Metadata(
  existing: Record<string, unknown> | null | undefined,
  patch: V26ArticleMetadata
): Record<string, unknown> {
  return { ...(existing ?? {}), ...patch };
}

export function buildFallbackRewrite(input: V26RewriteInput): V26RewriteResult {
  const personaName = input.persona?.displayName ?? "Redakce MedScopeGlobal";
  const content = wrapContentInV26Structure({
    title: input.title,
    excerpt: input.excerpt ?? input.title,
    bodyHtml: input.content.slice(0, 4000),
    personaName,
    persona: input.persona,
    topic: input.topic ?? "zivotni-styl",
  });
  const validation = validateV26Structure(content);
  return {
    title: input.title,
    excerpt: (input.excerpt ?? input.title).slice(0, 320),
    content,
    metadata: {
      editorial_version: "26.2.1",
      author_persona: input.persona?.id,
      author_display_name: personaName,
      author_byline: input.persona?.byline ?? personaName,
      source_citation: input.sourceCitation,
      rewritten_at: new Date().toISOString(),
    },
    validation,
  };
}

// Re-export for TS consumers that import editorial-standard
export { buildV26StructurePrompt, buildBlocklistPrompt };
