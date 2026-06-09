import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V21ModuleDetailView } from "@/components/v21/module-detail-view";
import { buildModuleSections, formatCsDate } from "@/lib/v21/enrich";
import { v21ImageForModule } from "@/lib/v21/images";
import { getUniversityNewsBySlug } from "@/lib/queries/v4c/university-news";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getUniversityNewsBySlug(slug);
  return { title: item?.title ?? "Univerzitní novinky" };
}

export const revalidate = 120;

export default async function UniversityNewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getUniversityNewsBySlug(slug);
  if (!item) notFound();

  const sections = buildModuleSections({
    topic: item.title,
    summary: item.summary,
    body: item.body,
    source: item.university ?? "České lékařské fakulty",
    moduleLabel: "Univerzitní novinky",
  });

  return (
    <V21ModuleDetailView
      backHref="/novinky/univerzity"
      backLabel="Novinky z univerzit"
      eyebrow="Lékařské fakulty · ČR"
      title={item.title}
      subtitle={[item.university, item.tag].filter(Boolean).join(" · ")}
      dateLabel={formatCsDate(item.published_date ?? item.event_date)}
      imageUrl={item.image_url ?? v21ImageForModule("university", item.slug)}
      sections={sections}
      source={item.university ?? "LF"}
      sourceUrl={item.source_url}
      badge={item.tag}
    />
  );
}
