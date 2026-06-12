import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { LekySubpageNav } from "@/components/v4c/leky-subpage-nav";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Pipeline léků — MedScopeGlobal",
  description: "Připravované léčivé přípravky ve vývoji a registraci.",
  path: "/leky/pipeline",
});

export default async function LekyPipelinePage() {
  const items = await getDrugNewsList("pipeline");

  return (
    <ModulePageShell
      eyebrow="Léky"
      title="Pipeline"
      description="Vývojové a registrační pipeline — EMA, FDA, SÚKL."
      ctaHref="/leky"
      ctaLabel="Hub léky"
    >
      <LekySubpageNav current="pipeline" />
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
