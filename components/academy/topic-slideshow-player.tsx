"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts/speak";
import type { ContentSlideshowManifest } from "@/lib/v25/video/content-slideshow";

type Props = {
  manifest: ContentSlideshowManifest;
  lessonTitle: string;
  className?: string;
};

export function TopicSlideshowPlayer({ manifest, lessonTitle, className }: Props) {
  const slides = manifest.slides;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slide = slides[index];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => (i < slides.length - 1 ? i + 1 : i));
  }, [slides.length]);

  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }
    clearTimer();
    timerRef.current = setTimeout(advance, (slide?.durationSeconds ?? 10) * 1000);
    return clearTimer;
  }, [playing, index, slide?.durationSeconds, advance, clearTimer]);

  useEffect(() => () => {
    clearTimer();
    stopSpeaking();
  }, [clearTimer]);

  async function toggleSpeech() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = slide ? `${slide.title}. ${slide.body}` : manifest.voiceoverText;
    setSpeaking(true);
    try {
      await speak(text.slice(0, 4096), "cs-CZ");
    } catch {
      /* ignore */
    } finally {
      setSpeaking(false);
    }
  }

  if (!slide) return null;

  return (
    <div className={className} role="region" aria-label={`Prezentace lekce: ${lessonTitle}`}>
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#021d33] via-[#003d66] to-[#005B96] shadow-lg"
        aria-roledescription="slideshow"
      >
        <div className="flex min-h-[280px] flex-col justify-between p-6 text-white sm:min-h-[320px] sm:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7CC4FF]">
              Prezentace k tématu lekce
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{slide.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-100 sm:text-base">{slide.body}</p>
          </div>
          <div className="mt-6 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-300">
              {index + 1} / {slides.length} · {manifest.topic || lessonTitle}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Předchozí slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pozastavit" : "Přehrát slideshow"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
                disabled={index >= slides.length - 1}
                aria-label="Další slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={() => void toggleSpeech()}
                aria-label="Přečíst slide"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-black/20 px-4 py-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-1.5 flex-1 rounded-full transition ${i === index ? "bg-[#7CC4FF]" : "bg-white/25"}`}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Slideshow odpovídá tématu: {lessonTitle} (shoda {Math.round((manifest.alignmentScore ?? 0.8) * 100)} %)
      </p>
    </div>
  );
}
