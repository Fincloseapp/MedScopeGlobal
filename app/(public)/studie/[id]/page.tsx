import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyById } from "@/lib/queries/v4c/studies";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await getStudyById(id);
  return { title: s?.title ?? "Studie" };
}

export default async function StudieDetailPage({ params }: Props) {
  const { id } = await params;
  const study = await getStudyById(id);
  if (!study) notFound();
  const sidebarAds = await getActiveAdsByPlacement("study_sidebar", 2);
  const inlineAds = await getActiveAdsByPlacement("study_inline", 1);

  return (
    <div className="bg-[#fafcff]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <Link href="/studie" className="text-sm text-[#005B96]">← Studie</Link>
          <AdPlacement ads={inlineAds} variant="inline" />
          <h1 className="mt-4 font-display text-3xl font-bold text-[#021d33]">{study.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{[study.journal, study.region, study.source_name].filter(Boolean).join(" · ")}</p>
          {study.image_url ? (
            <div className="relative mt-6 aspect-video rounded-2xl overflow-hidden bg-slate-100">
              <Image src={study.image_url} alt="" fill className="object-cover" sizes="700px" />
            </div>
          ) : null}
          <p className="mt-6 text-slate-700 whitespace-pre-wrap">{study.summary ?? study.abstract}</p>
          {study.source_url ? (
            <a href={study.source_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-[#005B96] font-semibold text-sm">
              Původní zdroj →
            </a>
          ) : null}
        </div>
        <AdPlacement ads={sidebarAds} variant="sidebar" />
      </div>
    </div>
  );
}
