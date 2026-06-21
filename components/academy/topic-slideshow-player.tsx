"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePicker } from "@/components/tts/voice-picker";
import { SLIDE_PAUSE_MS } from "@/lib/tts/naturalize-czech";
import { speakSlideText, stopSpeaking } from "@/lib/tts/speak";
import { resolveSpeechLang } from "@/lib/tts/voice-picker";
import { initSessionVoice } from "@/lib/tts/voice-session";
import {
  DEFAULT_SLIDE_IMAGE,
  SLIDE_IMAGE_FALLBACKS,
  sanitizeSlideImageUrl,
  type SlideImageInput,
} from "@/lib/v25/video/slide-images";
import type { ContentSlideshowManifest } from "@/lib/v25/video/content-slideshow";

type Props = {
  manifest: ContentSlideshowManifest;
  lessonTitle: string;
  className?: string;
  lang?: string | null;
};

function slideImageInput(
  slide: ContentSlideshowManifest["slides"][number] | undefined,
  topic: string,
  index: number
): SlideImageInput {
  return {
    title: slide?.title,
    body: slide?.body,
    imageDescription: slide?.imageDescription,
    imageKeywords: slide?.imageKeywords,
    topic,
    index,
  };
}

export function TopicSlideshowPlayer({ manifest, lessonTitle, className, lang }: Props) {
  const slides = manifest.slides;
  const speechLang = resolveSpeechLang(lang);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [imgSrc, setImgSrc] = useState(DEFAULT_SLIDE_IMAGE);
  const [fallbackIdx, setFallbackIdx] = useState(0);
  const playingRef = useRef(false);
  const indexRef = useRef(0);
  const slide = slides[index];

  const resolverInput = slideImageInput(slide, manifest.topic, index);
  const primaryUrl = sanitizeSlideImageUrl(slide?.imageUrl, resolverInput);

  useEffect(() => {
    setImgSrc(primaryUrl);
    setFallbackIdx(0);
  }, [primaryUrl, index]);

  useEffect(() => {
    initSessionVoice();
  }, []);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const handleImageError = useCallback(() => {
    const nextIdx = fallbackIdx + 1;
    const fallback = SLIDE_IMAGE_FALLBACKS[nextIdx];
    if (fallback) {
      setFallbackIdx(nextIdx);
      setImgSrc(fallback);
    } else {
      setImgSrc(DEFAULT_SLIDE_IMAGE);
    }
  }, [fallbackIdx]);

  const readSlide = useCallback(
    async (i: number) => {
      const s = slides[i];
      if (!s) return;
      setSpeaking(true);
      try {
        await speakSlideText(s.title, s.body, { lang: speechLang }, i);
      } catch {
        /* ignore */
      } finally {
        setSpeaking(false);
      }
    },
    [slides, speechLang]
  );

  const runPlayback = useCallback(async () => {
    let i = indexRef.current;
    while (playingRef.current && i < slides.length) {
      setIndex(i);
      indexRef.current = i;
      await readSlide(i);
      if (!playingRef.current) break;
      await new Promise((r) => setTimeout(r, SLIDE_PAUSE_MS + Math.floor(Math.random() * 100)));
      i += 1;
      if (i >= slides.length) {
        playingRef.current = false;
        setPlaying(false);
        break;
      }
    }
  }, [slides.length, readSlide]);

  useEffect(() => {
    if (playing) void runPlayback();
    else stopSpeaking();
  }, [playing, runPlayback]);

  useEffect(() => () => stopSpeaking(), []);

  async function toggleSpeech() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    await readSlide(index);
  }

  function togglePlay() {
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      stopSpeaking();
    } else {
      playingRef.current = true;
      setPlaying(true);
    }
  }

  if (!slide) return null;

  return (
    <div className={className} role="region" aria-label={`Prezentace lekce: ${lessonTitle}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <VoicePicker compact />
      </div>
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-[#021d33] shadow-lg"
        aria-roledescription="slideshow"
      >
        <div className="relative aspect-video w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={slide.imageDescription || slide.title}
            className="h-full w-full object-cover opacity-90"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021d33] via-[#021d33]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7CC4FF]">
              Prezentace k tématu lekce
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold sm:text-xl">{slide.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-100">{slide.body}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 bg-[#003d66] px-4 py-3">
          <span className="text-xs text-slate-300">
            {index + 1} / {slides.length} · {manifest.topic || lessonTitle}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                stopSpeaking();
                setIndex((i) => Math.max(0, i - 1));
              }}
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
              onClick={togglePlay}
              aria-label={playing ? "Pozastavit" : "Přehrát slideshow"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" /> }
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                setIndex((i) => Math.min(slides.length - 1, i + 1));
              }}
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
        <div className="flex gap-1 bg-black/20 px-4 py-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-1.5 flex-1 rounded-full transition ${i === index ? "bg-[#7CC4FF]" : "bg-white/25"}`}
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                stopSpeaking();
                setIndex(i);
              }}
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
