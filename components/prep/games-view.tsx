"use client";

import { useMemo, useState } from "react";
import { PEXESO_PAIRS } from "@/lib/prep/curriculum";
import { generatePrepTest } from "@/lib/prep/engine";
import { PrepExamPlayer } from "@/components/prep/exam-player";
import { usePrepProgress } from "@/components/prep/progress-store";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

type Card = { key: string; pairId: string; text: string; kind: "term" | "def" };

function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const p of PEXESO_PAIRS) {
    cards.push({ key: `${p.id}-t`, pairId: p.id, text: p.term, kind: "term" });
    cards.push({ key: `${p.id}-d`, pairId: p.id, text: p.definition, kind: "def" });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function PexesoBoard() {
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const locked = open.length === 2;

  function flip(key: string) {
    if (locked || open.includes(key) || matched.includes(key)) return;
    const next = [...open, key];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const a = deck.find((c) => c.key === next[0]);
    const b = deck.find((c) => c.key === next[1]);
    if (a && b && a.pairId === b.pairId && a.kind !== b.kind) {
      setMatched((m) => [...m, a.key, b.key]);
      setOpen([]);
    } else {
      window.setTimeout(() => setOpen([]), 750);
    }
  }

  const done = matched.length === deck.length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-[#5a5348]">
        <p>
          Tahy: {moves}
          {done ? " · hotovo" : ""}
        </p>
        <button
          type="button"
          className="rounded-full border border-[#1A2332]/15 px-3 py-1"
          onClick={() => {
            setDeck(buildDeck());
            setOpen([]);
            setMatched([]);
            setMoves(0);
          }}
        >
          Nová hra
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {deck.map((c) => {
          const isOpen = open.includes(c.key) || matched.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(c.key)}
              className={`min-h-[88px] rounded-xl border px-3 py-3 text-left text-sm transition ${
                matched.includes(c.key)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : isOpen
                    ? "border-[#C45C26]/40 bg-white"
                    : "border-[#e0d5c4] bg-[#1A2332] text-[#1A2332]"
              }`}
            >
              <span className={isOpen ? "visible" : "invisible"}>{c.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PrepGamesView() {
  const { progress } = usePrepProgress();
  const [tab, setTab] = useState<"pexeso" | "rapid">("pexeso");
  const rapid = useMemo(
    () =>
      generatePrepTest({
        mode: "rapid",
        subjects: ["biologie", "chemie", "fyzika"] as PrepSubject[],
        count: 8,
        minutes: 4,
        seed: `rapid-${progress.attempts.length}`,
        seenIds: progress.seenQuestionIds,
      }),
    [progress.attempts.length, progress.seenQuestionIds]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Hry</h1>
        <p className="mt-2 text-sm text-[#5a5348]">
          Pexeso na pojmy a čtyřminutový kvíz. Není to simulace fakulty — je to údržba názvosloví.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("pexeso")}
          className={`rounded-full px-4 py-1.5 text-sm ${tab === "pexeso" ? "bg-[#1A2332] text-white" : "bg-white ring-1 ring-[#e0d5c4]"}`}
        >
          Pexeso
        </button>
        <button
          type="button"
          onClick={() => setTab("rapid")}
          className={`rounded-full px-4 py-1.5 text-sm ${tab === "rapid" ? "bg-[#1A2332] text-white" : "bg-white ring-1 ring-[#e0d5c4]"}`}
        >
          Rychlý kvíz
        </button>
      </div>
      {tab === "pexeso" ? <PexesoBoard /> : <PrepExamPlayer key={rapid.id} test={rapid} />}
    </div>
  );
}
