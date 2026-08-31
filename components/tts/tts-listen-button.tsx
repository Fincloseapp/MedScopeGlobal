"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakFullText, stopSpeaking } from "@/lib/tts/speak";
import { resolveSpeechLang } from "@/lib/tts/voice-picker";
import { initSessionVoice } from "@/lib/tts/voice-session";

type Props = {
  text: string;
  label?: string;
  className?: string;
  /** When true, read full content in chunks (no char limit). */
  full?: boolean;
  /** Legacy cap — when set, disables full chunked readout. */
  maxChars?: number;
  /** BCP-47 or metadata language */
  lang?: string | null;
  /** Visual treatment — editorial is magazine/podcast style */
  variant?: "default" | "editorial";
};

function ttsChrome(lang?: string | null) {
  const l = (lang ?? "cs").toLowerCase();
  if (l.startsWith("cs")) {
    return {
      stop: "Zastavit",
      playing: "Přehrává se poslechová verze",
      version: (m: number) => `Poslechová verze · ≈ ${m} min`,
      error: "Poslech se nepodařilo spustit — zkontrolujte hlas v prohlížeči",
    };
  }
  if (l.startsWith("de")) {
    return {
      stop: "Stopp",
      playing: "Hörfassung wird abgespielt",
      version: (m: number) => `Hörfassung · ≈ ${m} Min.`,
      error: "Wiedergabe fehlgeschlagen — prüfen Sie die Stimme im Browser",
    };
  }
  if (l.startsWith("fr")) {
    return {
      stop: "Arrêter",
      playing: "Lecture en cours",
      version: (m: number) => `Version audio · ≈ ${m} min`,
      error: "Lecture impossible — vérifiez la voix du navigateur",
    };
  }
  return {
    stop: "Stop",
    playing: "Playing audio version",
    version: (m: number) => `Audio version · ≈ ${m} min`,
    error: "Could not start playback — check the browser voice",
  };
}

function estimateListenMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 150));
}

export function TtsListenButton({
  text,
  label = "Poslech",
  className,
  full = true,
  maxChars,
  lang,
  variant = "default",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speechLang = resolveSpeechLang(lang);
  const chrome = ttsChrome(speechLang);

  useEffect(() => {
    // Lock to a single session voice — no multi-voice picker in UI.
    initSessionVoice();
  }, []);

  const snippet = maxChars ? text.trim().slice(0, maxChars) : text.trim();
  const readFull = full && !maxChars;
  const minutes = useMemo(() => estimateListenMinutes(snippet), [snippet]);
  if (!snippet) return null;

  async function handlePlay() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPlaying(true);
      if (readFull) {
        await speakFullText(snippet, { lang: speechLang });
      } else {
        const { speak } = await import("@/lib/tts/speak");
        await speak(snippet.slice(0, 4096), speechLang);
      }
      setPlaying(false);
    } catch {
      setError(chrome.error);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "editorial") {
    return (
      <div className={`article-audio-bar ${className ?? ""}`}>
        <button
          type="button"
          onClick={() => void handlePlay()}
          disabled={loading}
          aria-label={playing ? chrome.stop : label}
          className="inline-flex items-center gap-2 bg-[#005B96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004a7a] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : playing ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
          {playing ? chrome.stop : label}
        </button>
        <p className="text-sm text-slate-600">
          {playing ? chrome.playing : chrome.version(minutes)}
        </p>
        {error ? <p className="w-full text-xs text-amber-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-lg border-[#cfe1f3] text-[#005B96] hover:bg-[#e8f4fc]"
        onClick={() => void handlePlay()}
        disabled={loading}
          aria-label={playing ? chrome.stop : label}
      >
        {loading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : playing ? (
          <Square className="mr-1.5 h-3.5 w-3.5" />
        ) : (
          <Headphones className="mr-1.5 h-3.5 w-3.5" />
        )}
        {playing ? "Zastavit" : label}
      </Button>
      {error ? <p className="w-full text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
