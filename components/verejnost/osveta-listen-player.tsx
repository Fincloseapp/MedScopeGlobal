"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  title: string;
  byline: string;
  mediaUrl: string;
  coverUrl: string;
  durationSeconds: number;
  onTimeUpdate?: (current: number, duration: number) => void;
  onEnded?: () => void;
  mediaRef?: React.RefObject<HTMLAudioElement | null>;
};

/** Podcast-style audio lesson player for veřejnost osvěta. */
export function OsvetaListenPlayer({
  title,
  byline,
  mediaUrl,
  coverUrl,
  durationSeconds,
  onTimeUpdate,
  onEnded,
  mediaRef: externalRef,
}: Props) {
  const internalRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalRef ?? internalRef;
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const sync = () => {
      setCurrent(el.currentTime);
      setDuration(el.duration || durationSeconds || 0);
      onTimeUpdate?.(el.currentTime, el.duration || durationSeconds || 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta = () => setDuration(el.duration || durationSeconds || 0);
    const ended = () => {
      setPlaying(false);
      onEnded?.();
    };

    el.addEventListener("timeupdate", sync);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", ended);
    return () => {
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", ended);
    };
  }, [audioRef, durationSeconds, onEnded, onTimeUpdate]);

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const seek = (ratio: number) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#cfe1f3] bg-[#021d33] shadow-[0_18px_40px_-28px_rgba(2,29,51,0.65)]">
      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, #7CC4FF 0%, transparent 42%), radial-gradient(circle at 82% 78%, #005B96 0%, transparent 45%)",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/25 sm:mx-0 sm:h-32 sm:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/50 to-transparent" />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9fd0f5]">
              <Headphones className="h-3.5 w-3.5" aria-hidden />
              Poslechová lekce
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-white/70">{byline}</p>
            <p className="mt-1 text-xs text-white/50">
              {formatTime(duration || durationSeconds)} · čeština · MedScope Osvěta
            </p>

            <audio
              ref={audioRef as React.RefObject<HTMLAudioElement>}
              src={mediaUrl}
              preload="auto"
              playsInline
              className="sr-only"
              aria-label={`Audio lekce: ${title}`}
            />

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#021d33] shadow-md transition hover:bg-[#e8f4fc]"
                aria-label={playing ? "Pozastavit" : "Přehrát"}
              >
                {playing ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="group relative flex h-2 w-full items-center rounded-full bg-white/15"
                  aria-label="Posunout přehrávání"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    seek(ratio);
                  }}
                >
                  <span
                    className="absolute left-0 top-0 h-full rounded-full bg-[#7CC4FF] transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow opacity-0 transition group-hover:opacity-100"
                    style={{ left: `calc(${progress}% - 7px)` }}
                  />
                </button>
                <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-white/55">
                  <span>{formatTime(current)}</span>
                  <span>{formatTime(duration || durationSeconds)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
