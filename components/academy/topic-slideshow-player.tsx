"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePicker } from "@/components/tts/voice-picker";
import { SLIDE_PAUSE_MS } from "@/lib/tts/naturalize-czech";
import { speakSlideText, stopSpeaking } from "@/lib/tts/speak";
import { resolveSpeechLang } from "@/lib/tts/voice-picker";
import { initSessionVoice } from "@/lib/tts/voice-session";
import { DEFAULT_SLIDE_IMAGE, SLIDE_IMAGE_FALLBACKS } from "@/lib/v25/video/slide-images";
import { resolveStoredSlideImage } from "@/lib/v25/video/slide-image-matcher";
import type { ContentSlideshowManifest } from "@/lib/v25/video/content-slideshow";

type Props = {
  manifest: ContentSlideshowManifest;
  lessonTitle: string;
  className?: string;
  lang?: string | null;
};

function slideUrl(
  slide: ContentSlideshowManifest["slides"][number] | undefined,
  topic: string,
  lessonTitle: string
): string {
  if (!slide) return DEFAULT_SLIDE_IMAGE;
  return resolveStoredSlideImage(
    { title: slide.title, body: slide.body, imageUrl: slide.imageUrl, imageAlt: slide.imageAlt },
    lessonTitle,
    topic
  );
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
  const topic = manifest.topic || lessonTitle;

  const primaryUrl = slideUrl(slide, topic, lessonTitle);

  useEffect(() => {
    setImgSrc(primaryUrl);
    setFallbackIdx(0);
  }, [primaryUrl, index]);

  // Preload next slide image
  useEffect(() => {
    const next = slides[index + 1];
    if (!next) return;
    const nextUrl = slideUrl(next, topic, lessonTitle);
    const img = new Image();
    img.src = nextUrl;
  }, [index, slides, topic, lessonTitle]);

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

  const progressPct = slides.length > 1 ? ((index + 1) / slides.length) * 100 : 100;
  const imageAlt = slide.imageAlt || slide.imageDescription || slide.title;
  const captionCs = slide.captionCs || slide.imageDescription;

  return (
    <div className={className} role="region" aria-label={`Prezentace lekce: ${lessonTitle}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <VoicePicker compact lang={speechLang} />
        <span className="text-xs font-medium text-slate-500" aria-live="polite">
          Slide {index + 1} / {slides.length}
        </span>
      </div>

      <div
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#cfe1f3] bg-[#021d33] shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]"
        aria-roledescription="slideshow"
      >
        {/* Mobile-first: image above text */}
        <div className="flex flex-col">
          <div className="relative flex min-h-[200px] items-center justify-center bg-[#001528] px-4 py-4 sm:min-h-[240px] sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={imageAlt}
              className="max-h-[45vh] w-full max-w-3xl rounded-lg object-contain"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
            {captionCs && captionCs !== slide.title && (
              <p className="mt-2 max-w-3xl text-center text-xs text-slate-400 italic">{captionCs}</p>
            )}
          </div>

          <div className="border-t border-white/10 px-4 py-5 sm:px-8 sm:py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7CC4FF]">
              {topic}
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white md:text-2xl">
              {slide.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate-100 md:text-lg">{slide.body}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10" aria-hidden>
          <div
            className="h-full bg-[#7CC4FF] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 bg-[#003d66] px-4 py-3 sm:px-6">
          <span className="text-xs text-slate-300 sm:text-sm">
            {Math.round(progressPct)} % · {manifest.topic || lessonTitle}
          </span>
          <div className="flex gap-1 sm:gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/10 sm:h-9 sm:w-9"
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                stopSpeaking();
                setIndex((i) => Math.max(0, i - 1));
              }}
              disabled={index === 0}
              aria-label="Předchozí slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/10 sm:h-9 sm:w-9"
              onClick={togglePlay}
              aria-label={playing ? "Pozastavit" : "Přehrát slideshow"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/10 sm:h-9 sm:w-9"
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                setIndex((i) => Math.min(slides.length - 1, i + 1));
              }}
              disabled={index >= slides.length - 1}
              aria-label="Další slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/10 sm:h-9 sm:w-9"
              onClick={() => void toggleSpeech()}
              aria-label="Přečíst slide"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1 bg-black/20 px-4 py-2 sm:px-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-2 min-w-[8px] flex-1 rounded-full transition ${i === index ? "bg-[#7CC4FF]" : "bg-white/25"}`}
              onClick={() => {
                setPlaying(false);
                playingRef.current = false;
                stopSpeaking();
                setIndex(i);
              }}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-600">
        Slideshow: {lessonTitle} · shoda {Math.round((manifest.alignmentScore ?? 0.8) * 100)} %
      </p>
    </div>
  );
}
