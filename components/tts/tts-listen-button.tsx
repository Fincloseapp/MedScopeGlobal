"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePicker } from "@/components/tts/voice-picker";
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

  useEffect(() => {
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
      setError("Poslech se nepodařilo spustit — zkuste jiný hlas v prohlížeči");
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "editorial") {
    return (
      <div
        className={`rounded-2xl border border-[#d7e6f4] bg-gradient-to-r from-[#f4f8fc] to-white px-4 py-3.5 sm:px-5 ${className ?? ""}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handlePlay()}
            disabled={loading}
            aria-label={playing ? "Zastavit poslech" : label}
            className="inline-flex items-center gap-2 rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a7a] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : playing ? (
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
            {playing ? "Zastavit" : label}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#021d33]">
              {playing ? "Přehrává se poslechová verze" : "Poslechová verze článku"}
            </p>
            <p className="text-xs text-slate-500">≈ {minutes} min · čeština · hlas prohlížeče</p>
          </div>
          <VoicePicker compact lang={speechLang} />
        </div>
        {error ? <p className="mt-2 text-xs text-amber-700">{error}</p> : null}
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
        aria-label={playing ? "Zastavit poslech" : label}
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
      <VoicePicker compact lang={speechLang} />
      {error ? <p className="w-full text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
