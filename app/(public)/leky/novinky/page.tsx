import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Lékové novinky — MedScopeGlobal",
  description: "Nové, schválené a připravované léky — EMA, FDA, SÚKL.",
  path: "/leky/novinky",
});

export default async function LekyNovinkyPage() {
  const all = await getDrugNewsList();

  return (
    <ModulePageShell
      eyebrow="Léky"
      title="Novinky o lécích"
      description="Monitoring EMA, FDA, SÚKL — registrace, SPC, úhrady, klinické studie."
      ctaHref="/leky"
      ctaLabel="Hub léky"
    >
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/leky" prefetch className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          ← Hub léky
        </Link>
        <span className="rounded-full bg-[#005B96] px-3 py-1 text-white">Novinky</span>
        <Link
          href="/leky/schvalene"
          prefetch
          className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96] hover:bg-[#005B96]/5"
        >
          Schválené
        </Link>
        <Link
          href="/leky/pipeline"
          prefetch
          className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96] hover:bg-[#005B96]/5"
        >
          Pipeline
        </Link>
      </div>
      {all.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {all.map((d) => (
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
