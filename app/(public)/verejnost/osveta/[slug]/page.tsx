import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  });
  const relatedFiltered = related.filter((v) => v.slug !== slug).slice(0, 3);
  const { isVip } = await getReaderContext();

  const shareUrl = `https://medscopeglobal.com/verejnost/osveta/${slug}`;

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/verejnost/osveta" className="text-sm font-medium text-[#005B96] hover:underline">
          ← Všechna videa
        </Link>

        <header className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            {video.topic?.title ?? "Zdravotní osvěta"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{video.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {editorialLabel}
            {video.published_at
              ? ` · ${new Date(video.published_at).toLocaleDateString("cs-CZ")}`
              : ""}
          </p>
        </header>

        <div className="mt-6">
          <OsvetaVideoWithConversion video={video} quiz={quiz} isVip={isVip} />
        </div>

        <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-[#021d33]">Přepis videa</summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{video.script}</p>
        </details>

        <div className="mt-6 flex flex-wrap gap-3">
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
            <h2 className="font-display text-xl font-bold text-[#021d33]">Další videa</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedFiltered.map((v) => (
                <PublicHealthVideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-10 text-center text-xs text-slate-400">
          Informace nenahrazují lékařskou péči · medscopeglobal.com
        </p>
      </div>
    </div>
  );
}
