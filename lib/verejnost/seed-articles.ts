import { createHash } from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { PublicTopic } from "@/lib/queries/verejnost";
import { VEREJNOST_FALLBACK_COVER } from "@/lib/verejnost/images";

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  topic: PublicTopic;
  content: string;
  meta_description?: string;
  editors_pick?: boolean;
  fully_open?: boolean;
  read_time_minutes?: number;
  keywords?: string[];
};

const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: "prevence-kardiovaskularnich-onemocneni",
    title: "Prevence kardiovaskulárních onemocnění v každodenním životě",
    excerpt:
      "Jednoduché kroky — pohyb, strava a kontrola rizikových faktorů — snižují riziko infarktu a mrtvice.",
    topic: "prevence",
    content: `<p>Kardiovaskulární onemocnění patří mezi nejčastější příčiny úmrtí. Prevence začíná u každého z nás.</p>
<h2>Co můžete udělat sami</h2>
<ul><li>Pravidelný pohyb alespoň 150 minut týdně</li><li>Omezení soli a trans tuků</li><li>Kontrola krevního tlaku a cholesterolu</li><li>Nekouření a mírná konzumace alkoholu</li></ul>
<p>Při rizikových faktorech nebo nových příznacích vyhledejte praktického lékaře.</p>`,
    meta_description:
      "Prevence infarktu a mrtvice: pohyb, strava, tlak a cholesterol — praktické kroky pro každodenní život.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 5,
    keywords: ["prevence", "srdce", "kardiovaskulární", "infarkt"],
  },
  {
    slug: "spanek-a-regenerace",
    title: "Spánek a regenerace: proč na kvalitě spánku záleží",
    excerpt:
      "Hygiene spánku, délka spánku a vliv stresu na každodenní výkon — praktické rady pro veřejnost.",
    topic: "zivotni-styl",
    content: `<p>Kvalitní spánek podporuje imunitu, psychiku i metabolismus. Dospělí potřebují obvykle 7–9 hodin spánku.</p>
<h2>Tipy pro lepší spánek</h2>
<ul><li>Pravidelný režim vstávání a ulehání</li><li>Tmavá a chladnější ložnice</li><li>Omezení obrazovek před spaním</li><li>Lehká večeře a omezení kofeinu od odpoledne</li></ul>
<p>Přetrvávající nespavost nebo denní únava jsou důvodem konzultace s lékařem.</p>`,
    meta_description:
      "Spánek a regenerace: proč na kvalitě spánku záleží a jak zlepšit hygienu spánku v běžném životě.",
    editors_pick: true,
    fully_open: true,
    read_time_minutes: 4,
    keywords: ["spánek", "regenerace", "hygiena spánku", "únava"],
  },
  {
    slug: "rozhovor-prevence-stresu",
    title: "Rozhovor: Jak zvládat stres v běžném životě",
    excerpt:
      "Psycholog vysvětluje, jak rozpoznat přetížení a kdy vyhledat odbornou pomoc.",
    topic: "rozhovory",
    content: `<p><strong>MedScope:</strong> Co je první signál, že stres přerůstá v problém?</p>
<p><strong>Odborník:</strong> Trvalá únava, podrážděnost, poruchy spánku nebo vyhýbání se běžným aktivitám.</p>
<h2>Kdy vyhledat pomoc</h2>
<p>Pokud obtíže trvají déle než dva týdny a ovlivňují práci či vztahy, obraťte se na praktického lékaře nebo psychologa.</p>`,
    meta_description:
      "Rozhovor s psychologem o zvládání stresu: varovné signály, praktické kroky a kdy vyhledat odbornou pomoc.",
    fully_open: true,
    read_time_minutes: 5,
    keywords: ["stres", "psychika", "rozhovor", "duševní zdraví"],
  },
];

function hashContent(title: string, slug: string) {
  return createHash("sha256").update(`${title}:${slug}`).digest("hex").slice(0, 32);
}

function buildArticleMetadata(article: SeedArticle) {
  return {
    editorial_version: "26",
    section: "verejnost",
    editors_pick: article.editors_pick ?? false,
    fully_open: article.fully_open ?? true,
    read_time_minutes: article.read_time_minutes ?? 5,
    keywords: article.keywords ?? [],
    seed: true,
  };
}

/** Vloží ukázkové veřejné články, pokud je databáze prázdná. */
export async function ensurePublicArticleSeed(): Promise<{ seeded: number; skipped: boolean }> {
  const admin = createServiceRoleClient();

  const { count, error: countError } = await admin
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("audience", "public")
    .eq("published", true);

  if (countError) {
    console.error("ensurePublicArticleSeed count", countError);
    return { seeded: 0, skipped: true };
  }

  if ((count ?? 0) > 0) return { seeded: 0, skipped: true };

  const { data: cat } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!cat?.id) return { seeded: 0, skipped: true };

  let authorId = process.env.INGESTION_AUTHOR_ID ?? null;
  if (!authorId) {
    const { data: userRow } = await admin.from("users").select("id").eq("role", "admin").limit(1).maybeSingle();
    authorId = userRow?.id ?? null;
  }
  if (!authorId) return { seeded: 0, skipped: true };

  const now = new Date().toISOString();
  let seeded = 0;

  for (const article of SEED_ARTICLES) {
    const row = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url: VEREJNOST_FALLBACK_COVER,
      category_id: cat.id,
      author_id: authorId,
      published: true,
      published_at: now,
      vip_only: false,
      rubric_slug: "verejnost",
      min_access_level: "public",
      locale: "cs",
      audience: "public",
      public_topic: article.topic,
      source_name: "MedScopeGlobal · redakce",
      meta_description: article.meta_description ?? article.excerpt.slice(0, 160),
      ai_generated: false,
      hash_dedup: hashContent(article.title, article.slug),
      metadata: buildArticleMetadata(article),
    };

    const { error } = await admin.from("articles").insert(row);
    if (!error) seeded += 1;
    else console.error("ensurePublicArticleSeed insert", article.slug, error);
  }

  return { seeded, skipped: false };
}
