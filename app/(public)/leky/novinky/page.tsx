import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import { DRUG_STATUS_LABELS } from "@/lib/v4c/drug-sources";
import { resolveManyImages } from "@/lib/v25/images/resolve-many";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Lékové novinky",
  description: "Nové, schválené a připravované léky — EMA, FDA, SÚKL.",
};

export default async function LekyNovinkyPage() {
  const all = await resolveManyImages(await getDrugNewsList(), "drug_news");

  return (
    <ModulePageShell
      eyebrow="Léky"
      title="Novinky o lécích"
      description="Monitoring EMA, FDA, SÚKL — registrace, SPC, úhrady, klinické studie."
      ctaHref="/leky"
      ctaLabel="Přehled léků"
    >
      <div className="mb-6 flex gap-2 text-sm">
        <Link href="/leky" prefetch className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          ← Hub léky
        </Link>
        {["new", "approved", "pipeline"].map((st) => (
          <span key={st} className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
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
            badge={DRUG_STATUS_LABELS[d.status] ?? d.status}
            imageUrl={d.resolvedImageUrl}
            imageAlt={d.drug_name ?? d.title}
          />
        ))}
      </div>
      <DrugSourceAttribution className="mt-8" />
    </ModulePageShell>
  );
}
