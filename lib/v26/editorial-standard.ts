import {
  buildBlocklistPrompt,
  buildPersonaStylePrompt,
  buildV26StructurePrompt,
  validateV26Structure,
  V26_SECTIONS,
  wrapContentInV26Structure,
} from "./editorial-prompts.mjs";
import {
  assignEditorialUnits,
  buildEditorialMetadataPatch,
  formatEditorialUnitDisplay,
} from "@/lib/editorial/units";
import type { AuthorPersona } from "./personas";

export { V26_SECTIONS, validateV26Structure, wrapContentInV26Structure };

export interface V26ArticleMetadata {
  editorial_version?: string;
  /** @deprecated use editorial_unit_primary */
  author_persona?: string | null;
  author_display_name?: string;
  author_byline?: string;
  editorial_unit_primary?: string;
  editorial_unit_reviewer?: string | null;
  ai_assisted?: boolean;
  writing_style?: string | null;
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
  const personaPrompt = persona
    ? buildPersonaStylePrompt(persona, topic as Parameters<typeof buildPersonaStylePrompt>[1])
    : "";
  return `${buildV26StructurePrompt(audience, topic ?? null)}
${personaPrompt}
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
  const assignment = assignEditorialUnits({
    audience: input.audience ?? "public",
    public_topic: input.topic ?? null,
    ai_generated: true,
    metadata: { author_persona: input.persona?.id ?? null },
  });
  const unitLabel = formatEditorialUnitDisplay(assignment.primary, "cs", assignment.aiAssisted);
  const content = wrapContentInV26Structure({
    title: input.title,
    excerpt: input.excerpt ?? input.title,
    bodyHtml: input.content.slice(0, 4000),
    personaName: unitLabel,
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
      writing_style: input.persona?.id ?? null,
      ...buildEditorialMetadataPatch(assignment),
      source_citation: input.sourceCitation,
      rewritten_at: new Date().toISOString(),
    },
    validation,
  };
}

// Re-export for TS consumers that import editorial-standard
export { buildV26StructurePrompt, buildBlocklistPrompt };
