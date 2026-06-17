"use client";

import { useRef, useState } from "react";
import { Play, Video } from "lucide-react";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  className?: string;
};

function resolveVideoUrl(video: VideoAsset | null | undefined): string | null {
  if (!video) return null;
  const meta = (video.metadata ?? {}) as { public_url?: string };
  return meta.public_url ?? null;
}

function resolveThumbnail(video: VideoAsset | null | undefined): string | null {
  if (!video) return null;
  const meta = (video.metadata ?? {}) as { thumbnail_url?: string };
  return meta.thumbnail_url ?? null;
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const url = resolveVideoUrl(video);
  const thumbnail = resolveThumbnail(video);
  const meta = (video?.metadata ?? {}) as { generated?: boolean; avatar_type?: string };

  if (!video || !url) {
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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        {!playing && thumbnail ? (
          <button
            type="button"
            onClick={() => {
              setPlaying(true);
              setTimeout(() => videoRef.current?.play(), 50);
            }}
            className="group relative block w-full"
            aria-label={`Přehrát video: ${lessonTitle}`}
          >
            <img
              src={thumbnail}
              alt={`Náhled videa: ${lessonTitle}`}
              className="aspect-video w-full object-cover opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="ml-1 h-7 w-7 text-[#005B96]" fill="currentColor" />
              </span>
            </span>
          </button>
        ) : (
          <video
            ref={videoRef}
            src={url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
            title={lessonTitle}
          >
            Váš prohlížeč nepodporuje přehrávání videa.
          </video>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {video.duration_seconds > 0 ? <span>{Math.round(video.duration_seconds / 60)} min</span> : null}
        {meta.generated ? (
          <span className="rounded-full bg-[#e8f4fc] px-2 py-0.5 font-medium text-[#005B96]">AI video</span>
        ) : null}
        {meta.avatar_type ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5">AI lektor</span>
        ) : null}
      </div>
    </div>
  );
}
