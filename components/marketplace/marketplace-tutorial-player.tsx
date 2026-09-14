"use client";

import { useEffect, useState } from "react";

const SLIDES: { title: string; body: string }[] = [
  {
    title: "1 · Dvě desky, jeden účel",
    body: "Vlevo nabídky inzerentů. Vpravo poptávky nemocnic a laboratoří. Kupující vidí zboží hned. Inzerent vidí poptávky hned.",
  },
  {
    title: "2 · Zadejte nabídku",
    body: "Formulář na tržišti nebo e-mail inzerce@medscopeglobal.com. Nabídka se objeví okamžitě. Automatická odpověď potvrdí příjem.",
  },
  {
    title: "3 · Přidaná hodnota paušálu",
    body: "Platící inzerent dostane kontakty z poptávek e-mailem, profil /partneri a plochy v magazínu. Bez provize z obchodu. Od 4 900 Kč / měsíc.",
  },
  {
    title: "4 · Poptávka je zdarma",
    body: "Nemocnice a laboratoře poptávají bez poplatku. E-mail na desce není. Inzerent s paušálem ho dostane podle SLA tarifu.",
  },
  {
    title: "5 · Dotazy jdou samy",
    body: "Otázky na cenu, fakturu, zákon o reklamě nebo termíny odpovídá obchodní oddělení automaticky. Můžete odpovědět na e-mail.",
  },
  {
    title: "6 · Co udělat teď",
    body: "Objednejte paušál, nebo pošlete nabídku. Návod znovu: /exchange/navod. Ceník: /inzerce/pausal.",
  },
];

export function MarketplaceTutorialPlayer() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const slide = SLIDES[index];
  const progress = ((index + 1) / SLIDES.length) * 100;

  return (
    <div
      id="video"
      className="overflow-hidden rounded-2xl border border-[#021d33] bg-[#021d33] text-white shadow-sm"
    >
      <div className="relative min-h-[220px] px-5 py-8 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">
          Krátké video instrukce · {index + 1}/{SLIDES.length}
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
          {playing ? "Pauza" : "Přehrát"}
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)}
          className="rounded-full border border-white/30 px-3 py-1.5 text-sm"
        >
          Předchozí
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % SLIDES.length)}
          className="rounded-full border border-white/30 px-3 py-1.5 text-sm"
        >
          Další
        </button>
      </div>
    </div>
  );
}
