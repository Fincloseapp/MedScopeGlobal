import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V21ModuleDetailView } from "@/components/v21/module-detail-view";
import { buildModuleSections, formatCsDate } from "@/lib/v21/enrich";
import { resolvePublicImageUrl } from "@/lib/v25/images/resolve-public";
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

  const imageUrl = await resolvePublicImageUrl({
    section: "university_news",
    slug: item.slug,
    dbUrl: item.image_url,
  });

  return (
    <V21ModuleDetailView
      backHref="/novinky/univerzity"
      backLabel="Novinky z univerzit"
      eyebrow="Lékařské fakulty · ČR"
      title={item.title}
      subtitle={[item.university, item.tag].filter(Boolean).join(" · ")}
      dateLabel={formatCsDate(item.published_date ?? item.event_date)}
      imageUrl={imageUrl}
      sections={sections}
      source={item.university ?? "LF"}
      sourceUrl={item.source_url}
      badge={item.tag}
    />
  );
}
