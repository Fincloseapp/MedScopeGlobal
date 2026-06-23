import crypto from "crypto";
import { GLOBAL_RSS_SOURCES, PUBMED_BY_CATEGORY } from "@/lib/ingestion/sources";
import { fetchRssItems } from "@/lib/ingestion/rss";
import { fetchPubMedItems } from "@/lib/ingestion/pubmed";
import { processWithAi } from "@/lib/ingestion/ai";
import { ensureIngestionAuthor } from "@/lib/setup/ensure-ingestion-author";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { slugify } from "@/lib/utils";
import type { RawFeedItem } from "@/lib/ingestion/rss";

export interface IngestionResult {
  runId: string;
  created: number;
  skipped: number;
  errors: string[];
}

interface QueueItem extends RawFeedItem {
  categorySlug: string;
  rubricSlug: string;
  minAccessLevel: string;
}

const INTERNAL_EDITORIAL_TEMPLATES = [
  {
    title: "Rychlá syndromová diagnostika v ambulanci",
    excerpt:
      "Praktický přehled, jak strukturovat první kontakt v ambulanci a rychle odlišit benigní od urgentních stavů.",
    body: "<h2>Proč to má smysl</h2><p>Rychlá klinická triáž v ambulanci pomáhá zkrátit čas do správné léčby a snižuje riziko zmeškané diagnostiky.</p><h2>Praktické kroky</h2><ul><li>Shromáždění symptomů ve stylu časové osy.</li><li>Prioritizace život ohrožujících značek.</li><li>Rozlišení urgentního a rutinního postupu.</li></ul>",
    categorySlug: "general-practice",
    contentType: "clinical",
    medTrack: null,
    studyYear: null,
    premium: false,
  },
  {
    title: "Studijní checklist pro přípravu na lékařskou fakultu",
    excerpt:
      "Krátký denní plán pro obnovu, opakování a zlepšení výkonu v přípravném období před přijímačkami.",
    body: "<h2>Příprava na LF</h2><p>Strukturovaný studijní plán zvyšuje efektivitu opakování a pomáhá udržet motivaci.</p><h2>Rady do týdne</h2><ul><li>Každý den 30 min opakování základů.</li><li>Skupinové řešení otázek s kontrolou chyb.</li><li>Minimálně jeden simulovaný test.</li></ul>",
    categorySlug: "medical-education",
    contentType: "med_prep",
    medTrack: "priprava",
    studyYear: null,
    premium: false,
  },
  {
    title: "1. ročník medicíny: jak číst klinickou studii",
    excerpt:
      "Krátký návod, jak rozdělit článek na otázku, metodiku, výsledky a klinický význam.",
    body: "<h2>Klinická studie bez paniky</h2><p>Studenti medicíny se nejlépe orientují, když si článek rozdělí na otázku, design, výsledky a klinický dopad.</p><h2>Praktický postup</h2><ul><li>Rozpoznat primární endpoint.</li><li>Zjistit, zda jsou výsledky statisticky i klinicky významné.</li><li>Odpovědět na otázku: Co to znamená pro pacienta?</li></ul>",
    categorySlug: "medical-education",
    contentType: "med_study",
    medTrack: "studium",
    studyYear: 1,
    premium: false,
  },
  {
    title: "Farmakologická bezpečnost v každodenní praxi",
    excerpt:
      "Přehled klíčových zásad, jak minimálně riziko nežádoucích efektů při léčbě v běžné ambulanci.",
    body: "<h2>Bezpečná preskripce</h2><p>Bezpečnost léčby stojí na detailním záznamu indikace, dávkování a interakcí.</p><h2>Rychlé body</h2><ul><li>Kontrola interakcí.</li><li>Vědomá komunikace s pacientem.</li><li>Včasná revize při změně stavu.</li></ul>",
    categorySlug: "medical-education",
    contentType: "pharma",
    medTrack: null,
    studyYear: null,
    premium: false,
  },
  {
    title: "Diagnostika a screening u nejčastějších symptomů",
    excerpt:
      "Přehled nejběžnějších diagnostických kroků u symptomů, které se opakovaně objevují v ambulanci.",
    body: "<h2>Diagnostická logika</h2><p>Správně zvolená diagnostická cesta zvyšuje kvalitu péče i efektivitu pracoviště.</p><h2>Praktické doporučení</h2><ul><li>Začít s anamnézou a fyzikálním nálezem.</li><li>Validovat nejefektivnější testy.</li><li>Udržet návaznost péče.</li></ul>",
    categorySlug: "general-practice",
    contentType: "clinical",
    medTrack: null,
    studyYear: null,
    premium: false,
  },
];

