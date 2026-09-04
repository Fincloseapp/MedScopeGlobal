import Link from "next/link";
import type { DisplayArticle } from "@/lib/queries/articles";
import { NewsHeadlineRow } from "@/components/articles/news-article-card";
import { getHomepageLongevityCopy } from "@/lib/i18n/homepage-longevity";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { isLongevityArticle } from "@/lib/v271/news-desks";

export function HomepageLongevityStrip({
  articles,
  locale,
  exclusive = false,
}: {
  articles: DisplayArticle[];
  locale: string;
  exclusive?: boolean;
}) {
  const copy = getHomepageLongevityCopy(locale);
  const reading = exclusive
    ? articles.slice(0, 3)
    : articles.filter(isLongevityArticle).slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="homepage-longevity-title">
      <div className="rounded-xl border border-[#cfe1f3] bg-gradient-to-b from-[#e8f3fb] via-white to-white px-5 py-6 sm:px-7 sm:py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{copy.eyebrow}</p>
        <h2 id="homepage-longevity-title" className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{copy.lead}</p>

        <ol className={`mt-5 grid gap-3 ${copy.steps.length > 3 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}>
          {copy.steps.map((step, index) => (
            <li key={step.href} className="rounded-lg border border-[#d9e8f4] bg-white px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
                {index + 1}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-[#021d33]">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              <Link
                href={localizePublicHref(step.href, locale)}
                className="mt-3 inline-block text-sm font-semibold text-[#005B96] hover:underline"
              >
                {step.cta} →
              </Link>
            </li>
          ))}
        </ol>

        {reading.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#021d33]">{copy.readingTitle}</h3>
            <div className="mt-2 divide-y divide-slate-100 border-t border-slate-200">
              {reading.map((article) => (
                <NewsHeadlineRow key={article.id ?? article.slug} article={article} locale={locale} />
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">{copy.closer}</p>
        <p className="mt-1 text-xs text-slate-500">{copy.contributeHint}</p>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label={copy.title}>
          <Link
            href={localizePublicHref("/verejnost/clanky?topic=dlouhovekost", locale)}
            className="inline-flex items-center rounded-full border border-[#005B96]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
          >
            {copy.allArticles}
          </Link>
          <Link
            href={localizePublicHref("/verejnost/osveta", locale)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {copy.dailyTip}
          </Link>
          <Link
            href="/app/mediflow"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {copy.journal}
          </Link>
          <Link
            href={localizePublicHref("/predplatne?trial=1", locale)}
            className="inline-flex items-center rounded-full bg-[#005B96] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {copy.softCta}
          </Link>
        </nav>
      </div>
    </section>
  );
}
