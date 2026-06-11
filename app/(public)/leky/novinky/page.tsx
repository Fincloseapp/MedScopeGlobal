import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";

export const revalidate = 120;

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
          <DrugNewsListCard key={d.id} item={d} />
        ))}
      </div>
      <DrugSourceAttribution className="mt-8" />
    </ModulePageShell>
  );
}
