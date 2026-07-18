"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  lessonId: string;
  poster?: string | null;
  title?: string;
  onUnlocked?: () => void;
  className?: string;
};

/**
 * CME video player with lock-forward seeking.
 * Physicians may rewind / rewatch, but cannot skip ahead past max watched.
 * Quiz unlocks only after ~95% completion (server-validated).
 */
export function LockedVideoPlayer({
  src,
  lessonId,
  poster,
  title,
  onUnlocked,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maxWatchedRef = useRef(0);
  const lastSyncRef = useRef(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncProgress = useCallback(
    async (currentTime: number, dur: number, forceComplete = false) => {
      const now = Date.now();
      if (!forceComplete && now - lastSyncRef.current < 4000) return;
      lastSyncRef.current = now;

      try {
        const res = await fetch("/api/academy/b2b/watch-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            current_time: currentTime,
            duration: dur,
            completed: forceComplete || (dur > 0 && currentTime >= dur * 0.95),
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          completed?: boolean;
          max_watched_seconds?: number;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setSyncError(data.error ?? "Nepodařilo se uložit postup");
          return;
        }
        setSyncError(null);
        if (typeof data.max_watched_seconds === "number") {
          maxWatchedRef.current = Math.max(
            maxWatchedRef.current,
            data.max_watched_seconds
          );
          setMaxWatched(maxWatchedRef.current);
        }
        if (data.completed) {
          setCompleted(true);
          onUnlocked?.();
        }
      } catch {
        setSyncError("Síťová chyba při ukládání postupu");
      }
    },
    [lessonId, onUnlocked]
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onLoaded = () => {
      setDuration(el.duration || 0);
    };

    const onTimeUpdate = () => {
      const t = el.currentTime;
      if (t > maxWatchedRef.current + 0.35) {
        // Allow tiny drift; clamp seeks forward
        if (t > maxWatchedRef.current + 1.25) {
          el.currentTime = maxWatchedRef.current;
          return;
        }
      }
      if (t > maxWatchedRef.current) {
        maxWatchedRef.current = t;
        setMaxWatched(t);
      }
      void syncProgress(maxWatchedRef.current, el.duration || 0);
    };

    const onSeeking = () => {
      if (el.currentTime > maxWatchedRef.current + 0.5) {
        el.currentTime = maxWatchedRef.current;
      }
    };

    const onEnded = () => {
      maxWatchedRef.current = el.duration || maxWatchedRef.current;
      setMaxWatched(maxWatchedRef.current);
      void syncProgress(maxWatchedRef.current, el.duration || 0, true);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("seeking", onSeeking);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("seeking", onSeeking);
      el.removeEventListener("ended", onEnded);
    };
  }, [syncProgress]);

  const pct =
    duration > 0 ? Math.min(100, Math.round((maxWatched / duration) * 100)) : 0;

  return (
    <div className={className}>
      <div className="overflow-hidden bg-[#021d33]">
        <video
          ref={videoRef}
          src={src}
          poster={poster ?? undefined}
          controls
          controlsList="nodownload"
          playsInline
          className="aspect-video w-full"
          aria-label={title ?? "Povinné vzdělávací video"}
        >
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <p>
          Povinné video · přetáčení vpřed je vypnuto
          {duration > 0 ? ` · zhlédnuto ${pct}%` : null}
        </p>
        {completed ? (
          <p className="font-medium text-[#005B96]">Kvíz odemčen</p>
        ) : (
          <p className="text-slate-500">Dokončete video pro odemčení kvízu</p>
        )}
      </div>
      {syncError ? <p className="mt-1 text-xs text-red-600">{syncError}</p> : null}
    </div>
  );
}
