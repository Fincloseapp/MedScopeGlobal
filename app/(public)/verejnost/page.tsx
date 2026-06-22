import type { Metadata } from "next";
import Link from "next/link";
import { DailyTipBanner } from "@/components/verejnost/daily-tip-banner";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Veřejné zdraví | MedScopeGlobal",
    description:
      "Průvodce nemocemi, prevence, výživa, spánek, stres a rozhovory s odborníky — srozumitelně pro každého.",
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
    title: "Přečtěte článek nebo tip",
    desc: "Krátké texty v češtině bez odborného žargonu. Denní video tip s kvízem.",
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

const QUICK_LINKS = [
  { href: "/verejnost/temata", label: "Najdi svůj problém", desc: "Symptomy, prevence, nemoci — začněte zde" },
  { href: "/verejnost/clanky", label: "Články pro veřejnost", desc: "Srozumitelné texty v češtině" },
  { href: "/verejnost/osveta", label: "Denní zdravotní tip", desc: "Krátké video s avatarem a kvízem" },
  { href: "/ai-asistent/verejnost", label: "Zeptej se AI", desc: "Odpovědi o prevenci — nenahrazuje lékaře" },
  { href: "/verejnost/rozhovory", label: "Rozhovory s odborníky", desc: "Lékaři a specialisté vysvětlují srozumitelně" },
  { href: "/verejnost/zebricek", label: "Žebříček XP", desc: "Body za sledování tipů a kvízy" },
];

export default async function VerejnostHubPage() {
  const latest = await listPublicArticles({ limit: 6 });
  const topics = VEREJNOST_HUB_TOPICS;

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
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Pro každého · Veřejné zdraví
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Zdraví srozumitelně — bez odborného žargonu
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Průvodce prevencí, symptomy, výživou, spánkem a stresem. Obsah pro širokou veřejnost
            v češtině — vzdělávací, nikoli náhrada lékařské péče.
          </p>
          {lastUpdateLabel ? (
            <p className="mt-4 text-xs text-white/50">Poslední článek: {lastUpdateLabel}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verejnost/temata"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              Najdi svůj problém
            </Link>
            <Link
              href="/verejnost/clanky"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Prohlédnout články
            </Link>
            <Link
              href="/verejnost/osveta"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Dnešní zdravotní tip
            </Link>
            <Link
              href="/ai-asistent/verejnost"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Zeptej se AI
            </Link>
          </div>
        </div>
      </section>

      <DailyTipBanner />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PublicTrustDisclaimer className="mb-10" />

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Jak začít</p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Tři kroky pro orientaci ve zdraví</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {START_HERE.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rychlé odkazy</p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Co zde najdete</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-md"
            >
              <p className="font-semibold text-[#021d33]">{l.label}</p>
              <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
            </Link>
          ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Témata</p>
              <h2 className="font-display text-2xl font-bold text-[#021d33]">Prozkoumejte oblasti</h2>
            </div>
            <Link href="/verejnost/temata" className="shrink-0 text-sm font-medium text-[#005B96] hover:underline">
              Všechna témata →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={
                  t.slug === "rozhovory"
                    ? "/verejnost/rozhovory"
                    : `/verejnost/clanky?topic=${t.backendTopic}`
                }
                prefetch
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
              >
                <p className="font-semibold text-[#021d33]">{t.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                medscopeglobal.com
              </p>
              <h2 className="font-display text-2xl font-bold text-[#021d33]">Nejnovější články</h2>
            </div>
            <Link href="/verejnost/clanky" className="shrink-0 text-sm font-medium text-[#005B96] hover:underline">
              Zobrazit vše →
            </Link>
          </div>

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

        <p className="mt-14 text-center">
          <PublicTrustDisclaimer variant="inline" />
        </p>
      </div>
    </div>
  );
}
