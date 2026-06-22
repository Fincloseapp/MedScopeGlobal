import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCongressBySlug } from "@/lib/queries/congresses";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getCongressBySlug(slug);
  return { title: ev?.title ?? "Kongres" };
}

export default async function KongresDetailPage({ params }: Props) {
  const { slug } = await params;
  const ev = await getCongressBySlug(slug);
  if (!ev) notFound();

  const detailAds = await getActiveAdsByPlacement("congress_detail", 1);

  return (
    <div className="bg-[#fafcff]">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Link href="/kongresy" className="text-sm text-[#005B96] hover:underline">
          ← Kongresy
        </Link>
        <AdPlacement ads={detailAds} variant="banner" />
        {ev.image_url ? (
          <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="800px" />
          </div>
        ) : null}
        <h1 className="mt-6 font-display text-3xl font-bold text-[#021d33]">{ev.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {[ev.starts_at && new Date(ev.starts_at).toLocaleString("cs-CZ"), ev.location, ev.price_hint]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {ev.summary ? <p className="mt-6 text-slate-700">{ev.summary}</p> : null}
        {ev.body ? <div className="mt-4 prose prose-slate whitespace-pre-wrap">{ev.body}</div> : null}
        {ev.registration_url ? (
          <a
            href={ev.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Registrace
          </a>
        ) : null}
      </div>
    </div>
  );
}
