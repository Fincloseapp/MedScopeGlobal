"use client";

import { useRef, useState } from "react";
import { Headphones, Play, Video } from "lucide-react";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  className?: string;
};

type VideoMeta = {
  public_url?: string;
  thumbnail_url?: string;
  generated?: boolean;
  avatar_type?: string;
  lesson_format?: string;
  tts_audio_url?: string;
  avatar_image_url?: string;
};

function resolveMeta(video: VideoAsset | null | undefined): VideoMeta {
  return (video?.metadata ?? {}) as VideoMeta;
}

function resolveVideoUrl(meta: VideoMeta): string | null {
  if (meta.lesson_format === "audio_lesson") return null;
  return meta.public_url ?? null;
}

function resolveAudioUrl(meta: VideoMeta): string | null {
  return meta.tts_audio_url ?? (meta.lesson_format === "audio_lesson" ? meta.public_url ?? null : null);
}

function resolveThumbnail(meta: VideoMeta): string | null {
  return meta.avatar_image_url ?? meta.thumbnail_url ?? null;
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const meta = resolveMeta(video);
  const isAudioLesson = meta.lesson_format === "audio_lesson" || Boolean(meta.tts_audio_url);
  const audioUrl = resolveAudioUrl(meta);
  const url = resolveVideoUrl(meta);
  const thumbnail = resolveThumbnail(meta);

  if (!video || (!url && !audioUrl)) {
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

  if (isAudioLesson && audioUrl) {
    return (
      <div className={className}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#021d33] to-[#005B96] shadow-lg">
          <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:p-8">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={`AI lektor: ${lessonTitle}`}
                className="h-32 w-32 shrink-0 rounded-full border-4 border-white/20 object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10">
                <Headphones className="h-12 w-12 text-white/80" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-sm font-medium text-white/80">AI lektor — audio lekce</p>
              <p className="mt-1 text-lg font-semibold text-white">{lessonTitle}</p>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                preload="metadata"
                className="mt-4 w-full max-w-md"
                title={lessonTitle}
              >
                Váš prohlížeč nepodporuje přehrávání audia.
              </audio>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {video.duration_seconds > 0 ? <span>{Math.round(video.duration_seconds / 60)} min</span> : null}
          <span className="rounded-full bg-[#e8f4fc] px-2 py-0.5 font-medium text-[#005B96]">AI audio lekce</span>
          {meta.avatar_type ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">AI lektor</span>
          ) : null}
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
            src={url!}
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
