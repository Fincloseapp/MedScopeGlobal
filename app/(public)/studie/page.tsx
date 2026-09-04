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

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Studie — MedScopeGlobal",
    description:
      "Revmatologické a klinické studie v češtině — PubMed, ClinicalTrials.gov, EULAR, SÚKL, WHO, NZIP. Každý souhrn s DOI nebo PMID.",
    path: "/studie",
  });
}

export default async function StudiePage() {
  const locale = await getServerLocale();
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Výzkum</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Studie — revmatologie</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Profesionální české shrnutí klinických studií. Každá publikace obsahuje souhrn, metodiku,
        výsledky, závěr, klinický dopad a ověřitelné identifikátory{" "}
        <strong className="font-semibold text-[#021d33]">DOI</strong> nebo{" "}
        <strong className="font-semibold text-[#021d33]">PubMed ID (PMID)</strong> odkazující na
        primární zdroj.
      </p>

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
          Nejnovější
        </Link>
        <Link
          href={localizePublicHref("/studie/archiv", locale)}
          className="rounded-full border border-slate-200 px-3 py-1 text-primary"
        >
          Archiv
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
            <p className="font-semibold text-[#021d33]">Kurátorované studie s DOI/PMID se doplňují</p>
            <p className="mt-2">
              Placeholdery neukazujeme. Mezitím čtěte redakční články k výzkumu a screeningu — nebo
              otevřete{" "}
              <Link href={localizePublicHref("/aktualni-zpravy", locale)} className="font-semibold text-primary hover:underline">
                aktuality
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
        <p className="font-semibold text-[#021d33]">Monitorované zdroje (v20.2)</p>
        <p className="mt-2">{V20_STUDY_SOURCES.map((s) => s.name).join(" · ")}</p>
        <p className="mt-3 text-xs text-slate-500">
          Redakční standard: peer review kontrola, typ studie (RCT, meta-analýza, kohortová), metodika
          dle CONSORT/PRISMA a odkaz na primární publikaci přes DOI nebo PMID.
        </p>
      </div>
    </div>
  );
}
