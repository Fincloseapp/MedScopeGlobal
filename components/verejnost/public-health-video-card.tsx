import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";
import { getVideoEditorialLabel } from "@/lib/editorial/video-units";
import type { PublicHealthVideoWithTopic } from "@/types/public-osveta";

const CATEGORY_LABELS: Record<string, string> = {
  prevence: "Prevence",
  nemoc: "Nemoci",
  dlouhovekost: "Dlouhověkost",
  "zivotni-styl": "Životní styl",
};

export function PublicHealthVideoCard({
  video,
  featured = false,
}: {
  video: PublicHealthVideoWithTopic;
  featured?: boolean;
}) {
  const avatar = getPublicAvatar(video.avatar_type);
  const editorialLabel = getVideoEditorialLabel({
    avatarType: video.avatar_type,
    category: video.topic?.category,
    metadata: video.metadata,
    audience: "osveta",
    slug: video.slug,
  });
  const thumb = video.thumbnail_url ?? avatar.imageUrl;
  const category = video.topic?.category;
  const dateLabel = video.published_at
    ? new Date(video.published_at).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/verejnost/osveta/${video.slug}`}
      prefetch
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "border-[#005B96]/40 shadow-md sm:flex-row" : "border-slate-200"
      }`}
    >
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? "sm:w-2/5" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={editorialLabel}
          className={`w-full object-cover transition group-hover:scale-105 ${
            featured ? "aspect-video sm:h-full sm:min-h-[180px]" : "aspect-video"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#005B96]">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          <Clock className="h-3 w-3" />
          {Math.round(video.duration_seconds / 60) || 1} min
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-4 ${featured ? "sm:p-5" : ""}`}>
        {category ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
            {CATEGORY_LABELS[category] ?? category}
          </span>
        ) : null}
        <h3
          className={`mt-1 font-display font-semibold text-[#021d33] group-hover:text-[#005B96] ${
            featured ? "text-lg" : "text-base"
          }`}
        >
          {video.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{editorialLabel}</p>
        {dateLabel ? <p className="mt-auto pt-2 text-[10px] text-slate-400">{dateLabel}</p> : null}
      </div>
    </Link>
  );
}
