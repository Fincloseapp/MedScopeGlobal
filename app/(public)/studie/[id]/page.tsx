import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V20StudyDetailView } from "@/components/v20/study-detail-view";
import { getV20StudyBySlugOrId } from "@/lib/v20/studies/query";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

export const revalidate = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await getV20StudyBySlugOrId(id);
  if (!s) return { title: "Studie" };
  return buildV20PageMetadata({
    title: `${s.titleCs} — MedScopeGlobal`,
    description: s.summaryCs.slice(0, 160),
    path: `/studie/${s.slug}`,
  });
}

export default async function StudieDetailPage({ params }: Props) {
  const { id } = await params;
  const study = await getV20StudyBySlugOrId(id);
  if (!study) notFound();

  const [sidebarAds, inlineAds] = await Promise.all([
    getActiveAdsByPlacement("study_sidebar", 2),
    getActiveAdsByPlacement("study_inline", 1),
  ]);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:grid lg:max-w-6xl lg:grid-cols-[1fr_260px] lg:gap-8">
        <div>
          <AdPlacement ads={inlineAds} variant="inline" />
          <V20StudyDetailView study={study} />
        </div>
        <div className="mt-8 lg:mt-0">
          <AdPlacement ads={sidebarAds} variant="sidebar" />
        </div>
      </div>
    </div>
  );
}
