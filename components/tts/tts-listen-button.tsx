"use client";

import { useState } from "react";
import { Headphones, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts/speak";

type Props = {
  text: string;
  label?: string;
  className?: string;
  maxChars?: number;
};

export function TtsListenButton({ text, label = "Poslechnout", className, maxChars = 4096 }: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snippet = text.trim().slice(0, maxChars);
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
      await speak(snippet);
      setPlaying(false);
    } catch {
      setError("Audio se nepodařilo načíst");
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-lg border-[#cfe1f3] text-[#005B96] hover:bg-[#e8f4fc]"
        onClick={() => void handlePlay()}
        disabled={loading}
        aria-label={playing ? "Zastavit přehrávání" : label}
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
      {error ? <p className="mt-1 text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
