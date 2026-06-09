import { prepareArticlesForDisplay } from "@/lib/articles/prepare-for-display";
import { mapArticleList } from "@/lib/db/map-article";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { filterActiveArticles, filterCzechContent } from "@/lib/v20/content-rules";
import { getV20LatestStudies } from "@/lib/v20/studies/query";
import { getV22DigitalHealthList } from "@/lib/v22/digital-health/query";
import {
  V23_FALLBACK_ARTICLES,
  V23_FALLBACK_DRUGS,
  V23_FALLBACK_LEGISLATION,
  V23_FALLBACK_UNIVERSITIES,
  V23_NEWSLETTER_FALLBACKS,
} from "@/lib/v23/newsletter/fallbacks";
import { sanitizeNewsletterText } from "@/lib/v23/newsletter/sanitize";
import type { V23NewsletterItem } from "@/lib/v23/newsletter/types";

export type V23NewsletterSources = {
  studies: V23NewsletterItem[];
  articles: V23NewsletterItem[];
  legislation: V23NewsletterItem[];
  digitalHealth: V23NewsletterItem[];
  drugs: V23NewsletterItem[];
  universities: V23NewsletterItem[];
  pendingTopics: string[];
};

const articleSelect = `*, categories ( id, name, slug )`;

function toItem(title: string, summary: string, href: string, imageUrl?: string | null): V23NewsletterItem {
  return {
    title: sanitizeNewsletterText(title),
    summary: sanitizeNewsletterText(summary, V23_NEWSLETTER_FALLBACKS.articleSummary),
    href,
    imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined,
  };
}

async function loadArticlesForNewsletter(limit = 4): Promise<V23NewsletterItem[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("articles")
    .select(articleSelect)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(32);

  if (error || !data?.length) return V23_FALLBACK_ARTICLES;

  const mapped = mapArticleList(data as Record<string, unknown>[]);
  const active = filterCzechContent(filterActiveArticles(mapped), "cs");
  const publicOnly = active.filter((a) => !a.vip_only);
  const prepared = await prepareArticlesForDisplay(publicOnly, "cs", {
    mode: "card",
    maxTranslate: limit + 4,
  });

  const items = prepared.slice(0, limit).map((a) =>
    toItem(
      a.title,
      a.excerpt ?? a.content?.replace(/<[^>]+>/g, " ").slice(0, 220) ?? "",
      `/article/${a.slug}`
    )
  );

  return items.length ? items : V23_FALLBACK_ARTICLES;
}

async function loadLegislation(limit = 3): Promise<V23NewsletterItem[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("legislation_items")
    .select("title, slug, summary, body, image_url")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data?.length) return V23_FALLBACK_LEGISLATION;

  const items = data.map((l) =>
    toItem(
      l.title,
      l.summary ?? l.body?.replace(/<[^>]+>/g, " ").slice(0, 220) ?? "",
      `/legislativa/${l.slug}`,
      l.image_url
    )
  );
  return items.length ? items : V23_FALLBACK_LEGISLATION;
}

async function loadDrugNews(limit = 3): Promise<V23NewsletterItem[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("drug_news")
    .select("title, slug, summary, body, image_url")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data?.length) return V23_FALLBACK_DRUGS;

  const items = data.map((d) =>
    toItem(
      d.title,
      d.summary ?? d.body?.replace(/<[^>]+>/g, " ").slice(0, 220) ?? "",
      `/leky/novinky/${d.slug}`,
      d.image_url
    )
  );
  return items.length ? items : V23_FALLBACK_DRUGS;
}

async function loadUniversityNews(limit = 3): Promise<V23NewsletterItem[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("university_news")
    .select("title, slug, summary, body, image_url")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data?.length) return V23_FALLBACK_UNIVERSITIES;

  const items = data.map((u) =>
    toItem(
      u.title,
      u.summary ?? u.body?.replace(/<[^>]+>/g, " ").slice(0, 220) ?? "",
      `/novinky/univerzity/${u.slug}`,
      u.image_url
    )
  );
  return items.length ? items : V23_FALLBACK_UNIVERSITIES;
}

async function loadPendingTopics(): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("newsletter_topics")
    .select("topic_text")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error || !data?.length) return [];
  return data.map((t) => sanitizeNewsletterText(t.topic_text)).filter(Boolean);
}

export async function gatherNewsletterSources(): Promise<V23NewsletterSources> {
  const [studiesRaw, dhList, articles, legislation, drugs, universities, pendingTopics] = await Promise.all([
    getV20LatestStudies(4),
    getV22DigitalHealthList(4),
    loadArticlesForNewsletter(4),
    loadLegislation(3),
    loadDrugNews(3),
    loadUniversityNews(3),
    loadPendingTopics(),
  ]);

  const studies = studiesRaw.map((s) =>
    toItem(s.titleCs, s.summaryCs, `/studie/${s.slug}`)
  );

  const digitalHealth = dhList.map((d) =>
    toItem(d.title, d.summaryCs, `/digital-health/${d.slug}`)
  );

  return {
    studies: studies.length ? studies : [],
    articles,
    legislation,
    digitalHealth: digitalHealth.length ? digitalHealth : [],
    drugs,
    universities,
    pendingTopics,
  };
}
