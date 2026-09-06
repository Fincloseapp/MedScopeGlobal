import crypto from "crypto";
import sourcesV26 from "@/lib/v26/config/sources-v26.json";
import { mergeV26Metadata } from "@/lib/v26/editorial-standard";
import { rewriteToV26Standard } from "@/lib/v26/rewrite-engine";
import { isEnglishDominantTitle } from "@/lib/v26/editorial-prompts.mjs";
import {
  isEnglishDominant,
  polishCzechFields,
  stripRssArtifacts,
  toCzechExcerpt,
  toCzechTitle,
} from "@/lib/v22/translate";
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
  contentPillar?: string;
}

const LONGEVITY_SOURCE_RE = /aging|ageing|longevity|healthspan|geriatr|nia\.nih|nataging/i;
const LONGEVITY_ITEM_RE =
  /aging|ageing|longevity|healthspan|alzheimer|frailty|geriatr|senescence|long.?lived/i;

export function isLongevityForeignSource(src: V26ForeignSource): boolean {
  return src.contentPillar === "dlouhovekost" || LONGEVITY_SOURCE_RE.test(`${src.name} ${src.url}`);
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

function itemLooksLongevity(title: string, summary?: string | null, link?: string | null): boolean {
  return LONGEVITY_ITEM_RE.test(`${title} ${summary ?? ""} ${link ?? ""}`);
}

export function getV26ForeignSources(): V26ForeignSource[] {
  return sourcesV26 as V26ForeignSource[];
}

/** Longevity RSS first so Aktuality stays current on aging / healthspan. */
export function rankV26ForeignSources(
  sources: V26ForeignSource[],
  preferLongevity = true
): V26ForeignSource[] {
  if (!preferLongevity) return sources;
  return [...sources].sort(
    (a, b) => Number(isLongevityForeignSource(b)) - Number(isLongevityForeignSource(a))
  );
}

export async function runV26ForeignNewsIngest(options?: {
  maxArticles?: number;
  itemsPerSource?: number;
  preferLongevity?: boolean;
  journalistId?: string;
  editorId?: string;
}): Promise<V26ForeignIngestResult> {
  const admin = createServiceRoleClient();
  const maxArticles = options?.maxArticles ?? Number(process.env.V26_FOREIGN_MAX ?? 12);
  const itemsPerSource = options?.itemsPerSource ?? 3;
  const preferLongevity = options?.preferLongevity ?? true;
  const journalistId = options?.journalistId;
  const editorId = options?.editorId;
  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  const authorId = await ensureIngestionAuthor();
  if (!authorId) {
    return { created: 0, skipped: 0, errors: ["No ingestion author"] };
  }

  const { data: categories } = await admin.from("categories").select("id, slug");
  const categoryMap = new Map((categories ?? []).map((c) => [c.slug, c.id as string]));

  for (const src of rankV26ForeignSources(getV26ForeignSources(), preferLongevity)) {
    if (created >= maxArticles) break;
    try {
      const fetched = await fetchRssItems(src.url, src.name, itemsPerSource);
      const items = preferLongevity
        ? [...fetched].sort(
            (a, b) =>
              Number(itemLooksLongevity(b.title, b.description, b.link)) -
              Number(itemLooksLongevity(a.title, a.description, a.link))
          )
        : fetched;
      for (const item of items) {
        if (created >= maxArticles) break;

        const cleanDescription = stripRssArtifacts(item.description);
        const hash = buildHash(item.title, item.link, cleanDescription);
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

        const longevity =
          isLongevityForeignSource(src) ||
          itemLooksLongevity(item.title, cleanDescription, item.link);

        const rewritten = await rewriteToV26Standard({
          title: item.title,
          excerpt: cleanDescription.slice(0, 400),
          content: `<p>${cleanDescription}</p><p>Původní zdroj: ${src.name}</p>`,
          audience: src.minAccessLevel === "physician" ? "physician" : "public",
          sourceCitation: { name: src.name, url: item.link, originalTitle: item.title },
          seed: item.link,
          topic: longevity ? "dlouhovekost" : src.section ?? "aktuální-zprávy",
        });

        // Hard guard: never persist English/hybrid titles into Czech news section.
        let title = rewritten.title;
        let excerpt = rewritten.excerpt;
        let content = rewritten.content;
        if (
          isEnglishDominantTitle(title) ||
          isEnglishDominant(title) ||
          /Odborný přehled/i.test(title) ||
          /\b(Comment|does risk disappear)\b/i.test(title)
        ) {
          title = toCzechTitle(title, "zdravotní zpravodajství");
        }
        if (
          isEnglishDominant(excerpt) ||
          /profesionální shrnutí|evidence-based přístup|Shrnutí zahraniční zdravotnické zprávy pro českou praxi/i.test(
            excerpt
          )
        ) {
          excerpt = toCzechExcerpt(cleanDescription, title);
        }

        const polished = polishCzechFields({ title, excerpt, content }, "cs");
        title = polished.title;
        excerpt = polished.excerpt ?? excerpt;
        content = polished.content ?? content;

        const { isProfessionalAktualityTitle } = await import("@/lib/v271/news-desks");
        if (!isProfessionalAktualityTitle(title) && isProfessionalAktualityTitle(item.title)) {
          title = item.title.trim();
        }
        if (!isProfessionalAktualityTitle(title)) {
          skipped++;
          continue;
        }

        let slug = slugify(`zpravy-${title}`).slice(0, 100);
        const { data: slugClash } = await admin.from("articles").select("id").eq("slug", slug).maybeSingle();
        if (slugClash) slug = `${slug}-${crypto.randomBytes(2).toString("hex")}`;

        const metadata = {
          ...mergeV26Metadata(null, {
            ...rewritten.metadata,
            section: src.section ?? "aktuální-zprávy",
            editorial_version: V26_EDITORIAL_VERSION,
            source_citation: {
              name: src.name,
              url: item.link,
              originalTitle: item.title,
            },
            czech_only: true,
          }),
          editorial_review: "ai_editor",
          journalist_id: journalistId ?? null,
          editor_id: editorId ?? null,
          ...(longevity
            ? {
                content_pillar: src.contentPillar ?? "dlouhovekost",
                public_topic: "dlouhovekost",
                editorial_desk: "longevity",
              }
            : {}),
        };

        const payload = {
          title,
          slug,
          content,
          excerpt,
          summary: excerpt,
          category_id: categoryId,
          author_id: authorId,
          published: true,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          vip_only: src.minAccessLevel === "physician",
          rubric_slug: src.rubric,
          min_access_level: src.minAccessLevel,
          locale: "cs",
          public_topic: longevity ? "dlouhovekost" : null,
          source_url: item.link,
          source_name: `${src.name} · MedScopeGlobal v26`,
          ingested_at: new Date().toISOString(),
          ai_generated: true,
          is_machine_translated: true,
          content_type: "policy",
          license: "source",
          hash_dedup: hash,
          meta_description: excerpt.slice(0, 160),
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
