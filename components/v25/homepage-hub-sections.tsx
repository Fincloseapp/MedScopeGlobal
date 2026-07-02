import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DailyTipBanner } from "@/components/verejnost/daily-tip-banner";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { V20ArticleCard } from "@/components/v20/article-card";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { listPublicArticles } from "@/lib/queries/verejnost";

const HUB_SECTIONS = [
  {
    id: "verejnost",
    eyebrow: "Veřejnost",
    title: "Veřejné zdraví",
    description: "Prevence, výživa, spánek, stres a rozhovory — srozumitelně v češtině.",
    href: "/verejnost",
    cta: "Přejít na veřejnost",
    accent: "from-[#005B96]/10 to-[#021d33]/5",
  },
  {
    id: "studenti",
    eyebrow: "Studenti",
    title: "Studium medicíny",
    description: "Kvízy, studijní plány, přijímačky a přehled lékařských fakult.",
    href: "/studium",
    cta: "Studijní sekce",
    accent: "from-emerald-50 to-slate-50",
  },
  {
    id: "odbornici",
    eyebrow: "Odborníci",
    title: "Pro lékaře a výzkum",
    description: "Studie, guidelines, legislativa a odborné AI texty pro praxi.",
    href: "/odborna",
    cta: "Odborná sekce",
    accent: "from-slate-100 to-slate-50",
  },
  {
    id: "clanky",
    eyebrow: "Články",
    title: "Odborné články",
    description: "Strukturovaný obsah s českým shrnutím pro rychlou orientaci v praxi.",
    href: "/articles",
    cta: "Všechny články",
    accent: "from-sky-50 to-white",
  },
  {
    id: "leky",
    eyebrow: "Léky",
    title: "Lékové informace",
    description: "Schválené přípravky, novinky SÚKL/EMA a vyhledávání v databázi.",
    href: "/leky",
    cta: "Databáze léků",
    accent: "from-amber-50 to-white",
  },
] as const;

export async function V25HomepageHubSections({
  professionalArticles,
}: {
  professionalArticles: DisplayArticle[];
}) {
  const publicArticles = await listPublicArticles({ limit: 3, ensureContent: true });

  return (
    <>
      <DailyTipBanner />

      <section className="border-b border-slate-200 bg-white" aria-labelledby="v25-hub-heading">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              MedScopeGlobal
            </p>
            <h2 id="v25-hub-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Kam dál?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Přehled hlavních sekcí — veřejnost, studenti, odborníci, články a léky.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {HUB_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                prefetch
                className={`group flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-br ${section.accent} p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {section.eyebrow}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                  {section.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{section.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  {section.cta}
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f4f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                Veřejnost
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                Nejnovější z veřejného zdraví
              </h2>
            </div>
            <Link href="/verejnost/clanky" className="text-sm font-medium text-[#005B96] hover:underline">
              Všechny veřejné články →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicArticles.map((article) => (
              <VerejnostArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
          {publicArticles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Články pro veřejnost se brzy objeví.{" "}
              <Link href="/verejnost" className="text-[#005B96] hover:underline">
                Přejít na hub veřejného zdraví
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Odborníci
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                Doporučené odborné články
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <Link href="/articles" className="text-primary hover:underline">
                Vše →
              </Link>
              <Link href="/articles?med_track=studium" className="text-primary hover:underline">
                Studium LF →
              </Link>
              <Link href="/leky" className="text-primary hover:underline">
                Léky →
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {professionalArticles.slice(0, 3).map((article) => (
              <V20ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {professionalArticles.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Zatím žádné aktivní odborné články.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
