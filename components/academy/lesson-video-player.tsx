"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Headphones, Loader2, Maximize2, RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  avatar_type?: string;
  lesson_format?: string;
  tts_audio_url?: string;
  slideshow_manifest_url?: string;
  voiceover_text?: string;
  video_mode?: string;

const GTV_HOST = "storage.googleapis.com/gtv-videos-bucket";

function resolveMeta(video: VideoAsset | null | undefined): VideoMeta {
  return (video?.metadata ?? {}) as VideoMeta;
}

function isUnreliableVideoUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes(GTV_HOST);
}

/** Build playback URL chain: reliable sources first, w3schools fallback last */
function toStreamProxy(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  if (rawUrl.startsWith("/api/video/stream")) return rawUrl;
  if (rawUrl.startsWith("/")) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.origin === (typeof window !== "undefined" ? window.location.origin : "")) {
      return rawUrl;
    }
    return `/api/video/stream?url=${encodeURIComponent(rawUrl)}`;
  } catch {
    return rawUrl;
  }
}

function buildVideoUrlChain(meta: VideoMeta): string[] {
  if (meta.lesson_format === "audio_lesson") return [];
  if (Array.isArray(meta.url_chain) && meta.url_chain.length) {
    const chain = meta.url_chain.filter(Boolean).map(toStreamProxy);
    if (chain.length && !chain.some((u) => u.includes("mov_bbb.mp4"))) {
      chain.push(toStreamProxy(V33_FALLBACK_MP4_URL));
    }
    return chain.slice(0, 5);
  }
  const chain: string[] = [];
  const push = (u: string | null | undefined) => {
    if (!u) return;
    const proxied = toStreamProxy(u);
    if (!chain.includes(proxied)) chain.push(proxied);
  };
  push(meta.mp4_url);
  push(meta.public_url);
  push(meta.hls_url);
  if (!chain.length || chain.every((u) => isUnreliableVideoUrl(u.replace(/^\/api\/video\/stream\?url=/, "")))) {
    return [toStreamProxy(V33_FALLBACK_MP4_URL)];
  }
  const reliable = chain.filter((u) => {
    const raw = u.startsWith("/api/video/stream?url=")
      ? decodeURIComponent(u.split("url=")[1] ?? "")
      : u;
    return !isUnreliableVideoUrl(raw);
  });
  if (!reliable.length) return [toStreamProxy(V33_FALLBACK_MP4_URL), ...chain];
  if (!reliable.some((u) => u.includes("mov_bbb.mp4"))) {
    reliable.push(toStreamProxy(V33_FALLBACK_MP4_URL));
  }
  return reliable.slice(0, 5);
}

function resolveAudioUrl(meta: VideoMeta): string | null {
  return meta.tts_audio_url ?? (meta.lesson_format === "audio_lesson" ? meta.public_url ?? null : null);
}

function resolveThumbnail(meta: VideoMeta): string | null {
  return meta.avatar_image_url ?? meta.thumbnail_url ?? null;
}

function LessonTags({
  video,
  meta,
}: {
  video: VideoAsset;
  meta: VideoMeta;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      {video.duration_seconds > 0 ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">
          {Math.max(1, Math.round(video.duration_seconds / 60))} min
        </span>
      ) : null}
      {meta.generated || meta.public_url ? (
        <span className="rounded-full bg-[#e8f4fc] px-2 py-0.5 font-medium text-[#005B96]">AI video</span>
      ) : null}
      {meta.avatar_type || meta.tts_audio_url ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">AI lektor</span>
      ) : null}
    </div>
  );
}

