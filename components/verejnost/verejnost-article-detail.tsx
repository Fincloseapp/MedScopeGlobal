import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink } from "lucide-react";
import { PublicAdBlocks } from "@/components/verejnost/public-ad-block";
import { EditorialAttribution } from "@/components/article/editorial-attribution";
import { EditorialFooter } from "@/components/article/editorial-footer";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import { articleTopicLabel, verejnostDateLabel } from "@/lib/verejnost/helpers";
import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";

export function VerejnostArticleDetail({
  article,
  bannerAds,
  inlineAds,
  sidebarAds,
}: {
  article: DisplayArticle;
  bannerAds: PublicAdCampaign[];
  inlineAds: PublicAdCampaign[];
  sidebarAds: PublicAdCampaign[];
}) {
  const dateLabel = verejnostDateLabel(article);
  const topicLabel = articleTopicLabel(article);
  const isInterview = article.public_topic === "rozhovory";
  const coverUrl = resolveVerejnostCoverUrl(article);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link href="/verejnost/clanky" className="text-sm font-medium text-[#005B96] hover:underline">
          ← Veřejné zdraví — články
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_280px]">
          <article>
            <header>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                medscopeglobal.com · {topicLabel}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
                {article.title}
              </h1>
              {isInterview ? (
                <p className="mt-2 text-sm font-medium text-slate-600">Rozhovor s odborníkem</p>
              ) : null}
              {dateLabel ? (
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={article.published_at ?? article.created_at}>{dateLabel}</time>
                </p>
              ) : null}
              <div className="mt-3 text-sm">
                <EditorialAttribution article={article} locale="cs" />
              </div>
            </header>

            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={coverUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>

            <PublicAdBlocks campaigns={bannerAds} variant="banner" />

            {article.excerpt ? (
              <p className="mt-6 text-lg leading-relaxed text-slate-700">{article.excerpt}</p>
            ) : null}

            {article.content ? (
              <div
                className="prose prose-slate mt-8 max-w-none prose-headings:font-display prose-headings:text-[#021d33]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p className="mt-8 text-slate-500">Obsah článku bude brzy doplněn.</p>
            )}

            <PublicAdBlocks campaigns={inlineAds} variant="inline" />

            {article.source_url ? (
              <p className="mt-8 text-sm">
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#005B96] hover:underline"
                >
                  Odborný zdroj
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </p>
            ) : null}

            <p className="mt-10 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-950">
              Informace na medscopeglobal.com slouží k obecnému vzdělávání a nenahrazují konzultaci s
              lékařem. Při akutních potížích vyhledejte odbornou pomoc.
            </p>

            <EditorialFooter locale="cs" />
          </article>

          {sidebarAds.length > 0 ? (
            <aside className="hidden space-y-3 lg:block">
              <PublicAdBlocks campaigns={sidebarAds} variant="sidebar" />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
