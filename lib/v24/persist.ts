import type { V24ContentDraft, V24ImageArtifact, V24LegalReport, V24QaReport, V24SeoMeta } from "@/lib/v24/types";
import { artifactPath, writeV24Json } from "@/lib/v24/data-store";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureIngestionAuthor } from "@/lib/setup/ensure-ingestion-author";
import { V24_ENGINE_VERSION } from "@/lib/v24/version";

let categoryCache: string | null = null;

async function resolveCategoryId() {
  if (categoryCache) return categoryCache;
  const admin = createServiceRoleClient();
  const { data } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!data?.id) throw new Error("No category for v24 publish");
  categoryCache = data.id as string;
  return categoryCache;
}

export function persistV24Artifact(
  draft: V24ContentDraft,
  meta: {
    qa: V24QaReport;
    seo: V24SeoMeta;
    legal: V24LegalReport;
    image: V24ImageArtifact;
  }
) {
  const rel = artifactPath(draft.section, draft.topicHash);
  writeV24Json(rel, {
    version: V24_ENGINE_VERSION,
    draft,
    meta,
    savedAt: new Date().toISOString(),
  });
  return rel;
}

export async function publishV24ToWeb(draft: V24ContentDraft, seo: V24SeoMeta) {
  const admin = createServiceRoleClient();
  const authorId = await ensureIngestionAuthor();
  const categoryId = await resolveCategoryId();
  const slug = `v24-${draft.section}-${draft.topicHash}`;

  const { data: existing } = await admin.from("articles").select("id").eq("slug", slug).maybeSingle();

  const row = {
    title: draft.title,
    slug,
    excerpt: draft.summary,
    summary: draft.summary,
    content: draft.bodyHtml,
    category_id: categoryId,
    author_id: authorId,
    published: true,
    published_at: new Date().toISOString(),
    vip_only: false,
    rubric_slug: "v24-ultra",
    min_access_level: "public" as const,
    locale: draft.locale,
    source_url: draft.sourceUrl ?? null,
    source_name: draft.sourceName ?? "MedScopeGlobal v24",
    quiz_json: {
      v24: true,
      engineVersion: V24_ENGINE_VERSION,
      section: draft.section,
      seo,
      keywords: seo.keywords,
    },
  };

  if (existing?.id) {
    await admin.from("articles").update(row).eq("id", existing.id);
    return existing.id as string;
  }

  const { data, error } = await admin.from("articles").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return data?.id as string;
}
