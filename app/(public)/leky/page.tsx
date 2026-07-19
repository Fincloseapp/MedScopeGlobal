import type { Metadata } from "next";
import Link from "next/link";
import { AdPlacement } from "@/components/ads/ad-placement";
import { DrugAgencyOverview } from "@/components/v4c/drug-agency-overview";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { getDrugNewsGroupedByAgency, getDrugNewsList } from "@/lib/queries/v4c/drug-news";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Léky a farmakoterapie | MedScopeGlobal",
  description:
    "Lékové novinky z SÚKL, EMA a FDA — schválení, bezpečnostní upozornění a pipeline. Automatická aktualizace z oficiálních zdrojů.",
};

const HUB_LINKS = [
  { href: "/leky/novinky", label: "Novinky o lécích", desc: "Registrace, SPC, bezpečnost, úhrady" },
  { href: "/leky/schvalene", label: "Schválené léky", desc: "Nová registrace a indikace" },
  { href: "/leky/pipeline", label: "Pipeline", desc: "Připravované přípravky ve vývoji" },
  { href: "/ai/leky", label: "AI léky", desc: "Odborný AI přehled" },
];

export default async function LekyHubPage() {
  const [latest, grouped, underTitleAds, sidebarAds] = await Promise.all([
    getDrugNewsList(),
    getDrugNewsGroupedByAgency(4),
    getActiveAdsByPlacement("drugs_under_title", 1),
    getActiveAdsByPlacement("drugs_sidebar", 2),
  ]);

  const preview = latest.slice(0, 6);
  const lastUpdate = latest[0]?.published_date ?? latest[0]?.created_at ?? null;
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
            medscopeglobal.com · Léky
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Léky a farmakoterapie
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Schválení, bezpečnostní upozornění a pipeline z oficiálních registrů SÚKL, EMA a FDA.
            Obsah se automaticky aktualizuje a zobrazuje v češtině.
          </p>
          {lastUpdateLabel ? (
            <p className="mt-4 text-xs text-white/50">Poslední synchronizace: {lastUpdateLabel}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/leky/novinky"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              Všechny novinky
            </Link>
            <Link
              href="/leky/schvalene"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Schválené přípravky
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdPlacement ads={underTitleAds} variant="banner" />
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <DrugAgencyOverview byAgency={grouped} />

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HUB_LINKS.map((l) => (
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    medscopeglobal.com
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#021d33]">
                    Nejnovější lékové novinky
                  </h2>
                </div>
                <Link href="/leky/novinky" className="shrink-0 text-sm font-medium text-[#005B96] hover:underline">
                  Zobrazit vše →
                </Link>
              </div>

              {preview.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {preview.map((item) => (
                    <DrugNewsListCard key={item.id} item={item} variant="text-only" />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  <p>První synchronizace z oficiálních zdrojů proběhne automaticky během dne.</p>
                  <p className="mt-2 text-xs">
                    SÚKL, EMA a FDA — monitoring přes denní CRON medscopeglobal.com.
                  </p>
                </div>
              )}
            </section>

            <DrugSourceAttribution className="mt-14" />
          </div>
          <AdPlacement ads={sidebarAds} variant="sidebar" />
        </div>
      </div>
    </div>
  );
}
