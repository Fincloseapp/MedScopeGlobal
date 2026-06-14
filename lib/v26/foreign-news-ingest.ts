import crypto from "crypto";
import sourcesV26 from "@/lib/v26/config/sources-v26.json";
import { mergeV26Metadata } from "@/lib/v26/editorial-standard";
import { rewriteToV26Standard } from "@/lib/v26/rewrite-engine";
import { fetchRssItems } from "@/lib/ingestion/rss";
import type { ContentAccessLevel } from "@/lib/config/access-levels";
import type { IngestionRubric } from "@/lib/ingestion/sources";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureIngestionAuthor } from "@/lib/setup/ensure-ingestion-author";
import { slugify } from "@/lib/utils";
import { V26_EDITORIAL_VERSION } from "@/lib/v26/version";

export interface V26ForeignSource {
  name: string;
  url: string;
  categorySlug: string;
  rubric: IngestionRubric;
  minAccessLevel: ContentAccessLevel;
  locale?: string;
  section?: string;
  region?: string;
}

export interface V26ForeignIngestResult {
  created: number;
  skipped: number;
  errors: string[];
}

function buildHash(title: string, sourceUrl: string, description: string) {
  return crypto
    .createHash("sha256")
    .update(
      [title.trim().toLowerCase(), sourceUrl.trim().toLowerCase(), description.slice(0, 2000)].join("|")
    )
    .digest("hex");
}

export function getV26ForeignSources(): V26ForeignSource[] {
  return sourcesV26 as V26ForeignSource[];
}

export async function runV26ForeignNewsIngest(options?: {
  maxArticles?: number;
  itemsPerSource?: number;
}): Promise<V26ForeignIngestResult> {
  const admin = createServiceRoleClient();
  const maxArticles = options?.maxArticles ?? Number(process.env.V26_FOREIGN_MAX ?? 12);
  const itemsPerSource = options?.itemsPerSource ?? 3;
  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  const authorId = await ensureIngestionAuthor();
  if (!authorId) {
    return { created: 0, skipped: 0, errors: ["No ingestion author"] };
  }

  const { data: categories } = await admin.from("categories").select("id, slug");
  const categoryMap = new Map((categories ?? []).map((c) => [c.slug, c.id as string]));

  for (const src of getV26ForeignSources()) {
    if (created >= maxArticles) break;
    try {
      const items = await fetchRssItems(src.url, src.name, itemsPerSource);
      for (const item of items) {
        if (created >= maxArticles) break;

        const hash = buildHash(item.title, item.link, item.description);
        const { data: existing } = await admin
          .from("articles")
          .select("id")
          .eq("hash_dedup", hash)
          .maybeSingle();
        if (existing?.id) {
          skipped++;
          continue;
        }

        const categoryId = categoryMap.get(src.categorySlug);
        if (!categoryId) {
          skipped++;
          continue;
        }

        const rewritten = await rewriteToV26Standard({
          title: item.title,
          excerpt: item.description.slice(0, 400),
          content: `<p>${item.description}</p><p><a href="${item.link}">Původní zdroj: ${src.name}</a></p>`,
          audience: src.minAccessLevel === "physician" ? "physician" : "public",
          sourceCitation: { name: src.name, url: item.link, originalTitle: item.title },
          seed: item.link,
        });

        let slug = slugify(`zpravy-${rewritten.title}`).slice(0, 100);
        const { data: slugClash } = await admin.from("articles").select("id").eq("slug", slug).maybeSingle();
        if (slugClash) slug = `${slug}-${crypto.randomBytes(2).toString("hex")}`;

        const metadata = mergeV26Metadata(null, {
          ...rewritten.metadata,
          section: src.section ?? "aktuální-zprávy",
          editorial_version: V26_EDITORIAL_VERSION,
          source_citation: {
            name: src.name,
            url: item.link,
            originalTitle: item.title,
          },
        });

        const payload = {
          title: rewritten.title,
          slug,
          content: rewritten.content,
          excerpt: rewritten.excerpt,
          summary: rewritten.excerpt,
          category_id: categoryId,
          author_id: authorId,
          published: true,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          vip_only: src.minAccessLevel === "physician",
          rubric_slug: src.rubric,
          min_access_level: src.minAccessLevel,
          locale: "cs",
          source_url: item.link,
          source_name: `${src.name} · MedScopeGlobal v26`,
          ingested_at: new Date().toISOString(),
          ai_generated: true,
          is_machine_translated: true,
          content_type: "policy",
          license: "source",
          hash_dedup: hash,
          meta_description: rewritten.excerpt.slice(0, 160),
          metadata,
          updated_at: new Date().toISOString(),
        };

        const { error } = await admin.from("articles").insert(payload);
        if (error) {
          errors.push(`${src.name}: ${error.message}`);
          skipped++;
        } else {
          created++;
        }
      }
    } catch (e) {
      errors.push(`${src.name}: ${(e as Error).message}`);
    }
  }

  return { created, skipped, errors };
}
