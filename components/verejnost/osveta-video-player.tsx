"use client";

import { useCallback, useRef, useState } from "react";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";
import type { PublicHealthQuiz, PublicHealthVideoWithTopic } from "@/types/public-osveta";

export function OsvetaVideoPlayer({
  video,
  quiz,
}: {
  video: PublicHealthVideoWithTopic;
  quiz: PublicHealthQuiz | null;
}) {
  const avatar = getPublicAvatar(video.avatar_type);
  const isAudio = (video.metadata?.lesson_format as string) === "audio_lesson";
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [watchAwarded, setWatchAwarded] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    score: number;
    xpAwarded: number;
  } | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const awardWatch = useCallback(async () => {
    if (watchAwarded) return;
    try {
      const res = await fetch(`/api/verejnost/osveta/${video.id}/watch`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.ok && data.awarded) setWatchAwarded(true);
    } catch {
      /* silent — user may be logged out */
    }
  }, [video.id, watchAwarded]);

  const onTimeUpdate = () => {
    const el = mediaRef.current;
    if (!el || watchAwarded) return;
    const pct = el.currentTime / (el.duration || 1);
    if (pct >= 0.5) void awardWatch();
  };

  const submitQuiz = async () => {
    if (!quiz || quizSubmitting) return;
    setQuizSubmitting(true);
    try {
      const res = await fetch(`/api/verejnost/osveta/${video.id}/quiz`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const data = await res.json();
      if (data.ok) {
        setQuizResult({ passed: data.passed, score: data.score, xpAwarded: data.xpAwarded });
      }
    } finally {
      setQuizSubmitting(false);
    }
  };

  const mediaUrl = video.video_url ?? "";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#021d33]">
        {isAudio ? (
          <div className="relative flex flex-col items-center gap-4 p-6 sm:flex-row sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="h-32 w-32 shrink-0 rounded-full border-4 border-white/20 object-cover shadow-lg"
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-medium text-white/80">{avatar.name}</p>
              <p className="text-xs text-white/50">{avatar.role}</p>
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={mediaUrl}
                controls
                className="mt-4 w-full"
                onTimeUpdate={onTimeUpdate}
                onEnded={awardWatch}
              />
            </div>
          </div>
        ) : (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            poster={video.thumbnail_url ?? avatar.imageUrl}
            controls
            className="aspect-video w-full"
            onTimeUpdate={onTimeUpdate}
            onEnded={awardWatch}
          />
        )}
      </div>

      {watchAwarded ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          +10 XP za zhlédnutí — díky za sledování!
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Přihlaste se a sledujte alespoň polovinu videa pro +10 XP.
        </p>
      )}

      {quiz && !quizResult ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-[#021d33]">{quiz.title}</h3>
          <p className="mt-1 text-xs text-slate-500">3 otázky · +20 XP za úspěšné dokončení</p>
          <div className="mt-4 space-y-4">
            {(quiz.questions ?? []).map((q, qi) => (
              <fieldset key={qi} className="space-y-2">
                <legend className="text-sm font-medium text-[#021d33]">
                  {qi + 1}. {q.question_text}
                </legend>
                {q.options.map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      value={opt}
                      checked={quizAnswers[qi] === opt}
                      onChange={() => {
                        const next = [...quizAnswers];
                        next[qi] = opt;
                        setQuizAnswers(next);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <button
            type="button"
            disabled={quizSubmitting || quizAnswers.length < (quiz.questions?.length ?? 0)}
            onClick={submitQuiz}
            className="mt-4 rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#004a7a] disabled:opacity-50"
          >
            {quizSubmitting ? "Odesílám…" : "Odeslat kvíz"}
          </button>
        </div>
      ) : null}

      {quizResult ? (
        <div
          className={`rounded-2xl border p-5 ${
            quizResult.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="font-semibold text-[#021d33]">
            {quizResult.passed ? "Výborně!" : "Zkuste to znovu"} — {quizResult.score} %
          </p>
          {quizResult.xpAwarded > 0 ? (
            <p className="mt-1 text-sm text-emerald-700">+{quizResult.xpAwarded} XP za kvíz!</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
