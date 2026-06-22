"use client";

import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { StoredNudge } from "@/lib/v38/conversion-engine";

const PREVIEW_SEC = 45;
const DISMISS_KEY = "medscope-v38-video-gate-dismissed";

type Props = {
  copy: StoredNudge;
  children: ReactNode;
  /** When true, show soft gate after preview (non-VIP academy/osveta) */
  enabled?: boolean;
  lessonIndex?: number;
};

/** v38 — soft video paywall hint with preview window */
export function VideoConversionOverlay({
  copy,
  children,
  enabled = true,
  lessonIndex = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gated, setGated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const onTimeUpdate = useCallback(
    (e: Event) => {
      if (!enabled || dismissed || gated) return;
      const el = e.target as HTMLMediaElement;
      if (!el.duration) return;
      const threshold = lessonIndex > 0 ? PREVIEW_SEC * 0.6 : PREVIEW_SEC;
      if (el.currentTime >= threshold) {
        el.pause();
        setGated(true);
      }
    },
    [enabled, dismissed, gated, lessonIndex]
  );

  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;
    const media = root.querySelector("video, audio");
    if (!media) return;
    media.addEventListener("timeupdate", onTimeUpdate);
    return () => media.removeEventListener("timeupdate", onTimeUpdate);
  }, [enabled, onTimeUpdate]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setGated(false);
    const media = containerRef.current?.querySelector("video, audio") as HTMLMediaElement | null;
    media?.play().catch(() => {});
  };

  return (
    <div ref={containerRef} className="relative">
      {children}
      {enabled && gated && !dismissed ? (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-slate-950/85 px-6 text-center backdrop-blur-sm"
          role="dialog"
          aria-label="Nabídka předplatného pro video"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7CC4FF]">
            {copy.eyebrow}
          </p>
          <p className="mt-2 font-display text-lg font-semibold text-white">{copy.headline}</p>
          <p className="mt-2 max-w-sm text-sm text-slate-300">{copy.body}</p>
          {copy.hint ? <p className="mt-2 text-xs text-slate-400">{copy.hint}</p> : null}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[#005B96] hover:bg-[#004a7a]">
              <Link href={copy.ctaHref}>{copy.ctaLabel}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              onClick={dismiss}
            >
              <Play className="mr-2 h-4 w-4" />
              Pokračovat v náhledu
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
