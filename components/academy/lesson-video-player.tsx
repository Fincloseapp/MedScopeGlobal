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

function buildInlineSlideshow(
  lessonTitle: string,
  lessonContent: string,
  courseTopic?: string
): ContentSlideshowManifest {
  const paragraphs = lessonContent
    .replace(/[#*]/g, "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15)
    .slice(0, 5);

  const slides =
    paragraphs.length > 0
      ? paragraphs.map((body, i) => ({
          title: i === 0 ? lessonTitle : `${lessonTitle} — ${i + 1}`,
          body: body.slice(0, 280),
          imageDescription: courseTopic ?? lessonTitle,
          durationSeconds: 10,
        }))
      : [
          {
            title: lessonTitle,
            body: `Lekce v kurzu ${courseTopic ?? "MedScope Academy"}: ${lessonTitle}.`,
            imageDescription: lessonTitle,
            durationSeconds: 10,
          },
        ];

  return {
    title: lessonTitle,
    topic: courseTopic ?? lessonTitle,
    script: slides.map((s) => s.body).join(" "),
    voiceoverText: slides.map((s) => s.body).join(" "),
    slides,
    alignmentScore: 0.75,
    ttsMode: "web_speech_api",
    generatedAt: new Date().toISOString(),
    provider: "static",
  };
}

export function LessonVideoPlayer({
  video,
  lessonTitle,
  lessonContent = "",
  courseTopic,
  contentJson,
  className,
}: Props) {
  const meta = (video?.metadata ?? {}) as VideoMeta;
  const videoUrl = resolveVideoUrl(video);
  const isPlaceholder = isPlaceholderVideoUrl(videoUrl);
  const storedManifest = useMemo(
    () => extractSlideshowManifest(contentJson, video?.metadata ?? null),
    [contentJson, video?.metadata]
  );
  const [manifest, setManifest] = useState<ContentSlideshowManifest | null>(storedManifest);

  useEffect(() => {
    setManifest(storedManifest);
  }, [storedManifest]);

  useEffect(() => {
    if (!isPlaceholder || manifest?.slides?.length || !lessonContent.trim()) return;
    setManifest(buildInlineSlideshow(lessonTitle, lessonContent, courseTopic));
  }, [isPlaceholder, manifest, lessonTitle, lessonContent, courseTopic]);

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
  const showSlideshow = isPlaceholder && Boolean(manifest?.slides?.length);

  if (showSlideshow && manifest) {
    return (
      <VideoLegalNotice
        className={className}
        lessonTitle={lessonTitle}
        variant="academy"
        sourceKind="fallback_w3schools"
        sourceLabel="Slideshow z obsahu lekce (demo)"
      >
        <TopicSlideshowPlayer manifest={manifest} lessonTitle={lessonTitle} />
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
