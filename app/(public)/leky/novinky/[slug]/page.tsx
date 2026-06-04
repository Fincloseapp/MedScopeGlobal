import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="bg-[#fafcff] mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <Link href="/leky/novinky" className="text-sm text-[#005B96]">← Lékové novinky</Link>
      <AdPlacement ads={ads} variant="banner" />
      <h1 className="mt-4 font-display text-3xl font-bold">{drug.title}</h1>
      <p className="text-sm text-slate-500 mt-2">{drug.agency} · {drug.status}</p>
      {drug.image_url ? (
        <div className="relative mt-6 aspect-video rounded-2xl overflow-hidden bg-slate-100">
          <Image src={drug.image_url} alt="" fill className="object-cover" sizes="800px" />
        </div>
      ) : null}
      <p className="mt-6 text-slate-700">{drug.summary}</p>
      {drug.body ? <div className="mt-4 prose prose-slate">{drug.body}</div> : null}
    </div>
  );
}
