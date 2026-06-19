"use client";

import { useMemo } from "react";
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
  generated?: boolean;
};

const GTV_HOST = "storage.googleapis.com/gtv-videos-bucket";

function isUnreliable(url: string): boolean {
  return url.includes(GTV_HOST);
}

function resolveVideoUrl(video: VideoAsset | null | undefined): string {
  const meta = (video?.metadata ?? {}) as VideoMeta;

  if (Array.isArray(meta.url_chain)) {
    for (const raw of meta.url_chain) {
      if (raw && !isUnreliable(raw)) return raw;
    }
  }

  for (const candidate of [meta.mp4_url, meta.public_url, meta.hls_url]) {
    if (candidate && !isUnreliable(candidate)) return candidate;
  }

  return V33_FALLBACK_MP4_URL;
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const videoUrl = useMemo(() => resolveVideoUrl(video), [video]);

  if (!video) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 ${className ?? ""}`}
      >
        <div className="text-center text-sm text-slate-500">
          <Video className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p>Video k této lekci zatím není k dispozici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        <video
          controls
          playsInline
          preload="auto"
          poster={(video.metadata as VideoMeta)?.thumbnail_url}
          title={lessonTitle}
          style={{ width: "100%", height: "auto" }}
        >
          <source src={videoUrl} type="video/mp4" />
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>
      {video.duration_seconds > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          {Math.max(1, Math.round(video.duration_seconds / 60))} min
        </p>
      ) : null}
    </div>
  );
}