function AudioLessonView({
  lessonTitle,
  audioUrl,
  thumbnail,
  video,
  meta,
  videoFailed,
  className,
}: {
  lessonTitle: string;
  audioUrl: string;
  thumbnail: string | null;
  video: VideoAsset;
  meta: VideoMeta;
  videoFailed: boolean;
  className?: string;
}) {
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
              src={audioUrl}
              controls
              playsInline
              preload="metadata"
              className="mt-4 w-full max-w-md"
              title={lessonTitle}
            >
              Váš prohlížeč nepodporuje přehrávání audia.
            </audio>
          </div>
        </div>
      </div>
      <LessonTags video={video} meta={meta} />
    </div>
  );
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [urlIndex, setUrlIndex] = useState(0);
  const [forceAudio, setForceAudio] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const meta = resolveMeta(video);
  const isAudioLesson = meta.lesson_format === "audio_lesson" || Boolean(meta.tts_audio_url);
  const audioUrl = resolveAudioUrl(meta);
  const urlChain = buildVideoUrlChain(meta);
  const url = urlChain[urlIndex] ?? urlChain[0] ?? null;
  const thumbnail = resolveThumbnail(meta);

  const handleRetry = useCallback(() => {
    setVideoFailed(false);
    setErrorMsg(null);
    setLoading(true);
    setBuffering(false);
    setForceAudio(false);
    setUrlIndex(0);
    setRetryKey((k) => k + 1);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    setVideoFailed(false);
    setErrorMsg(null);
    setLoading(Boolean(url));
    setForceAudio(false);
    setUrlIndex(0);
  }, [urlChain.join("|"), lessonTitle]);

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

  const showAudio = forceAudio || (isAudioLesson && audioUrl) || (videoFailed && audioUrl);

  if (showAudio && audioUrl) {
    return (
      <AudioLessonView
        lessonTitle={lessonTitle}
        audioUrl={audioUrl}
        thumbnail={thumbnail}
        video={video}
        meta={meta}
        videoFailed={videoFailed || forceAudio}
        className={className}
      />
    );
  }

  if (!url) {
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
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg"
      >
        {loading || buffering ? (
          <div className="absolute inset-0 z-10 flex aspect-video items-center justify-center bg-slate-900/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" aria-label="Načítání videa" />
              {buffering && !loading ? (
                <span className="text-xs text-white/60">Buffering…</span>
              ) : null}
            </div>
          </div>
        ) : null}
        {errorMsg ? (
          <div className="absolute inset-0 z-20 flex aspect-video flex-col items-center justify-center gap-3 bg-slate-900/95 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <p className="max-w-sm text-sm text-white/90">{errorMsg}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-lg"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Zkusit znovu
              </Button>
              {audioUrl ? (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-lg bg-[#005B96] hover:bg-[#004a7a]"
                  onClick={() => {
                    setForceAudio(true);
                    setErrorMsg(null);
                  }}
                >
                  <Headphones className="mr-1.5 h-3.5 w-3.5" />
                  Přehrát audio verzi
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <video
          key={`${url}-${urlIndex}-${retryKey}`}
          ref={videoRef}
          src={url}
          controls
          playsInline
          preload="metadata"
          poster={thumbnail ?? undefined}
          className="aspect-video w-full bg-black"
          title={lessonTitle}
          onLoadStart={() => {
            setLoading(true);
            setBuffering(false);
            setErrorMsg(null);
          }}
          onLoadedMetadata={() => setLoading(false)}
          onCanPlay={() => {
            setLoading(false);
            setBuffering(false);
          }}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onError={() => {
            setLoading(false);
            setBuffering(false);
            if (urlIndex < urlChain.length - 1) {
              setUrlIndex((i) => i + 1);
              setLoading(true);
              setErrorMsg(null);
              return;
            }
            if (audioUrl) {
              setVideoFailed(true);
              return;
            }
            setErrorMsg("Video se nepodařilo načíst. Zkuste obnovit stránku nebo použijte audio verzi.");
          }}
        >
          {!url.includes(".m3u8") ? <source src={url} type="video/mp4" /> : null}
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/60 p-2 text-white/90 transition hover:bg-black/80 md:hidden"
          aria-label="Celá obrazovka"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <LessonTags video={video} meta={meta} />
    </div>
  );
}
