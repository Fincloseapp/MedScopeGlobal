"use client";

import { useEffect, useState } from "react";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";

export function MarketplaceTutorialPlayer({ locale = "cs" }: { locale?: string }) {
  const copy = getMarketplaceUiCopy(locale);
  const slides = copy.slides;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  const slide = slides[index];
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <div
      id="video"
      className="overflow-hidden rounded-2xl border border-[#021d33] bg-[#021d33] text-white shadow-sm"
    >
      <div className="relative min-h-[220px] px-5 py-8 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">
          {copy.tutorialKicker} · {index + 1}/{slides.length}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold">{slide.title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{slide.body}</p>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-[#c4a35a] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="rounded-full bg-[#c4a35a] px-4 py-1.5 text-sm font-semibold text-[#021d33]"
        >
          {playing ? copy.tutorialPause : copy.tutorialPlay}
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          className="rounded-full border border-white/30 px-3 py-1.5 text-sm"
        >
          {copy.tutorialPrev}
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % slides.length)}
          className="rounded-full border border-white/30 px-3 py-1.5 text-sm"
        >
          {copy.tutorialNext}
        </button>
      </div>
    </div>
  );
}
