import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Schválené léky",
  description: "Nově schválené a registrované léčivé přípravky — EMA, FDA, SÚKL.",
};

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
      <Link href="/leky" className="mb-6 inline-block text-sm text-primary hover:underline">
        ← Zpět na přehled léků
      </Link>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((d) => (
          <DrugNewsListCard key={d.id} item={d} />
        ))}
      </div>
      <DrugSourceAttribution className="mt-8" />
    </ModulePageShell>
  );
}
