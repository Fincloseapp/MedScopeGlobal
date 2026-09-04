"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateSelfTest } from "@/lib/prijimacky/quiz-from-bank";
import {
  STUDENT_CLUB_FREE_RUNS,
  STUDENT_CLUB_PLAN_HREF,
  STUDENT_CLUB_PRICE_CZK,
  STUDENT_CLUB_STORAGE_EMAIL,
  STUDENT_CLUB_STORAGE_NICK,
  STUDENT_CLUB_STORAGE_RUNS,
  STUDENT_CLUB_STORAGE_SCORES,
  canStartClubRun,
  isValidStudentEmail,
  normalizeStudentNick,
  rankClubScores,
  remainingFreeRuns,
  type StudentClubScore,
} from "@/lib/studenti/club";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StudentClubBoard({
  clubOpen = false,
  initialEmail = "",
}: {
  clubOpen?: boolean;
  initialEmail?: string;
}) {
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [used, setUsed] = useState(0);
  const [scores, setScores] = useState<StudentClubScore[]>([]);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState<null | { score: number; total: number }>(null);
  const quiz = useMemo(
    () => generateSelfTest({ count: 8, seed: `club-${nick || "guest"}-${used}` }),
    [nick, used]
  );

  useEffect(() => {
    setNick(normalizeStudentNick(window.localStorage.getItem(STUDENT_CLUB_STORAGE_NICK) ?? ""));
    setEmail(
      initialEmail || window.localStorage.getItem(STUDENT_CLUB_STORAGE_EMAIL) || ""
    );
    setUsed(Number(window.localStorage.getItem(STUDENT_CLUB_STORAGE_RUNS) ?? 0) || 0);
    setScores(readJson<StudentClubScore[]>(STUDENT_CLUB_STORAGE_SCORES, []));
    setReady(true);
  }, [initialEmail]);

  const left = remainingFreeRuns(used, clubOpen);
  const canPlay = canStartClubRun(used, clubOpen);
  const signed = Boolean(normalizeStudentNick(nick) && isValidStudentEmail(email));
  const board = rankClubScores(scores);

  function persistAccount(nextNick: string, nextEmail: string) {
    window.localStorage.setItem(STUDENT_CLUB_STORAGE_NICK, nextNick);
    window.localStorage.setItem(STUDENT_CLUB_STORAGE_EMAIL, nextEmail);
  }

  function startRun() {
    const clean = normalizeStudentNick(nick);
    const mail = email.trim();
    if (!clean || !isValidStudentEmail(mail)) return;
    persistAccount(clean, mail);
    if (!canStartClubRun(used, clubOpen)) return;
    setPlaying(true);
    setDone(null);
    setAnswers(Array(quiz.questions.length).fill(-1));
  }

  function finishRun() {
    const total = quiz.questions.length;
    const score = quiz.questions.reduce(
      (sum, q, i) => sum + (answers[i] === q.correct_answer.index ? 1 : 0),
      0
    );
    const nextUsed = clubOpen ? used : used + 1;
    const row: StudentClubScore = {
      nick: normalizeStudentNick(nick),
      score,
      total,
      at: new Date().toISOString(),
    };
    const nextScores = [...scores, row];
    window.localStorage.setItem(STUDENT_CLUB_STORAGE_RUNS, String(nextUsed));
    window.localStorage.setItem(STUDENT_CLUB_STORAGE_SCORES, JSON.stringify(nextScores));
    setUsed(nextUsed);
    setScores(nextScores);
    setPlaying(false);
    setDone({ score, total });
  }

  if (!ready) return <p className="text-sm text-slate-500">Načítám klub…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {!playing ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">
              Soutěžní kvíz
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
              {canPlay ? "Další kolo z banky přijímaček" : "5 kol zdarma je vyčerpaných"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {clubOpen
                ? "Klub je otevřený — hrajte dál, žebříček ukazuje jen přezdívku."
                : `${STUDENT_CLUB_FREE_RUNS} kol zdarma. Pak Klub studentů za ${STUDENT_CLUB_PRICE_CZK} Kč/měsíc, zrušíte kdykoli. Žádné skryté platby.`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Zbývá {clubOpen ? "neomezeně" : left} {clubOpen ? "" : "volných kol"}. E-mail slouží
              jen k účtu — na žebříčku je přezdívka. Pro uchazeče od 18 let.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-slate-600">Přezdívka</span>
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  maxLength={20}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="např. BioChem18"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">E-mail k účtu</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="vas@email.cz"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!signed || !canPlay}
                onClick={startRun}
                className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Spustit kolo
              </button>
              {!canPlay ? (
                <Link
                  href={STUDENT_CLUB_PLAN_HREF}
                  className="rounded-full border border-[#005B96]/30 px-5 py-2 text-sm font-semibold text-[#005B96]"
                >
                  Otevřít Klub · {STUDENT_CLUB_PRICE_CZK} Kč/měsíc
                </Link>
              ) : used >= 3 && !clubOpen ? (
                <Link
                  href={STUDENT_CLUB_PLAN_HREF}
                  className="rounded-full border border-[#005B96]/30 px-5 py-2 text-sm font-semibold text-[#005B96]"
                >
                  Líbí se tempo? Klub bez limitu
                </Link>
              ) : null}
            </div>
            {done ? (
              <p className="mt-4 text-sm text-[#021d33]">
                Poslední kolo: <strong>{done.score}/{done.total}</strong>. Pokračujte, až budete chtít
                — další kolo počká.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold text-[#021d33]">{quiz.title}</h2>
            <ol className="mt-4 space-y-4">
              {quiz.questions.map((q, qi) => (
                <li key={q.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-medium text-[#021d33]">{q.question_text}</p>
                  <div className="mt-2 grid gap-1">
                    {q.options.map((opt, oi) => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[qi] === oi}
                          onChange={() =>
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[qi] = oi;
                              return next;
                            })
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={finishRun}
              className="mt-4 rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white"
            >
              Odevzdat kolo
            </button>
          </>
        )}
      </section>
      <aside className="rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">Žebříček</p>
        <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">Nejlepší nicky</h3>
        <p className="mt-1 text-xs text-slate-500">Jen přezdívky z tohoto zařízení. Žádná falešná jména.</p>
        {board.length ? (
          <ol className="mt-3 space-y-2">
            {board.map((row, i) => (
              <li key={row.nick} className="flex justify-between text-sm">
                <span>
                  {i + 1}. {row.nick}
                </span>
                <span className="font-semibold text-[#005B96]">
                  {row.score}/{row.total}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Po prvním odevzdaném kole se tu objeví váš nick.</p>
        )}
        <Link href="/studenti/zebricek" className="mt-4 inline-block text-sm font-semibold text-[#005B96] hover:underline">
          Celý žebříček →
        </Link>
      </aside>
    </div>
  );
}
