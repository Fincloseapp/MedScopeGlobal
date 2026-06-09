import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V21ModuleDetailView } from "@/components/v21/module-detail-view";
import { buildModuleSections, formatCsDate } from "@/lib/v21/enrich";
import { v21ImageForModule } from "@/lib/v21/images";
import { getLegislationBySlug } from "@/lib/queries/v4c/legislation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getLegislationBySlug(slug);
  return { title: item?.title ?? "Legislativa" };
}

export const revalidate = 120;

export default async function LegislatiavaDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getLegislationBySlug(slug);
  if (!item) notFound();

  const sections = buildModuleSections({
    topic: item.title,
    summary: item.summary,
    body: item.body,
    source: item.source,
    moduleLabel: "Legislativa",
  });

  return (
    <V21ModuleDetailView
      backHref="/legislativa"
      backLabel="Legislativa"
      eyebrow="Legislativa · MZČR / SÚKL / ÚZIS"
      title={item.title}
      subtitle={`Kategorie: ${item.category}`}
      dateLabel={formatCsDate(item.published_date)}
      imageUrl={item.image_url ?? v21ImageForModule("legislation", item.slug)}
      sections={sections}
      source={item.source}
      sourceUrl={item.source_url}
      badge={item.category}
    />
  );
}
