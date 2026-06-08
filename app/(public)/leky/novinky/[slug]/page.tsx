import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V21ModuleDetailView } from "@/components/v21/module-detail-view";
import { buildModuleSections, ensureCzechText, formatCsDate } from "@/lib/v21/enrich";
import { v21ImageForModule } from "@/lib/v21/images";
import { getDrugNewsBySlug } from "@/lib/queries/v4c/drug-news";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDrugNewsBySlug(slug);
  return { title: d?.title ?? "Léková novinka" };
}

export default async function LekyDetailPage({ params }: Props) {
  const { slug } = await params;
  const drug = await getDrugNewsBySlug(slug);
  if (!drug) notFound();
  const ads = await getActiveAdsByPlacement("drugs_under_title", 1);

  const title = ensureCzechText(drug.title, "Léková novinka");
  const sections = buildModuleSections({
    topic: drug.drug_name ?? title,
    summary: drug.summary,
    body: drug.body,
    source: drug.agency ?? "SÚKL",
    moduleLabel: "Lékové novinky",
  });

  return (
    <>
      <AdPlacement ads={ads} variant="banner" />
      <V21ModuleDetailView
        backHref="/leky/novinky"
        backLabel="Lékové novinky"
        eyebrow="Léky · SÚKL / EMA"
        title={title}
        subtitle={[drug.drug_name, drug.status].filter(Boolean).join(" · ")}
        dateLabel={formatCsDate(drug.published_date)}
        imageUrl={drug.image_url ?? v21ImageForModule("drug", drug.slug)}
        sections={sections}
        source={drug.agency ?? "SÚKL"}
        sourceUrl={drug.source_url}
        badge={drug.status}
      />
    </>
  );
}
