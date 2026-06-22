import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyBySlug } from "@/lib/queries/study-collaborations";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);
  return { title: study?.title ?? "Studie" };
}

export default async function StudieDetailPage({ params }: Props) {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);
  if (!study) notFound();

  const inlineAds = await getActiveAdsByPlacement("study_inline", 1);
  const sidebarAds = await getActiveAdsByPlacement("study_sidebar", 2);

  return (
    <div className="bg-[#fafcff]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <Link href="/studijni-spoluprace" className="text-sm text-[#005B96] hover:underline">
            ← Studijní spolupráce
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-[#021d33]">{study.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{study.organization}</p>
          <AdPlacement ads={inlineAds} variant="inline" />
          <p className="mt-6 text-slate-700">{study.summary}</p>
          {study.body ? <div className="mt-4 prose prose-slate whitespace-pre-wrap">{study.body}</div> : null}
          {(study.apply_url || study.contact_email) && (
            <div className="mt-8">
              {study.apply_url ? (
                <a href={study.apply_url} className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white">
                  Přihlásit se
                </a>
              ) : (
                <a href={`mailto:${study.contact_email}`} className="text-[#005B96] font-semibold">
                  {study.contact_email}
                </a>
              )}
            </div>
          )}
        </div>
        <AdPlacement ads={sidebarAds} variant="sidebar" />
      </div>
    </div>
  );
}
