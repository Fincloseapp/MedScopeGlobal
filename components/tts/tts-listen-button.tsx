"use client";

import { useState } from "react";
import { Headphones, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePicker } from "@/components/tts/voice-picker";
import { speakFullText, stopSpeaking } from "@/lib/tts/speak";

type Props = {
  text: string;
  label?: string;
  className?: string;
  /** When true, read full content in chunks (no char limit). */
  full?: boolean;
};

export function TtsListenButton({ text, label = "Poslech", className, full = true }: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snippet = text.trim();
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
      if (full) {
        await speakFullText(snippet);
      } else {
        const { speak } = await import("@/lib/tts/speak");
        await speak(snippet.slice(0, 4096));
      }
      setPlaying(false);
    } catch {
      setError("Poslech se nepodařilo spustit — zkuste jiný hlas v prohlížeči");
      setPlaying(false);
    } finally {
      setLoading(false);
    }
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
      <VoicePicker compact />
      {error ? <p className="w-full text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
