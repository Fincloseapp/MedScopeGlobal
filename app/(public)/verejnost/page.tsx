import type { Metadata } from "next";
import Link from "next/link";
import { DailyTipBanner } from "@/components/verejnost/daily-tip-banner";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { VerejnostTopicCard } from "@/components/verejnost/verejnost-topic-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { VEREJNOST_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 45;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Veřejné zdraví | MedScopeGlobal",
    description: VEREJNOST_MAGAZINE_HUB.heroDeck,
    path: "/verejnost",
  });
}

const START_HERE = [
  {
    step: "1",
    title: "Najděte své téma",
    desc: "Projděte kategorie podle oblasti zdraví — prevence, výživa, spánek a další.",
    href: "/verejnost/temata",
    cta: "Procházet témata",
  },
  {
    step: "2",
    title: "Přečtěte článek nebo poslechněte lekci",
    desc: "Dlouhé texty v češtině bez odborného žargonu, nebo krátká poslechová lekce s kvízem.",
    href: "/verejnost/clanky",
    cta: "Zobrazit články",
  },
  {
    step: "3",
    title: "Zeptejte se AI (volitelně)",
    desc: "Srozumitelné odpovědi o prevenci a životním stylu — nenahrazují návštěvu lékaře.",
    href: "/ai-asistent/verejnost",
    cta: "Zeptat se AI",
  },
] as const;

function topicHref(slug: string, backendTopic: string) {
  return slug === "rozhovory" ? "/verejnost/rozhovory" : `/verejnost/clanky?topic=${backendTopic}`;
}

export default async function VerejnostHubPage() {
  const latest = await listPublicArticles({ limit: 6 });
  const topics = VEREJNOST_HUB_TOPICS;
  const nav = VEREJNOST_MAGAZINE_HUB.articlesNav;

  const lastUpdate = latest[0]?.published_at ?? latest[0]?.created_at ?? null;
  const lastUpdateLabel = lastUpdate
    ? new Date(lastUpdate).toLocaleString("cs-CZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <MagazineSectionHub config={VEREJNOST_MAGAZINE_HUB}>
      <DailyTipBanner embedded />

      <section className="mb-12">
        <MagazineHubSectionHeader
          eyebrow="Jak začít"
          title="Tři kroky pro orientaci ve zdraví"
          description={
            lastUpdateLabel ? `Poslední článek: ${lastUpdateLabel}` : undefined
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {START_HERE.map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#005B96]/10 text-sm font-bold text-[#005B96]">
                {item.step}
              </span>
              <h3 className="mt-3 font-semibold text-[#021d33]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              <Link href={item.href} className="mt-3 inline-block text-sm font-medium text-[#005B96] hover:underline">
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <MagazineHubSectionHeader
          eyebrow="Témata"
          title="Prozkoumejte oblasti"
          description="Každé téma má vlastní články a ilustrace z redakčního archivu."
          href="/verejnost/temata"
          ctaLabel="Všechna témata →"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <VerejnostTopicCard
              key={t.slug}
              slug={t.slug}
              label={t.label}
              description={t.description}
              href={topicHref(t.slug, t.backendTopic)}
            />
          ))}
        </div>
      </section>

      <section>
        <MagazineHubSectionHeader
          eyebrow={nav.eyebrow}
          title={nav.title}
          description={nav.description}
          href="/verejnost/clanky"
          ctaLabel="Zobrazit vše →"
        />
        {latest.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <VerejnostArticleCard key={item.id} article={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            <p>První články pro veřejnost se připravují — obsah doplní AI redakce medscopeglobal.com.</p>
            <p className="mt-2 text-xs">Prevence · výživa · spánek · stres · ergonomie · rozhovory</p>
          </div>
        )}
      </section>
    </MagazineSectionHub>
  );
}
