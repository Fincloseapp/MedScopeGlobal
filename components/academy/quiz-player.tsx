"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AcademyQuizQuestion, QuizSubmitResult } from "@/types/academy";

type Props = {
  quizId: string;
  questions: AcademyQuizQuestion[];
  passingScore: number;
};

export function QuizPlayer({ quizId, questions, passingScore }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectAnswer(questionId: string, value: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: { value: answers[q.id] ?? "" },
        })),
      };

      const res = await fetch(`/api/academy/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; result?: QuizSubmitResult; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? `Chyba serveru (${res.status})`);
        return;
      }

      setResult(data.result ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      <ol className="space-y-6">
        {questions.map((q, i) => {
          const options = Array.isArray(q.options)
            ? (q.options as { label?: string; value?: unknown }[])
            : [];

          return (
            <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">Otázka {i + 1}</p>
              <p className="mt-2 font-display text-lg text-[#021d33]">{q.question_text}</p>

              {options.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {options.map((opt, j) => {
                    const value = String(opt.value ?? opt.label ?? j);
                    const selected = answers[q.id] === value;
                    return (
                      <li key={j}>
                        <button
                          type="button"
                          disabled={!!result}
                          onClick={() => selectAnswer(q.id, value)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                            selected
                              ? "border-[#005B96] bg-[#f0f7fc] text-[#021d33]"
                              : "border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {opt.label ?? String(opt.value ?? opt)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <input
                  type="text"
                  disabled={!!result}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => selectAnswer(q.id, e.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Vaše odpověď"
                />
              )}
            </li>
          );
        })}
      </ol>

      {!result ? (
        <div className="flex flex-col items-center gap-3">
          <Button onClick={submit} disabled={loading || !allAnswered}>
            {loading ? "Odesílám…" : "Odeslat odpovědi"}
          </Button>
          {!allAnswered ? (
            <p className="text-xs text-slate-500">Odpovězte na všechny otázky před odesláním.</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      ) : (
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-2xl font-bold text-[#021d33]">{result.score}%</p>
          <p className="mt-1 text-sm text-slate-600">
            {result.correct_count} / {result.total_count} správně · minimum {passingScore}%
          </p>
          <p className={`mt-2 font-medium ${result.passed ? "text-green-700" : "text-amber-700"}`}>
            {result.passed ? "Gratulujeme, kvíz jste splnili!" : "Zkuste to znovu po prostudování lekce."}
          </p>
          {result.passed && result.xp_awarded && result.xp_awarded > 0 ? (
            <p className="mt-2 text-sm font-medium text-[#005B96]">+{result.xp_awarded} XP na žebříček</p>
          ) : result.passed ? (
            <p className="mt-2 text-xs text-slate-500">Přihlaste se pro získání XP na žebříčku.</p>
          ) : null}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            Zkusit znovu
          </Button>
        </div>
      )}
    </div>
  );
}
