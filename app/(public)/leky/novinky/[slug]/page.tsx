import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DrugNewsDetail } from "@/components/v4c/drug-news-detail";
import { ensureCzechText } from "@/lib/v21/enrich";
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

  return (
    <>
      <AdPlacement ads={ads} variant="banner" />
      <DrugNewsDetail drug={drug} />
    </>
  );
}
