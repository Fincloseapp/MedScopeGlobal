"use client";

import { Video } from "lucide-react";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  className?: string;
};

type VideoMeta = {
  public_url?: string;
  mp4_url?: string;
  hls_url?: string;
  url_chain?: string[];
  thumbnail_url?: string;
};

const GTV_HOST = "storage.googleapis.com/gtv-videos-bucket";

function pickUrl(meta: VideoMeta): string {
  if (Array.isArray(meta.url_chain)) {
    for (const raw of meta.url_chain) {
      if (raw && !raw.includes(GTV_HOST)) return raw;
    }
  }
  for (const candidate of [meta.mp4_url, meta.public_url, meta.hls_url]) {
    if (candidate && !candidate.includes(GTV_HOST)) return candidate;
  }
  return V33_FALLBACK_MP4_URL;
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const meta = (video?.metadata ?? {}) as VideoMeta;
  const videoUrl = pickUrl(meta);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        <video
          controls
          playsInline
          preload="auto"
          poster={meta.thumbnail_url}
          title={lessonTitle}
          style={{ width: "100%", height: "auto" }}
        >
          <source src={videoUrl} type="video/mp4" />
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>
      {!video ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
          <Video className="h-3.5 w-3.5" />
          Záložní video — lekce se načítá z w3schools MP4
        </p>
      ) : video.duration_seconds > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          {Math.max(1, Math.round(video.duration_seconds / 60))} min
        </p>
      ) : null}
    </div>
  );
}
