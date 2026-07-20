import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialFooter } from "@/components/article/editorial-footer";
import { OsvetaVideoWithConversion } from "@/components/v38/osveta-video-with-conversion";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getVideoEditorialLabel } from "@/lib/editorial/video-units";
import {
  getPublicHealthQuizByVideoId,
  getPublicHealthVideoBySlug,
  listPublicHealthVideos,
} from "@/lib/verejnost/osveta/db";
import { PublicHealthVideoCard } from "@/components/verejnost/public-health-video-card";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getPublicHealthVideoBySlug(slug);
  if (!video) return { title: "Video nenalezeno" };
  return {
    title: `${video.title} | Osvěta | MedScopeGlobal`,
    description: video.script.slice(0, 160),
    openGraph: {
      title: video.title,
      images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
    },
  };
}

export default async function OsvetaVideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await getPublicHealthVideoBySlug(slug);
  if (!video) notFound();

  const [quiz, related] = await Promise.all([
    getPublicHealthQuizByVideoId(video.id),
    listPublicHealthVideos({ limit: 4 }),
  ]);

  const editorialLabel = getVideoEditorialLabel({
    avatarType: video.avatar_type,
    category: video.topic?.category,
    metadata: video.metadata,
    audience: "osveta",
    slug: video.slug,
    aiAssisted: false,
  });
  const relatedFiltered = related.filter((v) => v.slug !== slug).slice(0, 3);
  const { isVip } = await getReaderContext();

  const shareUrl = `https://medscopeglobal.com/verejnost/osveta/${slug}`;
  const dateLabel = video.published_at
    ? new Date(video.published_at).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const minutes = Math.max(1, Math.round(video.duration_seconds / 60));

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/verejnost/osveta" className="text-sm font-medium text-[#005B96] hover:underline">
          ← Všechny lekce
        </Link>

        <header className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {video.topic?.title ?? "Zdravotní osvěta"} · {minutes} min
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
            {video.title}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-medium text-slate-700">{editorialLabel}</span>
            {dateLabel ? <span className="text-slate-400"> · {dateLabel}</span> : null}
          </p>
        </header>

        <div className="mt-7">
          <OsvetaVideoWithConversion video={video} quiz={quiz} isVip={isVip} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#005B96]/30"
          >
            Sdílet
          </a>
          <Link
            href="/verejnost/zebricek"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#005B96] transition hover:border-[#005B96]/30"
          >
            Žebříček XP
          </Link>
        </div>

        {relatedFiltered.length ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-[#021d33]">Další lekce</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedFiltered.map((v) => (
                <PublicHealthVideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        ) : null}

        <EditorialFooter locale="cs" />

        <p className="mt-6 text-center text-xs text-slate-400">
          Informace nenahrazují lékařskou péči · medscopeglobal.com
        </p>
      </div>
    </div>
  );
}
