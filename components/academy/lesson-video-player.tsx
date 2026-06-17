"use client";

import { useRef, useState } from "react";
import { AlertCircle, Headphones, Video } from "lucide-react";
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
  const [videoFailed, setVideoFailed] = useState(false);

  const meta = resolveMeta(video);
  const isAudioLesson = meta.lesson_format === "audio_lesson" || Boolean(meta.tts_audio_url);
  const audioUrl = resolveAudioUrl(meta);
  const url = resolveVideoUrl(meta);
  const thumbnail = resolveThumbnail(meta);
  const showAudio = (isAudioLesson && audioUrl) || (videoFailed && audioUrl);

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

  if (showAudio && audioUrl) {
    return (
      <div className={className}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#021d33] to-[#005B96] shadow-lg">
          {videoFailed ? (
            <div className="flex items-center gap-2 border-b border-white/10 bg-amber-500/20 px-4 py-2 text-xs text-amber-100">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Video se nepodařilo načíst — přehráváme audio lekci s AI lektorem.</span>
            </div>
          ) : null}
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
        <video
          ref={videoRef}
          src={url!}
          controls
          playsInline
          preload="metadata"
          poster={thumbnail ?? undefined}
          className="aspect-video w-full"
          title={lessonTitle}
          onError={() => {
            if (audioUrl) {
              setVideoFailed(true);
            }
          }}
        >
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
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
