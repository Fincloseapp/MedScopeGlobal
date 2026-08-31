import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { getVideoEditorialLabel } from "@/lib/editorial/video-units";
import { resolveOsvetaThumb } from "@/lib/verejnost/osveta/resolve-thumb";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { topicLabelForSlug } from "@/lib/config/verejnost-topics";
import { translatePublicTitle } from "@/lib/verejnost/translate-public-text";
import type { PublicHealthVideoWithTopic } from "@/types/public-osveta";

export async function PublicHealthVideoCard({
  video,
  featured = false,
  locale,
}: {
  video: PublicHealthVideoWithTopic;
  featured?: boolean;
  locale?: string;
}) {
  const uiLocale = locale ?? "cs";
  const chrome = getVerejnostChrome(uiLocale);
  const editorialLabel = getVideoEditorialLabel({
    avatarType: video.avatar_type,
    category: video.topic?.category,
    metadata: video.metadata,
    audience: "osveta",
    slug: video.slug,
    locale: uiLocale,
    aiAssisted: false,
  });
  const thumb = resolveOsvetaThumb({
    thumbnailUrl: video.thumbnail_url,
    avatarType: video.avatar_type,
    category: video.topic?.category,
    slug: video.slug,
  });
  const category = video.topic?.category;
  const dateLabel = formatPublicDate(video.published_at, uiLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const title = await translatePublicTitle(video.title, uiLocale, chrome.dailyVideoEyebrow);

  return (
    <Link
      href={localizePublicHref(`/verejnost/osveta/${video.slug}`, uiLocale)}
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
          {chrome.listenBadge}
        </span>
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
          <Clock className="h-3 w-3" />
          {Math.round(video.duration_seconds / 60) || 1} min
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-4 ${featured ? "sm:p-6" : ""}`}>
        {category ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">
            {topicLabelForSlug(category, uiLocale)}
          </span>
        ) : null}
        <h3
          className={`mt-1.5 font-display font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96] ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{editorialLabel}</p>
        {dateLabel ? <p className="mt-auto pt-3 text-[11px] text-slate-400">{dateLabel}</p> : null}
      </div>
    </Link>
  );
}
