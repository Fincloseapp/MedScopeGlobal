"use client";

import { useEffect, useMemo, useState } from "react";
import { Video } from "lucide-react";
import {
  VideoLegalNotice,
  buildCaptionsVttUrl,
  detectVideoSource,
  extractCaptionSource,
} from "@/components/academy/video-legal-notice";
import { TopicSlideshowPlayer } from "@/components/academy/topic-slideshow-player";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import {
  buildSlideshowFromLessonContent,
  extractSlideshowManifest,
  isPlaceholderVideoUrl,
  type ContentSlideshowManifest,
} from "@/lib/v25/video/content-slideshow";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  lessonContent?: string;
  courseTopic?: string;
  contentJson?: Record<string, unknown> | null;
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

function isPlayableUrl(url: string | undefined): url is string {
  return Boolean(url && url.startsWith("http") && !url.includes(GTV_HOST));
}

function resolveVideoUrl(video: VideoAsset | null | undefined): string {
  const meta = (video?.metadata ?? {}) as VideoMeta;
  const candidates = [
    meta.public_url,
    meta.mp4_url,
    ...(Array.isArray(meta.url_chain) ? meta.url_chain : []),
    meta.hls_url,
  ];

  for (const raw of candidates) {
    if (isPlayableUrl(raw)) return raw;
  }

  return V33_FALLBACK_MP4_URL;
}

function storedSlidesMatchContent(
  stored: ContentSlideshowManifest | null,
  lessonContent: string
): boolean {
  if (!stored?.slides?.length || !lessonContent.trim()) return false;
  const contentWords = lessonContent.split(/\s+/).filter(Boolean).length;
  const slideWords = stored.slides
    .map((s) => `${s.title} ${s.body}`)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  // Stale outline slides are much shorter than a deepened lesson body.
  if (contentWords >= 180 && slideWords < Math.min(120, contentWords * 0.2)) return false;
  const hay = stored.slides.map((s) => s.body.toLowerCase()).join(" ");
  const probes = lessonContent
    .toLowerCase()
    .replace(/[#*]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 12);
  if (!probes.length) return true;
  const hits = probes.filter((w) => hay.includes(w)).length;
  return hits / probes.length >= 0.25;
}

export function LessonVideoPlayer({
  video,
  lessonTitle,
  lessonContent = "",
  courseTopic,
  contentJson,
  className,
}: Props) {
  const meta = (video?.metadata ?? {}) as VideoMeta & {
    lesson_format?: string;
    tts_audio_url?: string;
    avatar_image_url?: string;
  };
  const isAudioLesson = meta.lesson_format === "audio_lesson";
  const audioUrl = meta.tts_audio_url ?? (isAudioLesson ? meta.public_url : undefined);
  const videoUrl = resolveVideoUrl(video);
  const isPlaceholder = isPlaceholderVideoUrl(videoUrl);
  const storedManifest = useMemo(
    () => extractSlideshowManifest(contentJson, video?.metadata ?? null),
    [contentJson, video?.metadata]
  );
  const contentManifest = useMemo(
    () =>
      lessonContent.trim()
        ? buildSlideshowFromLessonContent(lessonTitle, lessonContent, courseTopic)
        : null,
    [lessonTitle, lessonContent, courseTopic]
  );
  const manifest: ContentSlideshowManifest | null = useMemo(() => {
    if (!isPlaceholder) return storedManifest ?? contentManifest;
    // Placeholder / demo video: lesson text is the source of truth for slides.
    if (contentManifest && !storedSlidesMatchContent(storedManifest, lessonContent)) {
      return contentManifest;
    }
    return storedManifest ?? contentManifest;
  }, [isPlaceholder, storedManifest, contentManifest, lessonContent]);

  const usingFallback = isPlaceholder;
  const source = detectVideoSource(videoUrl, usingFallback);
  const { vttUrl: remoteVtt, subtitles } = extractCaptionSource(
    (video?.metadata ?? {}) as Record<string, unknown>
  );
  const [generatedVtt, setGeneratedVtt] = useState<string | null>(null);

  useEffect(() => {
    if (remoteVtt || !subtitles?.length) {
      setGeneratedVtt(null);
      return;
    }
    const blobUrl = buildCaptionsVttUrl(subtitles);
    setGeneratedVtt(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [remoteVtt, subtitles]);

  const captionsSrc = remoteVtt ?? generatedVtt;
  const showSlideshow = !isAudioLesson && isPlaceholder && Boolean(manifest?.slides?.length);

  if (isAudioLesson && audioUrl) {
    return (
      <VideoLegalNotice
        className={className}
        lessonTitle={lessonTitle}
        variant="academy"
        sourceKind="supabase"
        sourceLabel="Český AI lektor (Edge TTS)"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg">
          {meta.avatar_image_url || meta.thumbnail_url ? (
            <img
              src={meta.avatar_image_url ?? meta.thumbnail_url}
              alt=""
              className="mx-auto mb-4 h-32 w-32 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : null}
          <audio
            controls
            preload="auto"
            src={audioUrl}
            className="w-full"
            aria-label={`Audio lekce: ${lessonTitle}`}
          />
        </div>
      </VideoLegalNotice>
    );
  }

  if (showSlideshow && manifest) {
    return (
      <VideoLegalNotice
        className={className}
        lessonTitle={lessonTitle}
        variant="academy"
        sourceKind="fallback_w3schools"
        sourceLabel="Slideshow z textu lekce"
      >
        <TopicSlideshowPlayer
          manifest={manifest}
          lessonTitle={lessonTitle}
          lang="cs-CZ"
        />
      </VideoLegalNotice>
    );
  }

  return (
    <VideoLegalNotice
      className={className}
      lessonTitle={lessonTitle}
      variant="academy"
      sourceKind={source.kind}
      sourceLabel={source.label}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        <video
          controls
          playsInline
          preload="auto"
          poster={meta.thumbnail_url}
          title={lessonTitle}
          aria-label={`Přehrávač videa: ${lessonTitle}`}
          src={videoUrl}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <source src={videoUrl} type="video/mp4" />
          {captionsSrc ? (
            <track kind="captions" src={captionsSrc} srcLang="cs" label="České titulky" default />
          ) : null}
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>
      {usingFallback ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
          <Video className="h-3.5 w-3.5" aria-hidden />
          Demo video — slideshow odpovídá tématu lekce
        </p>
      ) : video && video.duration_seconds > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          {Math.max(1, Math.round(video.duration_seconds / 60))} min
        </p>
      ) : null}
    </VideoLegalNotice>
  );
}
