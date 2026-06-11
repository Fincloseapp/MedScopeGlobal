import type { Metadata } from "next";

import Link from "next/link";

import { ModulePageShell } from "@/components/b2b/module-page-shell";

import { V4cContentCard } from "@/components/v4c/content-card";

import { DrugAgencyOverview } from "@/components/v4c/drug-agency-overview";

import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";

import { PublicModuleImage } from "@/components/v25/public-module-image";

import { getDrugNewsGroupedByAgency, getDrugNewsList } from "@/lib/queries/v4c/drug-news";

import { DRUG_STATUS_LABELS } from "@/lib/v4c/drug-sources";

import { resolveManyImages } from "@/lib/v25/images/resolve-many";

import { resolvePublicImageUrl } from "@/lib/v25/images/resolve-public";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Léky — MedScopeGlobal",
  description:
    "Lékové novinky, schválení a pipeline — automatický monitoring SÚKL, EMA a FDA v češtině.",
};

const HUB_LINKS = [
  { href: "/leky/novinky", label: "Novinky o lécích", desc: "Registrace, SPC, bezpečnost, úhrady" },
  { href: "/leky/schvalene", label: "Schválené léky", desc: "Nová registrace a indikace" },
  { href: "/leky/pipeline", label: "Pipeline", desc: "Připravované přípravky ve vývoji" },
  { href: "/ai/leky", label: "AI léky", desc: "Odborný AI přehled" },
];

export default async function LekyHubPage() {
  const [latest, byAgency] = await Promise.all([getDrugNewsList(), getDrugNewsGroupedByAgency(8)]);
  const preview = await resolveManyImages(latest.slice(0, 6), "drug_news");

  const heroImage = await resolvePublicImageUrl({
    section: "drug_news",
    slug: "leky-hub",
    dbUrl: null,
  });

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
    <ModulePageShell
      eyebrow="Léky"
      title="Léky a farmakoterapie"
      description="Profesionální monitoring SÚKL, EMA a FDA — novinky, schválení a vývojové pipeline. Automatická aktualizace z oficiálních zdrojů."
      ctaHref="/leky/novinky"
      ctaLabel="Všechny novinky"
    >
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#005B96]/20 via-slate-100 to-[#021d33]/10">
        <PublicModuleImage
          src={heroImage}
          alt="Farmakoterapie a léková bezpečnost — MedScopeGlobal"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/85 via-[#021d33]/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <p className="text-sm font-medium text-white/95">
            Evidence-based přehled pro klinickou praxi
          </p>
          <p className="mt-1 max-w-2xl text-xs text-white/75">
            SÚKL · EMA · FDA — strukturované shrnutí v češtině s odkazem na primární dokument u každé
            položky.
          </p>
          {lastUpdateLabel ? (
            <p className="mt-3 text-[11px] text-white/60">Poslední synchronizace: {lastUpdateLabel}</p>
          ) : null}
        </div>
      </div>

      <DrugAgencyOverview byAgency={byAgency} />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HUB_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40 hover:shadow-md"
          >
            <p className="font-semibold text-[#021d33]">{l.label}</p>
            <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">Nejnovější lékové novinky</h2>
        <Link href="/leky/novinky" className="text-sm text-[#005B96] hover:underline">
          Zobrazit vše →
        </Link>
      </div>

      {preview.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {preview.map((d) => (
            <V4cContentCard
              key={d.id}
              href={`/leky/novinky/${d.slug}`}
              title={d.title}
              meta={[d.agency?.toUpperCase(), d.drug_name, d.published_date]
                .filter(Boolean)
                .join(" · ")}
              summary={d.summary}
              badge={DRUG_STATUS_LABELS[d.status] ?? d.status}
              imageUrl={d.resolvedImageUrl}
              imageAlt={d.drug_name ?? d.title}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <p>První synchronizace z oficiálních zdrojů proběhne automaticky během dne.</p>
          <p className="mt-2 text-xs">
            SÚKL, EMA a FDA — monitoring přes denní CRON MedScopeGlobal.
          </p>
        </div>
      )}

      <DrugSourceAttribution className="mt-10" />
    </ModulePageShell>
  );
}
