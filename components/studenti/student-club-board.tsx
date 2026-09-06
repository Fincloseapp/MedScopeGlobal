"use client";

import { useEffect, useMemo, useState } from "react";
import { StudentLink as Link } from "@/components/studenti/student-link";
import { generateSelfTest } from "@/lib/prijimacky/quiz-from-bank";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import {
  STUDENT_CLUB_FREE_RUNS,
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

type ClubSubject = "mixed" | PrepSubject;
const SUBJECTS: { id: ClubSubject; label: string }[] = [
  { id: "mixed", label: "Mix B/C/F" },
  { id: "biologie", label: "Biologie" },
  { id: "chemie", label: "Chemie" },
  { id: "fyzika", label: "Fyzika" },
];

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
  initialNick = "",
  signedIn = false,
}: {
  clubOpen?: boolean;
  initialEmail?: string;
  initialNick?: string;
  signedIn?: boolean;
}) {
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState<ClubSubject>("mixed");
  const [used, setUsed] = useState(0);
  const [scores, setScores] = useState<StudentClubScore[]>([]);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState<null | { score: number; total: number }>(null);
  const [review, setReview] = useState<
    { question: string; ok: boolean; explanation: string | null }[] | null
  >(null);
  const quiz = useMemo(
    () =>
      generateSelfTest({
        count: 8,
        subjects: subject === "mixed" ? undefined : [subject],
        seed: `club-${subject}-${nick || "guest"}-${used}`,
      }),
    [nick, used, subject]
  );

  useEffect(() => {
    setNick(
      normalizeStudentNick(
        window.localStorage.getItem(STUDENT_CLUB_STORAGE_NICK) || initialNick || ""
      )
    );
    setEmail(
      initialEmail || window.localStorage.getItem(STUDENT_CLUB_STORAGE_EMAIL) || ""
    );
    setUsed(Number(window.localStorage.getItem(STUDENT_CLUB_STORAGE_RUNS) ?? 0) || 0);
    setScores(readJson<StudentClubScore[]>(STUDENT_CLUB_STORAGE_SCORES, []));
    setReady(true);
  }, [initialEmail, initialNick]);

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
    setReview(null);
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
    setReview(
      quiz.questions.map((q, i) => ({
        question: q.question_text,
        ok: answers[i] === q.correct_answer.index,
        explanation: q.explanation,
      }))
    );
  }

  if (!ready) return <p className="text-sm text-slate-500">Načítám klub…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {!playing ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6d32]">
              Soutěžní kvíz
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#1b1712]">
              {canPlay ? "Další kolo z banky přijímaček" : "Volný test je vyčerpaný — 89 Kč, pak 149 Kč"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {clubOpen
                ? "Klub je otevřený — hrajte dál, žebříček ukazuje jen přezdívku."
                : `1 test zdarma. Pak první měsíc 89 Kč a další ${STUDENT_CLUB_PRICE_CZK} Kč — zrušíte kdykoli. Žádné skryté platby.`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Zbývá {clubOpen ? "neomezeně" : left} {clubOpen ? "" : "volných kol"}. E-mail slouží
              jen k účtu — na žebříčku je přezdívka. Pro uchazeče od 18 let.
            </p>
            {!signedIn ? (
              <p className="mt-2 text-xs text-slate-500">
                Po <Link href="/login" className="font-semibold text-[#8a6d32] hover:underline">přihlášení</Link>{" "}
                se e-mail předvyplní a zaplacené členství odemkne neomezená kola.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {SUBJECTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSubject(item.id)}
                  className={
                    subject === item.id
                      ? "rounded-full bg-[#1b1712] px-3 py-1 text-xs font-semibold text-[#f6f1e8]"
                      : "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
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
                className="rounded-full bg-[#1b1712] px-5 py-2 text-sm font-semibold text-[#f6f1e8] disabled:opacity-50"
              >
                Spustit kolo
              </button>
              {!canPlay || (used >= 3 && !clubOpen) ? (
                <V27CheckoutButton
                  kind="subscription"
                  productId="student-month"
                  label={`Klub · 89 Kč teď, pak ${STUDENT_CLUB_PRICE_CZK} Kč`}
                  className="rounded-full border border-[#8a6d32]/40 bg-white px-5 py-2 text-sm font-semibold text-[#8a6d32]"
                />
              ) : null}
            </div>
            {!canPlay ? (
              <p className="mt-3 text-xs text-slate-500">
                Zrušíte kdykoli v účtu. Žádné skryté poplatky.{" "}
                <Link href="/podminky" className="underline">
                  Podmínky
                </Link>
              </p>
            ) : null}
            {done ? (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-[#021d33]">
                <p>
                  Poslední kolo: <strong>{done.score}/{done.total}</strong>. Pokračujte, až budete chtít
                  — další kolo počká.
                </p>
                {review?.length ? (
                  <ol className="mt-3 space-y-2 text-xs text-slate-600">
                    {review.map((row) => (
                      <li key={row.question}>
                        <span className={row.ok ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                          {row.ok ? "Správně" : "Doplnit"}
                        </span>
                        {": "}
                        {row.question}
                        {row.explanation ? (
                          <span className="mt-0.5 block text-slate-500">{row.explanation}</span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold text-[#1b1712]">{quiz.title}</h2>
            <ol className="mt-4 space-y-4">
              {quiz.questions.map((q, qi) => (
                <li key={q.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-medium text-[#1b1712]">{q.question_text}</p>
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
              className="mt-4 rounded-full bg-[#1b1712] px-5 py-2 text-sm font-semibold text-[#f6f1e8]"
            >
              Odevzdat kolo
            </button>
          </>
        )}
      </section>
      <aside className="rounded-2xl border border-[#1b1712]/12 bg-[#f6f1e8] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6d32]">Žebříček</p>
        <h3 className="mt-1 font-display text-lg font-semibold text-[#1b1712]">Nejlepší nicky</h3>
        <p className="mt-1 text-xs text-slate-500">Jen přezdívky z tohoto zařízení. Žádná falešná jména.</p>
        {board.length ? (
          <ol className="mt-3 space-y-2">
            {board.map((row, i) => (
              <li key={row.nick} className="flex justify-between text-sm">
                <span>
                  {i + 1}. {row.nick}
                </span>
                <span className="font-semibold text-[#8a6d32]">
                  {row.score}/{row.total}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Po prvním odevzdaném kole se tu objeví váš nick.</p>
        )}
        <Link href="/studenti/zebricek" className="mt-4 inline-block text-sm font-semibold text-[#8a6d32] hover:underline">
          Celý žebříček →
        </Link>
      </aside>
    </div>
  );
}
