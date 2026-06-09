import { createServiceRoleClient } from "@/lib/supabase/service";
import { getV20LatestStudies } from "@/lib/v20/studies/query";
import { getV22DigitalHealthList } from "@/lib/v22/digital-health/query";
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

export async function gatherNewsletterSources(): Promise<V23NewsletterSources> {
  const admin = createServiceRoleClient();

  const [studies, dhList, articlesRes, legRes, drugRes, uniRes, topicsRes] = await Promise.all([
    getV20LatestStudies(4),
    getV22DigitalHealthList(3),
    admin
      .from("articles")
      .select("title, slug, excerpt")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(4),
    admin
      .from("legislation_items")
      .select("title, slug, summary")
      .eq("published", true)
      .order("published_date", { ascending: false })
      .limit(3),
    admin
      .from("drug_news")
      .select("title, slug, summary")
      .eq("published", true)
      .order("published_date", { ascending: false })
      .limit(3),
    admin
      .from("university_news")
      .select("title, slug, summary")
      .eq("published", true)
      .order("published_date", { ascending: false })
      .limit(3),
    admin
      .from("newsletter_topics")
      .select("topic_text")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  const pendingTopics =
    topicsRes.error || !topicsRes.data ? [] : topicsRes.data.map((t) => t.topic_text);

  return {
    studies: studies.map((s) => ({
      title: s.titleCs,
      summary: s.summaryCs.slice(0, 200),
      href: `/studie/${s.slug}`,
    })),
    articles: (articlesRes.data ?? []).map((a) => ({
      title: a.title,
      summary: (a.excerpt ?? "").slice(0, 200),
      href: `/article/${a.slug}`,
    })),
    legislation: (legRes.data ?? []).map((l) => ({
      title: l.title,
      summary: (l.summary ?? "").slice(0, 200),
      href: `/legislativa/${l.slug}`,
    })),
    digitalHealth: dhList.map((d) => ({
      title: d.title,
      summary: d.summaryCs.slice(0, 200),
      href: `/digital-health/${d.slug}`,
    })),
    drugs: (drugRes.data ?? []).map((d) => ({
      title: d.title,
      summary: (d.summary ?? "").slice(0, 200),
      href: `/leky/novinky/${d.slug}`,
    })),
    universities: (uniRes.data ?? []).map((u) => ({
      title: u.title,
      summary: (u.summary ?? "").slice(0, 200),
      href: `/novinky/univerzity/${u.slug}`,
    })),
    pendingTopics,
  };
}
