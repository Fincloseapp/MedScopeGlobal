"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GeneratedSelfTest } from "@/lib/prijimacky/quiz-from-bank";

export function SelfTestPlayer({ test }: { test: GeneratedSelfTest }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    let ok = 0;
    for (const q of test.questions) {
      if (answers[q.id] === q.correct_answer.index) ok += 1;
    }
    const pct = Math.round((ok / Math.max(test.questions.length, 1)) * 100);
    return { ok, total: test.questions.length, pct, passed: pct >= test.passingScore };
  }, [answers, submitted, test]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">Self-test</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{test.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {test.questions.length} otázek · úspěšnost od {test.passingScore} % · okamžité vysvětlení po odevzdání
        </p>
      </div>

      {test.questions.map((q, idx) => {
        const chosen = answers[q.id];
        const show = submitted;
        const correct = q.correct_answer.index;
        return (
          <fieldset key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-[#021d33]">
              {idx + 1}. {q.question_text}
            </legend>
            <p className="mb-3 text-[11px] uppercase tracking-wide text-slate-400">
              {q.meta.subject} · {q.meta.topic}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                let cls = "border-slate-200 hover:border-[#005B96]/40";
                if (show && oi === correct) cls = "border-emerald-500 bg-emerald-50";
                else if (show && selected && oi !== correct) cls = "border-rose-400 bg-rose-50";
                else if (selected) cls = "border-[#005B96] bg-[#f0f7ff]";
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${cls}`}
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      name={q.id}
                      disabled={submitted}
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            {show && q.explanation ? (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-[#021d33]">Vysvětlení: </span>
                {q.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="rounded-full bg-[#005B96] px-6 py-3 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          Odevzdat self-test
        </button>
      ) : score ? (
        <div className="rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
          <p className="font-display text-2xl font-semibold text-[#021d33]">
            {score.ok}/{score.total} · {score.pct} %
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {score.passed ? "Splněno — dobrá práce." : "Pod hranicí úspěšnosti — zkuste další sadu."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/academy/prijimacky/self-test?subject=mixed&count=15"
              className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white"
            >
              Nový mixed test
            </Link>
            <Link
              href="/academy/courses?category=prijimacky"
              className="rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-medium text-[#005B96]"
            >
              Zpět na hub přijímaček
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
