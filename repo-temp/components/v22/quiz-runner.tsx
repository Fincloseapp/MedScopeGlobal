"use client";

import { useState } from "react";
import type { V22StudyGame } from "@/lib/v22/games";
import { Button } from "@/components/ui/button";

export function V22QuizRunner({ game }: { game: V22StudyGame }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = game.questions[index];
  const total = game.questions.length;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-[#021d33]">Hotovo!</p>
        <p className="mt-2 text-slate-600">
          Správně {score} z {total} ({Math.round((score / total) * 100)} %)
        </p>
        <Button className="mt-4 rounded-full" onClick={restart}>
          Zkusit znovu
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Otázka {index + 1} / {total}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-[#021d33]">{q.prompt}</h2>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => {
          let cls = "w-full rounded-xl border px-4 py-3 text-left text-sm transition ";
          if (selected === null) cls += "border-slate-200 hover:border-primary/40 hover:bg-slate-50";
          else if (i === q.correctIndex) cls += "border-green-500 bg-green-50 text-green-900";
          else if (i === selected) cls += "border-red-300 bg-red-50 text-red-900";
          else cls += "border-slate-100 opacity-60";
          return (
            <button key={opt} type="button" className={cls} onClick={() => pick(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-[#021d33]">Vysvětlení</p>
          <p className="mt-1">{q.explanation}</p>
          <Button className="mt-4 rounded-full" onClick={next}>
            {index + 1 >= total ? "Dokončit" : "Další otázka"}
          </Button>
        </div>
      )}
    </div>
  );
}
