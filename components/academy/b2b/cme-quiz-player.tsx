"use client";

import { useCallback, useState } from "react";
import type {
  QuizAttemptSession,
  QuizAttemptSubmitResult,
  QuizQuestionPublic,
} from "@/types/academy-b2b";

type Props = {
  quizId: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function CmeQuizPlayer({ quizId, disabled, disabledReason }: Props) {
  const [session, setSession] = useState<QuizAttemptSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptSubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    try {
      const res = await fetch(`/api/academy/b2b/quizzes/${quizId}/start`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        session?: QuizAttemptSession;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.session) {
        setError(data.error ?? "Nelze spustit kvíz");
        return;
      }
      setSession(data.session);
    } catch {
      setError("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  async function submit() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academy/b2b/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: session.attempt_id,
          answers: Object.entries(answers).map(([question_id, value]) => ({
            question_id,
            value,
          })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        result?: QuizAttemptSubmitResult;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.result) {
        setError(data.error ?? "Ověření odpovědí selhalo");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <div className="border border-slate-200 bg-[#f8fafc] px-5 py-6 text-sm text-slate-600">
        {disabledReason ?? "Kvíz je zamčený — nejdříve dokončete povinné video."}
      </div>
    );
  }

  if (!session && !result) {
    return (
      <div className="border border-slate-200 px-5 py-6">
        <p className="text-sm text-slate-600">
          Kvíz losuje náhodný výběr otázek z banky a míchá pořadí odpovědí. Minimální
          úspěšnost je dynamická (výchozí 80 %).
        </p>
        <button
          type="button"
          onClick={() => void start()}
          disabled={loading}
          className="mt-4 bg-[#005B96] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#004a7a] disabled:opacity-60"
        >
          {loading ? "Připravuji…" : "Spustit kvíz"}
        </button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (result) {
    return (
      <div className="border border-slate-200 px-5 py-6">
        <p className="text-3xl font-semibold tracking-tight text-[#021d33]">
          {result.score}%
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {result.correct_count}/{result.total_count} správně · práh{" "}
          {result.passing_threshold}% · pokus #{result.attempts_count}
        </p>
        <p className="mt-4 text-sm text-[#021d33]">
          {result.passed
            ? "Gratulujeme — kurz jste úspěšně absolvovali."
            : "Bohužel jste nedosáhli požadovaného skóre. Projděte znovu materiál a zkuste to znovu."}
        </p>
        {result.passed && result.certificate_id ? (
          <a
            href={`/api/academy/b2b/certificates/${result.certificate_id}/download`}
            className="mt-4 inline-block bg-[#021d33] px-4 py-2 text-sm font-medium text-white"
          >
            Stáhnout certifikát PDF
          </a>
        ) : null}
        {!result.passed ? (
          <button
            type="button"
            onClick={() => void start()}
            disabled={loading}
            className="mt-4 ml-0 block text-sm font-medium text-[#005B96] underline-offset-2 hover:underline"
          >
            Nový pokus
          </button>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  const questions = session?.questions ?? [];
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
        Pokus #{session?.attempt_number}
        {session?.max_attempts != null
          ? ` / max ${session.max_attempts}`
          : null}{" "}
        · práh {session?.passing_threshold}%
      </p>

      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          index={index}
          question={q}
          value={answers[q.id]}
          onChange={(value) =>
            setAnswers((prev) => ({
              ...prev,
              [q.id]: value,
            }))
          }
        />
      ))}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={loading || !allAnswered}
        className="bg-[#005B96] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#004a7a] disabled:opacity-50"
      >
        {loading ? "Ověřuji na serveru…" : "Odeslat kvíz"}
      </button>
      {!allAnswered ? (
        <p className="text-xs text-slate-500">Odpovězte na všechny otázky.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: QuizQuestionPublic;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="border border-slate-200 px-4 py-4">
      <legend className="px-1 text-xs uppercase tracking-[0.12em] text-slate-500">
        Otázka {index + 1}
      </legend>
      <p className="mt-1 text-[15px] leading-relaxed text-[#021d33]">
        {question.question_text}
      </p>
      <div className="mt-3 space-y-2">
        {question.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`block w-full border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-[#005B96] bg-[#f0f7fc] text-[#021d33]"
                  : "border-slate-100 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
