"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { GeneratedPrepTest, PrepQuestion } from "@/lib/prep/types";
import { isAnswerCorrect, isMulti, scoreAttempt } from "@/lib/prep/scoring";
import { usePrepProgress } from "@/components/prep/progress-store";
import { useMeDiprepEntitlement } from "@/components/prep/use-mediprep-entitlement";
import { MeDiprepPaywall } from "@/components/prep/mediprep-paywall";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}`;
}

function asArray(v: number | number[] | undefined): number[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function PrepExamPlayer({
  test,
  immediateFeedback = false,
}: {
  test: GeneratedPrepTest;
  immediateFeedback?: boolean;
}) {
  const { recordAttempt, completeChapter } = usePrepProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(test.minutes ? test.minutes * 60 : null);
  const [timedOut, setTimedOut] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const q = test.questions[index];
  const total = test.questions.length;

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setTimedOut(false);
    setSecondsLeft(test.minutes ? test.minutes * 60 : null);
  }, [test.id, test.minutes]);

  const finish = useCallback(
    (timeout: boolean) => {
      if (submitted) return;
      const current = answersRef.current;
      const result = scoreAttempt(test.questions, current, test.scoring);
      const durationSec = Math.round((Date.now() - startedAt) / 1000);
      recordAttempt(
        {
          id: newId(),
          at: new Date().toISOString(),
          mode: test.mode,
          facultySlug: test.facultySlug,
          title: test.title,
          subjects: test.subjects,
          correct: result.correct,
          total: result.total,
          scorePct: result.scorePct,
          durationSec,
          timedOut: timeout,
          weakTopics: result.weakTopics,
        },
        test.questions.map((item) => item.id),
        test.questions.map((item) => ({
          topic: item.topic,
          subject: item.subject,
          ok: isAnswerCorrect(item, current[item.id]),
        }))
      );
      setTimedOut(timeout);
      setSubmitted(true);
      const chapterId = test.questions[0]?.chapterId;
      if (test.mode === "learn" && chapterId && result.scorePct >= test.passingPct) {
        completeChapter(chapterId);
      }
    },
    [completeChapter, recordAttempt, startedAt, submitted, test]
  );

  useEffect(() => {
    if (secondsLeft === null || submitted) return;
    if (secondsLeft <= 0) {
      finish(true);
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, submitted, finish]);

  const result = useMemo(
    () => (submitted ? scoreAttempt(test.questions, answers, test.scoring) : null),
    [answers, submitted, test]
  );

  if (!q) {
    return (
      <p className="rounded-2xl border border-[#e0d5c4] bg-white p-6 text-sm text-[#5a5348]">
        V bance teď není dost otázek pro toto nastavení. Zkuste jiný předmět nebo kapitolu.
      </p>
    );
  }

  if (submitted && result) {
    return (
      <ResultCard
        test={test}
        result={result}
        timedOut={timedOut}
        answers={answers}
      />
    );
  }

  const chosen = asArray(answers[q.id]);
  const show = immediateFeedback && revealed[q.id];
  const clock =
    secondsLeft !== null
      ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_200px]">
      <div className="rounded-[24px] border border-[#e0d5c4] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C45C26]">{test.title}</p>
            <p className="mt-1 text-sm text-[#6b6256]">
              {index + 1} / {total} · {subjectLabel(q.subject)} · {q.topic}
              {test.scoring === "plusMinus" ? " · −0,25 za chybu" : ""}
            </p>
          </div>
          {clock ? (
            <p
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                secondsLeft !== null && secondsLeft < 60 ? "bg-rose-100 text-rose-800" : "bg-[#F3EDE1] text-[#1A2332]"
              }`}
            >
              {clock}
            </p>
          ) : null}
        </div>

        <h2 className="mt-5 font-display text-xl font-semibold leading-snug sm:text-2xl">{q.prompt}</h2>
        {isMulti(q) ? (
          <p className="mt-2 text-xs text-[#C45C26]">Více možností může být správně.</p>
        ) : null}

        <div className="mt-5 space-y-2">
          {q.options.map((opt, oi) => {
            const selected = chosen.includes(oi);
            let cls = "border-[#e0d5c4] hover:border-[#C45C26]/50";
            if (show && correctSetHas(q, oi)) cls = "border-emerald-500 bg-emerald-50";
            else if (show && selected && !correctSetHas(q, oi)) cls = "border-rose-400 bg-rose-50";
            else if (selected) cls = "border-[#005B96] bg-[#f0f7ff]";
            return (
              <label key={oi} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${cls}`}>
                <input
                  type={isMulti(q) ? "checkbox" : "radio"}
                  className="mt-1"
                  name={`${test.id}-${q.id}`}
                  checked={selected}
                  onChange={() => {
                    setAnswers((prev) => {
                      if (!isMulti(q)) return { ...prev, [q.id]: oi };
                      const cur = asArray(prev[q.id]);
                      const next = cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi];
                      return { ...prev, [q.id]: next };
                    });
                  }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {show && q.explanation ? (
          <p className="mt-4 rounded-xl bg-[#F3EDE1] px-4 py-3 text-sm leading-relaxed text-[#3d4a5c]">
            <span className="font-medium text-[#1A2332]">Proč: </span>
            {q.explanation}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-full border border-[#1A2332]/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Zpět
          </button>
          {immediateFeedback && !revealed[q.id] ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
              className="rounded-full bg-[#2F6B5A] px-4 py-2 text-sm font-medium text-white"
            >
              Zkontrolovat
            </button>
          ) : null}
          {index < total - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-full bg-[#1A2332] px-4 py-2 text-sm font-medium text-white"
            >
              Další
            </button>
          ) : (
            <button
              type="button"
              onClick={() => finish(false)}
              className="rounded-full bg-[#C45C26] px-4 py-2 text-sm font-semibold text-white"
            >
              Odevzdat test
            </button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-[#e0d5c4] bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b6256]">Mapa otázek</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-4">
          {test.questions.map((item, i) => {
            const done = answers[item.id] !== undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-8 rounded-md text-xs font-medium ${
                  i === index
                    ? "bg-[#1A2332] text-white"
                    : done
                      ? "bg-[#2F6B5A]/15 text-[#2F6B5A]"
                      : "bg-[#F3EDE1] text-[#6b6256]"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F3EDE1]">
          <div
            className="h-full bg-[#C45C26]"
            style={{ width: `${Math.round((Object.keys(answers).length / total) * 100)}%` }}
          />
        </div>
      </aside>
    </div>
  );
}

function correctSetHas(q: PrepQuestion, oi: number) {
  if (q.correctIndices?.length) return q.correctIndices.includes(oi);
  return q.correctIndex === oi;
}

function ResultCard({
  test,
  result,
  timedOut,
  answers,
}: {
  test: GeneratedPrepTest;
  result: ReturnType<typeof scoreAttempt>;
  timedOut: boolean;
  answers: Record<string, number | number[]>;
}) {
  const { entitled } = useMeDiprepEntitlement();
  const passed = result.scorePct >= test.passingPct;
  const firstWeak = result.weakTopics[0];
  const weakQ = test.questions.find((q) => q.topic === firstWeak);

  return (
    <div className="space-y-6">
      {!entitled ? <MeDiprepPaywall reason={firstWeak ? "drill" : "quota"} compact /> : null}
      <section className="rounded-[24px] border border-[#e0d5c4] bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C45C26]">
          {timedOut ? "Čas vypršel — test odevzdán" : "Vyhodnocení"}
        </p>
        <p className="mt-2 font-display text-4xl font-semibold">
          {result.correct}/{result.total}
          <span className="ml-3 text-2xl text-[#6b6256]">{result.scorePct} %</span>
        </p>
        <p className="mt-2 text-sm text-[#5a5348]">
          {passed
            ? `Nad hranicí ${test.passingPct} % — držte tempo simulací.`
            : `Pod ${test.passingPct} %. Nejdřív drill mezer, teprve pak další dlouhý test.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {firstWeak && weakQ ? (
            <Link
              href={`/app/priprava?tab=testy&mode=drill&topic=${encodeURIComponent(firstWeak)}&subject=${weakQ.subject}`}
              className="rounded-full bg-[#C45C26] px-4 py-2 text-sm font-semibold text-white"
            >
              Drill: {firstWeak}
            </Link>
          ) : null}
          <Link href="/app/priprava?tab=plan" className="rounded-full border border-[#1A2332]/20 px-4 py-2 text-sm">
            Týdenní plán
          </Link>
          <Link href="/app/priprava?tab=testy" className="rounded-full border border-[#1A2332]/20 px-4 py-2 text-sm">
            Další test
          </Link>
        </div>
      </section>

      {result.weakTopics.length ? (
        <section className="rounded-2xl border border-[#e0d5c4] bg-white p-5">
          <h2 className="font-display text-lg font-semibold">Slabší témata</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.weakTopics.map((t) => (
              <li key={t} className="rounded-full bg-[#F3EDE1] px-3 py-1 text-sm text-[#5a5348]">
                {t}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Rozbor</h2>
        {test.questions.map((item, i) => {
          const ok = isAnswerCorrect(item, answers[item.id]);
          return (
            <details key={item.id} className="rounded-xl border border-[#e0d5c4] bg-white p-4">
              <summary className="cursor-pointer text-sm font-medium">
                <span className={ok ? "text-emerald-700" : "text-rose-700"}>{ok ? "Správně" : "Chyba"}</span>
                <span className="ml-2 text-[#1A2332]">
                  {i + 1}. {item.prompt}
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#5a5348]">{item.explanation}</p>
            </details>
          );
        })}
      </section>
    </div>
  );
}