export async function runIngestionPipeline(options: {
  triggeredBy: string;
  maxArticles?: number;
}): Promise<IngestionResult> {
  const admin = createServiceRoleClient();
  const maxArticles = Number(
    process.env.INGEST_MAX_ARTICLES ?? options.maxArticles ?? 80
  );
  const errors: string[] = [];

  let runId = `local-${Date.now()}`;
  const { data: run, error: runErr } = await admin
    .from("ingestion_runs")
    .insert({ status: "running", triggered_by: options.triggeredBy })
    .select("id")
    .single();

  if (!runErr && run?.id) {
    runId = run.id as string;
  } else if (runErr && !runErr.message.includes("ingestion_runs")) {
    console.warn("ingestion_runs unavailable:", runErr.message);
  }

  const { data: categories } = await admin.from("categories").select("id, slug");
  const categoryMap = new Map(
    (categories ?? []).map((c) => [c.slug, c.id as string])
  );

  const authorId = await ensureIngestionAuthor();

  if (!authorId) {
    errors.push(
      "No author for ingestion — register once at /register or set INGESTION_AUTHOR_ID."
    );
    await finishRun(admin, runId, 0, 0, errors);
    return { runId, created: 0, skipped: 0, errors };
  }

  const queue: QueueItem[] = [];

  for (const src of GLOBAL_RSS_SOURCES) {
    try {
      const items = await fetchRssItems(src.url, src.name, 6);
      for (const item of items) {
        queue.push({
          ...item,
          categorySlug: src.categorySlug,
          rubricSlug: src.rubric,
          minAccessLevel: src.minAccessLevel,
        });
      }
    } catch (e) {
      errors.push(`RSS ${src.name}: ${(e as Error).message}`);
    }
  }

  for (const pm of PUBMED_BY_CATEGORY) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const items = await fetchPubMedItems(pm.query, pm.categorySlug, 4);
      for (const item of items) {
        queue.push({
          ...item,
          categorySlug: pm.categorySlug,
          rubricSlug: pm.rubric,
          minAccessLevel: pm.minAccessLevel,
        });
      }
    } catch (e) {
      errors.push(`PubMed ${pm.categorySlug}: ${(e as Error).message}`);
    }
  }

  let created = 0;
  let skipped = 0;

  for (const item of queue) {
    if (created >= maxArticles) break;
    const inserted = await upsertIngestedArticle({
      admin,
      authorId,
      item,
      categoryMap,
      isGenerated: false,
    });
    if (inserted === "created") created++;
    else if (inserted === "skipped") skipped++;
  }

  const remaining = Math.max(maxArticles - created, 0);
  if (remaining > 0) {
    for (let index = 0; index < remaining; index++) {
      const template = INTERNAL_EDITORIAL_TEMPLATES[index % INTERNAL_EDITORIAL_TEMPLATES.length];
      if (created >= maxArticles) break;
      const inserted = await upsertGeneratedArticle({
        admin,
        authorId,
        categoryMap,
        template,
      });
      if (inserted === "created") created++;
      else if (inserted === "skipped") skipped++;
    }
  }

  await finishRun(admin, runId, created, skipped, errors);

  await admin
    .from("ingestion_schedule")
    .update({ last_run_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", 1)
    .then(() => {});

  await admin.from("logs").insert({
    event: "INGESTION_RUN",
    data: { run_id: runId, created, skipped, errors: errors.length },
  });

  return { runId, created, skipped, errors };
}

async function upsertIngestedArticle({
  admin,
  authorId,
  item,
  categoryMap,
  isGenerated,
}: {
  admin: ReturnType<typeof createServiceRoleClient>;
  authorId: string;
  item: QueueItem;
  categoryMap: Map<string, string>;
  isGenerated: boolean;
}): Promise<"created" | "skipped"> {
  const hash = buildHash(item.title, item.link, item.description);

  const { data: existingByHash } = await admin
    .from("articles")
    .select("id")
    .eq("hash_dedup", hash)
    .maybeSingle();

  if (existingByHash?.id) {
    return "skipped";
  }

  const { data: existingBySource } = await admin
    .from("articles")
    .select("id")
    .eq("source_url", item.link)
    .maybeSingle();

  if (existingBySource?.id) {
    return "skipped";
  }

  const categoryId = categoryMap.get(item.categorySlug);
  if (!categoryId) {
    return "skipped";
  }

  try {
    const processed = await processWithAi({
      title: item.title,
      description: item.description,
      sourceUrl: item.link,
      sourceName: item.sourceName,
      defaultCategorySlug: item.categorySlug,
      defaultRubric: item.rubricSlug as "ai-study-summary",
      defaultAccessLevel: item.minAccessLevel as "public",
    });

    const resolvedCategoryId =
      categoryMap.get(processed.categorySlug) ?? categoryId;
    let slug = slugify(processed.title);
    const { data: slugClash } = await admin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (slugClash) {
      slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
    }

    const vipOnly =
      processed.minAccessLevel === "physician" &&
      processed.rubricSlug !== "ai-patient-education";

    const publishedAt = item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString();

    const payload = {
      title: processed.title,
      slug,
      content: processed.content,
      excerpt: processed.excerpt,
      summary: processed.excerpt,
      cover_image_url: null,
      category_id: resolvedCategoryId,
      author_id: authorId,
      published: true,
      published_at: publishedAt,
      vip_only: vipOnly,
      rubric_slug: processed.rubricSlug,
      min_access_level: processed.minAccessLevel,
      locale: processed.locale,
      source_url: item.link,
      source_name: item.sourceName,
      ingested_at: new Date().toISOString(),
      ai_generated: true,
      is_machine_translated: true,
      content_type: inferContentType(processed.minAccessLevel, processed.rubricSlug),
      license: "source",
      hash_dedup: hash,
      meta_description: processed.excerpt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin.from("articles").insert(payload);
    if (error) {
      return "skipped";
    }
    return "created";
  } catch (e) {
    return "skipped";
  }
}

async function upsertGeneratedArticle({
  admin,
  authorId,
  categoryMap,
  template,
}: {
  admin: ReturnType<typeof createServiceRoleClient>;
  authorId: string;
  categoryMap: Map<string, string>;
  template: (typeof INTERNAL_EDITORIAL_TEMPLATES)[number];
}): Promise<"created" | "skipped"> {
  const sourceUrl = `medscopeglobal://internal/${slugify(template.title)}-${Date.now().toString(36)}`;
  const hash = buildHash(template.title, sourceUrl, template.body);

  const { data: existing } = await admin
    .from("articles")
    .select("id")
    .eq("hash_dedup", hash)
    .maybeSingle();

  if (existing?.id) {
    return "skipped";
  }

  const categoryId = categoryMap.get(template.categorySlug);
  if (!categoryId) {
    return "skipped";
  }

  const slug = `${slugify(template.title)}-${Date.now().toString(36)}`;
  const payload = {
    title: template.title,
    slug,
    content: template.body,
    excerpt: template.excerpt,
    summary: template.excerpt,
    cover_image_url: null,
    category_id: categoryId,
    author_id: authorId,
    published: true,
    published_at: new Date().toISOString(),
    vip_only: template.premium,
    rubric_slug: template.contentType === "clinical" ? "ai-case-study" : "ai-textbook-summary",
    min_access_level: template.premium ? "physician" : "public",
    locale: "cs",
    source_url: sourceUrl,
    source_name: "MedScopeGlobal redakce",
    ingested_at: new Date().toISOString(),
    ai_generated: true,
    is_machine_translated: false,
    content_type: template.contentType,
    license: "editorial",
    hash_dedup: hash,
    med_track: template.medTrack,
    study_year: template.studyYear,
    is_premium: template.premium,
    reading_time_minutes: 6,
    learning_objectives: ["Klinický přehled", "Studijní opakování"],
    quiz_json: { type: "multiple-choice", items: 3 },
    meta_description: template.excerpt,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("articles").insert(payload);
  if (error) {
    return "skipped";
  }
  return "created";
}

function inferContentType(minAccessLevel: string, rubricSlug: string): string {
  if (rubricSlug.includes("patient")) return "clinical";
  if (rubricSlug.includes("study")) return "research";
  if (minAccessLevel === "physician") return "research";
  if (minAccessLevel === "student") return "med_study";
  return "clinical";
}

function buildHash(title: string, sourceUrl: string, description: string) {
  return crypto
    .createHash("sha256")
    .update(
      [
        title.trim().toLowerCase(),
        sourceUrl.trim().toLowerCase(),
        description.trim().toLowerCase().slice(0, 2000),
      ].join("|")
    )
    .digest("hex");
}

async function finishRun(
  admin: ReturnType<typeof createServiceRoleClient>,
  runId: string,
  created: number,
  skipped: number,
  errors: string[]
) {
  if (runId.startsWith("local-")) return;
  await admin
    .from("ingestion_runs")
    .update({
      status: errors.length > 0 && created === 0 ? "failed" : "completed",
      articles_created: created,
      articles_skipped: skipped,
      errors,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
}
