import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getTodayPublicHealthVideo } from "@/lib/verejnost/osveta/db";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";

export async function DailyTipBanner() {
  const video = await getTodayPublicHealthVideo();
  if (!video) return null;

  const avatar = getPublicAvatar(video.avatar_type);
  const thumb = video.thumbnail_url ?? avatar.imageUrl;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href={`/verejnost/osveta/${video.slug}`}
        prefetch
        className="group flex flex-col overflow-hidden rounded-2xl border border-[#005B96]/20 bg-gradient-to-r from-[#005B96]/5 to-white shadow-sm transition hover:border-[#005B96]/40 hover:shadow-md sm:flex-row"
      >
        <div className="relative h-36 shrink-0 sm:h-auto sm:w-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt={video.title} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#005B96] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            Dnešní tip
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            Denní zdravotní video
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
            {video.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {avatar.name} · {Math.round(video.duration_seconds / 60) || 1} min · +10 XP
          </p>
        </div>
      </Link>
    </section>
  );
}
