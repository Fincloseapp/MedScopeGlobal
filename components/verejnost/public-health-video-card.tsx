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
    aiAssisted: false,
  });
  const thumb = video.thumbnail_url?.includes(".svg")
    ? avatar.imageUrl
    : (video.thumbnail_url ?? avatar.imageUrl);
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
        featured ? "border-[#005B96]/35 shadow-md sm:flex-row" : "border-[#d7e6f4]"
      }`}
    >
      <div className={`relative overflow-hidden bg-[#021d33] ${featured ? "sm:w-2/5" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt=""
          className={`w-full object-cover opacity-95 transition group-hover:scale-[1.03] ${
            featured ? "aspect-video sm:h-full sm:min-h-[180px]" : "aspect-video"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#005B96] shadow">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          Poslech
        </span>
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
          <Clock className="h-3 w-3" />
          {Math.round(video.duration_seconds / 60) || 1} min
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-4 ${featured ? "sm:p-6" : ""}`}>
        {category ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
            {CATEGORY_LABELS[category] ?? category}
          </span>
        ) : null}
        <h3
          className={`mt-1.5 font-display font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96] ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {video.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{editorialLabel}</p>
        {dateLabel ? <p className="mt-auto pt-3 text-[11px] text-slate-400">{dateLabel}</p> : null}
      </div>
    </Link>
  );
}
