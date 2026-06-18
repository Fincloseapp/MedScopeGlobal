"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoMetadata } from "@/lib/v34/video-engine/types";
import type { WatchEventType } from "@/lib/v34/video-engine/types";

type Props = {
  metadata: VideoMetadata;
  lessonTitle?: string;
  className?: string;
  onWatchEvent?: (event: WatchEventType, positionSec: number) => void;
};

function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8");
}

export function AcademyVideoPlayer({ metadata, lessonTitle, className, onWatchEvent }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const urls = metadata.url_chain.length ? metadata.url_chain : [metadata.mp4_url ?? metadata.hls_url ?? ""].filter(Boolean);
  const currentUrl = urls[urlIndex] ?? urls[0] ?? "";

  const emitWatch = useCallback(
    (event: WatchEventType) => {
      const pos = videoRef.current?.currentTime ?? 0;
      onWatchEvent?.(event, pos);
      if (metadata.id) {
        fetch(`/api/video/${metadata.id}/watch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            position_sec: pos,
            session_id: typeof window !== "undefined" ? getSessionId() : "",
          }),
        }).catch(() => {});
      }
    },
    [metadata.id, onWatchEvent]
  );

  useEffect(() => {
    setUrlIndex(0);
    setError(null);
    setLoading(true);
  }, [metadata.id, retryKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUrl) return;

    let cancelled = false;

    async function attach() {
      hlsRef.current?.destroy();
      hlsRef.current = null;

      if (isHlsUrl(currentUrl)) {
        try {
          const mod = await import("hls.js");
          const Hls = mod.default;
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(currentUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (!cancelled) setLoading(false);
            });
            hls.on(Hls.Events.ERROR, (_e, data) => {
              if (data.fatal && !cancelled) tryNextUrl();
            });
            return;
          }
        } catch {
          /* fall through to native / mp4 */
        }
      }

      video.src = currentUrl;
      video.load();
    }

    function tryNextUrl() {
      if (urlIndex < urls.length - 1) {
        setUrlIndex((i) => i + 1);
        setLoading(true);
        setError(null);
      } else {
        setLoading(false);
        setError("Video se nepodařilo načíst. Zkuste obnovit stránku.");
        emitWatch("error");
      }
    }

    attach();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [currentUrl, urlIndex, urls.length, retryKey, emitWatch]);

  const title = lessonTitle ?? metadata.title;

  if (!currentUrl) {
    return (
      <div className={`flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 ${className ?? ""}`}>
        <p className="text-sm text-slate-500">Video není k dispozici.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        {loading ? (
          <div className="absolute inset-0 z-10 flex aspect-video items-center justify-center bg-slate-900/80">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" aria-label="Načítání videa" />
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 z-20 flex aspect-video flex-col items-center justify-center gap-3 bg-slate-900/95 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <p className="max-w-sm text-sm text-white/90">{error}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setUrlIndex(0);
                setRetryKey((k) => k + 1);
                setError(null);
                setLoading(true);
              }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Zkusit znovu
            </Button>
          </div>
        ) : null}
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={metadata.thumbnail_url ?? undefined}
          className="aspect-video w-full bg-black"
          title={title}
          onPlay={() => {
            setLoading(false);
            emitWatch("play");
          }}
          onPause={() => emitWatch("pause")}
          onEnded={() => emitWatch("ended")}
          onSeeked={() => emitWatch("seek")}
          onLoadedMetadata={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onError={() => {
            if (urlIndex < urls.length - 1) {
              setUrlIndex((i) => i + 1);
              setLoading(true);
            } else {
              setLoading(false);
              setError("Video se nepodařilo načíst.");
              emitWatch("error");
            }
          }}
        >
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>
      {metadata.chapters.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {metadata.chapters.map((ch, i) => (
            <button
              key={i}
              type="button"
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-[#e8f4fc] hover:text-[#005B96]"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = ch.start_sec;
              }}
            >
              {ch.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getSessionId(): string {
  const key = "ms_video_session";
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}
