import type { Metadata } from "next";
import Link from "next/link";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { listPublicArticles } from "@/lib/queries/verejnost";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Veřejné zdraví | MedScopeGlobal",
  description:
    "Průvodce nemocemi, prevence, výživa, spánek, stres a rozhovory s odborníky — srozumitelně pro každého.",
};

const QUICK_LINKS = [
  { href: "/verejnost/clanky", label: "Všechny články", desc: "Aktuální články pro veřejnost" },
  { href: "/verejnost/temata", label: "Témata", desc: "Kategorie podle oblasti zdraví" },
  { href: "/verejnost/rozhovory", label: "Rozhovory", desc: "Rozhovory s lékaři a odborníky" },
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
            medscopeglobal.com · Veřejné zdraví
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Veřejné zdraví
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Průvodce nemocemi, symptomy, prevence, životní styl, výživa, spánek, stres, ergonomie a
            rozhovory s odborníky — srozumitelně a v češtině.
          </p>
          {lastUpdateLabel ? (
            <p className="mt-4 text-xs text-white/50">Poslední článek: {lastUpdateLabel}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verejnost/clanky"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              Prohlédnout články
            </Link>
            <Link
              href="/verejnost/rozhovory"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Rozhovory
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
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

        <p className="mt-14 text-center text-xs text-slate-400">
          medscopeglobal.com · Veřejné zdraví · Informace nenahrazují lékařskou péči
        </p>
      </div>
    </div>
  );
}
