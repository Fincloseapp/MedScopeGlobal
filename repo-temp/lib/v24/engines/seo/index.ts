import type { V24ContentDraft, V24SeoMeta } from "@/lib/v24/types";
import { generateMeta } from "@/lib/v24/engines/seo/meta-generator";
import { extractKeywords } from "@/lib/v24/engines/seo/keywords";
import { optimizeSemantics } from "@/lib/v24/engines/seo/semantic-optimizer";
import { buildMedicalSchema } from "@/lib/v24/engines/seo/schema-generator";

export function runV24SeoPipeline(draft: V24ContentDraft): V24SeoMeta {
  const keywords = extractKeywords(draft);
  const meta = generateMeta(draft, keywords);
  const optimized = optimizeSemantics(draft, meta);
  const schema = buildMedicalSchema(draft, optimized);

  return {
    title: optimized.title,
    description: optimized.description,
    keywords,
    schema,
    internalLinks: optimized.internalLinks,
    externalLinks: optimized.externalLinks,
  };
}
