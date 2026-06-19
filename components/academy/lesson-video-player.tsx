"use client";

import { useCallback, useMemo, useState } from "react";
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

function isReliableUrl(url: string | undefined): url is string {
  return Boolean(url && !url.includes(GTV_HOST));
}

function buildUrlChain(video: VideoAsset | null | undefined, meta: VideoMeta): string[] {
  const chain: string[] = [];
  const add = (raw: string | undefined) => {
    if (!isReliableUrl(raw) || chain.includes(raw)) return;
    chain.push(raw);
  };

  add(meta.public_url);
  add(meta.mp4_url);

  if (Array.isArray(meta.url_chain)) {
    for (const raw of meta.url_chain) add(raw);
  }

  add(meta.hls_url);

  const proxied: string[] = [];
  for (const raw of chain) {
    if (raw.startsWith("http") && !raw.includes("/api/video/stream")) {
      proxied.push(`/api/video/stream?url=${encodeURIComponent(raw)}`);
    }
  }
  for (const p of proxied) {
    if (!chain.includes(p)) chain.push(p);
  }

  if (!chain.includes(V33_FALLBACK_MP4_URL)) {
    chain.push(V33_FALLBACK_MP4_URL);
  }

  return chain.length ? chain : [V33_FALLBACK_MP4_URL];
}

export function LessonVideoPlayer({ video, lessonTitle, className }: Props) {
  const meta = (video?.metadata ?? {}) as VideoMeta;
  const urls = useMemo(() => buildUrlChain(video, meta), [video, meta]);
  const [urlIndex, setUrlIndex] = useState(0);
  const videoUrl = urls[urlIndex] ?? V33_FALLBACK_MP4_URL;
  const usingFallback = !video || urlIndex >= urls.length - 1;

  const handleVideoError = useCallback(() => {
    setUrlIndex((prev) => (prev < urls.length - 1 ? prev + 1 : prev));
  }, [urls.length]);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        <video
          key={videoUrl}
          controls
          playsInline
          preload="auto"
          poster={meta.thumbnail_url}
          title={lessonTitle}
          style={{ width: "100%", height: "auto" }}
          onError={handleVideoError}
        >
          <source src={videoUrl} type="video/mp4" />
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>
      {usingFallback ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
          <Video className="h-3.5 w-3.5" />
          Záložní video — přehrává se spolehlivý MP4 (w3schools)
        </p>
      ) : video && video.duration_seconds > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          {Math.max(1, Math.round(video.duration_seconds / 60))} min
        </p>
      ) : null}
    </div>
  );
}
