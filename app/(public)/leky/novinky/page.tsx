import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DRUG_AGENCIES } from "@/lib/v4c/sources";

export const metadata: Metadata = {
  title: "Lékové novinky",
  description: "Nové, schválené a připravované léky — EMA, FDA, SÚKL.",
};

export default async function LekyNovinkyPage() {
  const all = await getDrugNewsList();

  return (
    <ModulePageShell
      eyebrow="Léky"
      title="Novinky o lécích"
      description="Monitoring EMA, FDA, SÚKL — registrace, SPC, úhrady, klinické studie."
      ctaHref="/ai/leky"
      ctaLabel="AI léky"
    >
      <div className="flex gap-2 text-sm mb-6">
        {["new", "approved", "pipeline"].map((st) => (
          <span key={st} className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96] capitalize">
            {st === "new" ? "Nové" : st === "approved" ? "Schválené" : "Připravované"}
          </span>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {all.map((d) => (
          <V4cContentCard
            key={d.id}
            href={`/leky/novinky/${d.slug}`}
            title={d.title}
            meta={[d.agency, d.drug_name, d.published_date].filter(Boolean).join(" · ")}
            summary={d.summary}
            badge={d.status}
          />
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-500">{DRUG_AGENCIES.map((a) => a.name).join(" · ")}</p>
    </ModulePageShell>
  );
}
