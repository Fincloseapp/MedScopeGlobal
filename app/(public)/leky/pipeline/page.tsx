import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Pipeline léků",
  description: "Připravované léčivé přípravky ve vývoji a registraci.",
};

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
