import type { Metadata } from "next";
import Link from "next/link";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20StudiesList } from "@/lib/v20/studies/query";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { V20ArticleCard } from "@/components/v20/article-card";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { V20_STUDY_SOURCES } from "@/lib/v20/studies/sources";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getStudieHubCopy } from "@/lib/i18n/studie-hub-copy";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/studie",
    locale,
  });
}

export default async function StudiePage() {
  const locale = await getServerLocale();
  const copy = getStudieHubCopy(locale);
  const [studies, magazine] = await Promise.all([
    getV20StudiesList(12),
    listPublicArticles({ limit: 12, ensureContent: false, mode: "card", locale }),
  ]);
  const research = magazine.filter((article) =>
    /studi|výzkum|vyzkum|guideline|WHO|screening|eviden/i.test(
      `${article.title} ${article.excerpt} ${article.public_topic}`
    )
  );

  return (
    <div className="v20-studies-page mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">{copy.eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">{copy.title}</h1>
      <p className="mt-3 max-w-3xl text-slate-600">{copy.lead}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["DOI", "PMID", "CONSORT", "PRISMA"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-semibold text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link
          href={localizePublicHref("/studie/nejnovejsi", locale)}
          className="rounded-full bg-primary px-3 py-1 text-white"
        >
          {copy.latest}
        </Link>
        <Link
          href={localizePublicHref("/studie/archiv", locale)}
          className="rounded-full border border-slate-200 px-3 py-1 text-primary"
        >
          {copy.archive}
        </Link>
      </div>

      {studies.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <V20StudyCard key={s.id} study={s} />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <p className="font-semibold text-[#021d33]">{copy.emptyTitle}</p>
            <p className="mt-2">
              {copy.emptyBody}{" "}
              <Link href={localizePublicHref("/aktualni-zpravy", locale)} className="font-semibold text-primary hover:underline">
                {copy.emptyLink}
              </Link>
              .
            </p>
          </div>
          {research.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {research.map((article) => (
                <V20ArticleCard key={article.slug} article={article} locale={locale} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-[#021d33]">{copy.sourcesTitle}</p>
        <p className="mt-2">{V20_STUDY_SOURCES.map((s) => s.name).join(" · ")}</p>
        <p className="mt-3 text-xs text-slate-500">{copy.sourcesNote}</p>
      </div>
    </div>
  );
}
