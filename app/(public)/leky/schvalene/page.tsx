import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { LekySubpageNav } from "@/components/v4c/leky-subpage-nav";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Schválené léky — MedScopeGlobal",
  description: "Nově schválené a registrované léčivé přípravky — EMA, FDA, SÚKL.",
  path: "/leky/schvalene",
});

export default async function LekySchvalenePage() {
  const items = await getDrugNewsList("approved");

  return (
    <ModulePageShell
      eyebrow="Léky"
      title="Schválené léky"
      description="Přehled nově schválených registrací a indikací."
      ctaHref="/leky"
      ctaLabel="Hub léky"
    >
      <LekySubpageNav current="schvalene" />
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((d) => (
            <DrugNewsListCard key={d.id} item={d} />
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
      <DrugSourceAttribution className="mt-8" />
    </ModulePageShell>
  );
}
