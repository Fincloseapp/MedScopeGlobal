import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { VerejnostArticleExpandable } from "@/components/verejnost/verejnost-article-expandable";
import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";
import {
  BACKEND_PUBLIC_TOPICS,
  resolveBackendTopic,
  topicLabelForSlug,
} from "@/lib/config/verejnost-topics";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { isListableNewsArticle, isLongevityArticle } from "@/lib/v271/news-desks";

export const revalidate = 120;

const TOPIC_CHIPS = [
  ...BACKEND_PUBLIC_TOPICS,
  {
    slug: "dlouhovekost",
    label: "Dlouhověkost",
    description: "Healthspan, prevence stárnutí, spánek, pohyb a biomarkery.",
  },
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}): Promise<Metadata> {
  const { topic } = await searchParams;
  const title = topic ? `${topicLabelForSlug(topic)} — Veřejné zdraví` : "Články — Veřejné zdraví";
  return await buildLocalizedV20PageMetadata({
    title: `${title} | MedScopeGlobal`,
    description:
      "Aktuální články o prevenci, výživě, spánku, dlouhověkosti a zdravém životním stylu. Srozumitelná čeština, redakční kontrola.",
    path: topic ? `/verejnost/clanky?topic=${topic}` : "/verejnost/clanky",
  });
}

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function VerejnostClankyPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  const longevity = topic === "dlouhovekost";
  const backendTopic = longevity ? null : resolveBackendTopic(topic);
  const fetched = await listPublicArticles({
    limit: 48,
    topic: backendTopic,
    ensureContent: true,
    mode: "full",
  });

  const articles = fetched.filter((article) => {
    if (!isListableNewsArticle(article)) return false;
    if (longevity) return isLongevityArticle(article);
    if (topic === "zivotni-styl") return !isLongevityArticle(article);
    return true;
  });

  const title = topic ? topicLabelForSlug(topic) : "Všechny články";
  const description = longevity
    ? "Healthspan česky: spánek, pohyb, výživa a biomarkery. Oddělujeme důkaz od hype, bez diagnostiky přes obrazovku."
    : backendTopic
      ? BACKEND_PUBLIC_TOPICS.find((item) => item.slug === backendTopic)?.description
      : "Srozumitelné články o zdraví, prevenci a každodenních rozhodnutích pro veřejnost.";

  return (
    <ModulePageShell
      eyebrow="Veřejné zdraví"
      title={title}
      description={description ?? "Články pro širokou veřejnost."}
      ctaHref="/verejnost"
      ctaLabel="Hub veřejné zdraví"
    >
      <Link href="/verejnost" className="mb-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na přehled
      </Link>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/verejnost/clanky"
          className={`rounded-full px-3 py-1 text-sm ${
            !topic ? "bg-[#005B96] text-white" : "border border-[#005B96]/30 text-[#005B96]"
          }`}
        >
          Vše
        </Link>
        {TOPIC_CHIPS.map((item) => (
          <Link
            key={item.slug}
            href={`/verejnost/clanky?topic=${item.slug}`}
            prefetch
            className={`rounded-full px-3 py-1 text-sm ${
              topic === item.slug
                ? "bg-[#005B96] text-white"
                : "border border-[#005B96]/30 text-[#005B96]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {articles.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((item) => (
            <VerejnostArticleExpandable
              key={item.id}
              article={item}
              coverUrl={resolveVerejnostCoverUrl(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {topic ? (
            <p>V tématu „{title}“ zatím nejsou publikované články, které by splnily redakční pravidla.</p>
          ) : (
            <p>Články pro veřejnost se brzy objeví — sledujte medscopeglobal.com.</p>
          )}
        </div>
      )}

      <p className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950">
        Informace slouží k obecnému vzdělávání a nenahrazují konzultaci s lékařem. Dlouhověkost
        popisujeme jako více zdravých let (healthspan), nikoli jako zaručené prodloužení života.
      </p>
    </ModulePageShell>
  );
}
