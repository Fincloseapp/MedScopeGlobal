"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { VideoLegalNotice, detectVideoSource } from "@/components/academy/video-legal-notice";
import { TopicSlideshowPlayer } from "@/components/academy/topic-slideshow-player";
import { TtsListenButton } from "@/components/tts/tts-listen-button";
import { OsvetaListenPlayer } from "@/components/verejnost/osveta-listen-player";
import { prepareVideoScriptForSpeech, getVideoEditorialLabel, stripPersonalVideoIntro } from "@/lib/editorial/video-units";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { attachSlideImages } from "@/lib/v25/video/slide-images";
import {
  isPlaceholderVideoUrl,
  type ContentSlideshowManifest,
} from "@/lib/v25/video/content-slideshow";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";
import type { PublicHealthQuiz, PublicHealthVideoWithTopic } from "@/types/public-osveta";

const GTV_HOST = "storage.googleapis.com/gtv-videos-bucket";

function resolveMediaUrl(url: string | null | undefined): string {
  if (url && url.startsWith("http") && !url.includes(GTV_HOST) && !isPlaceholderVideoUrl(url)) {
    return url;
  }
  return V33_FALLBACK_MP4_URL;
}

function needsSlideshow(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  return url.includes(GTV_HOST) || isPlaceholderVideoUrl(url);
}

function scriptToParagraphs(script: string): string[] {
  const cleaned = stripPersonalVideoIntro(script).trim();
  if (!cleaned) return [];

  const blocks = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length <= 2) return [cleaned];

  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paras.push(sentences.slice(i, i + 2).join(" "));
  }
  return paras;
}

function buildOsvetaSlideshow(video: PublicHealthVideoWithTopic): ContentSlideshowManifest {
  const topic = video.topic?.title ?? "Zdravotní osvěta";
  const paragraphs = scriptToParagraphs(video.script || video.title).slice(0, 6);

  const slides =
    paragraphs.length > 0
      ? paragraphs.map((body, i) => ({
          title: i === 0 ? video.title : `${video.title} — ${i + 1}`,
          body: body.slice(0, 280),
          imageDescription: topic,
          durationSeconds: 10,
        }))
      : [
          {
            title: video.title,
            body: `${topic}: ${video.title}.`,
            imageDescription: topic,
            durationSeconds: 10,
          },
        ];

  return {
    title: video.title,
    topic,
    script: video.script || slides.map((s) => s.body).join(" "),
    voiceoverText: video.script || slides.map((s) => s.body).join(" "),
    slides: attachSlideImages(slides, topic),
    alignmentScore: 0.85,
    ttsMode: "web_speech_api",
    generatedAt: new Date().toISOString(),
    provider: "static",
  };
}

export function OsvetaVideoPlayer({
  video,
  quiz,
}: {
  video: PublicHealthVideoWithTopic;
  quiz: PublicHealthQuiz | null;
}) {
  const avatar = getPublicAvatar(video.avatar_type);
  const editorialLabel = getVideoEditorialLabel({
    avatarType: video.avatar_type,
    category: video.topic?.category,
    metadata: video.metadata,
    audience: "osveta",
    slug: video.slug,
    aiAssisted: false,
  });
  const isAudio = (video.metadata?.lesson_format as string) === "audio_lesson";
  const mediaUrl = resolveMediaUrl(video.video_url);
  const showSlideshow = !isAudio && needsSlideshow(video.video_url);
  const slideshow = useMemo(() => buildOsvetaSlideshow(video), [video]);
  const source = detectVideoSource(mediaUrl, mediaUrl.includes("w3schools.com"));
  // Treat hosted osveta media as first-party — never surface CDN hostnames publicly.
  const publicSourceKind =
    source.kind === "supabase" || source.kind === "medscope" ? "medscope" : source.kind;
  const publicSourceLabel =
    publicSourceKind === "medscope" ? undefined : source.label;

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [watchAwarded, setWatchAwarded] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    score: number;
    xpAwarded: number;
  } | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const listenText = prepareVideoScriptForSpeech({
    title: video.title,
    script: video.script || video.title,
  });
  const readingParagraphs = useMemo(
    () => scriptToParagraphs(video.script || ""),
    [video.script]
  );
  const coverUrl = video.thumbnail_url?.includes(".svg")
    ? avatar.imageUrl
    : (video.thumbnail_url ?? avatar.imageUrl);

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
      /* silent */
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

  return (
    <div className="space-y-6">
      {/* Browser TTS only when there is no dedicated Edge TTS audio lesson */}
      {!isAudio && listenText ? (
        <TtsListenButton
          text={listenText}
          label="Poslechnout text"
          className="not-prose"
          lang="cs-CZ"
          variant="editorial"
        />
      ) : null}

      {showSlideshow ? (
        <VideoLegalNotice
          lessonTitle={video.title}
          variant="osveta"
          sourceKind="medscope"
          dismissible
        >
          <TopicSlideshowPlayer
            manifest={slideshow}
            lessonTitle={video.title}
            lang="cs-CZ"
          />
        </VideoLegalNotice>
      ) : (
        <VideoLegalNotice
          lessonTitle={video.title}
          variant="osveta"
          sourceKind={publicSourceKind}
          sourceLabel={publicSourceLabel}
          dismissible
        >
          {isAudio ? (
            <OsvetaListenPlayer
              title={video.title}
              byline={editorialLabel}
              mediaUrl={mediaUrl}
              coverUrl={coverUrl}
              durationSeconds={video.duration_seconds}
              mediaRef={mediaRef as React.RefObject<HTMLAudioElement | null>}
              onTimeUpdate={(current, duration) => {
                if (watchAwarded || !duration) return;
                if (current / duration >= 0.5) void awardWatch();
              }}
              onEnded={awardWatch}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#cfe1f3] bg-[#021d33]">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={mediaUrl}
                poster={coverUrl}
                controls
                playsInline
                preload="auto"
                className="aspect-video w-full"
                style={{ width: "100%", height: "auto", display: "block" }}
                aria-label={`Přehrávač videa: ${video.title}`}
                onTimeUpdate={onTimeUpdate}
                onEnded={awardWatch}
              >
                <source src={mediaUrl} type="video/mp4" />
              </video>
            </div>
          )}
        </VideoLegalNotice>
      )}

      {readingParagraphs.length > 0 ? (
        <section
          className="rounded-2xl border border-[#d7e6f4] bg-white px-5 py-6 sm:px-8 sm:py-8"
          aria-labelledby="osveta-transcript-heading"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Text k poslechu
          </p>
          <h3
            id="osveta-transcript-heading"
            className="mt-1 font-display text-xl font-semibold text-[#021d33]"
          >
            Číst spolu s lekcí
          </h3>
          <div className="mt-5 space-y-4 text-[1.05rem] leading-[1.75] text-slate-700">
            {readingParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      {watchAwarded ? (
        <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-sm text-emerald-900">
          Děkujeme za poslech — připsali jsme vám +10 XP.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Po přihlášení získáte +10 XP za poslech alespoň poloviny lekce.
        </p>
      )}

      {quiz && !quizResult ? (
        <div className="rounded-2xl border border-[#d7e6f4] bg-white p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            Ověření porozumění
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{quiz.title}</h3>
          <p className="mt-1 text-xs text-slate-500">3 otázky · +20 XP za úspěšné dokončení</p>
          <div className="mt-5 space-y-5">
            {(quiz.questions ?? []).map((q, qi) => (
              <fieldset key={qi} className="space-y-2">
                <legend className="text-sm font-medium text-[#021d33]">
                  {qi + 1}. {q.question_text}
                </legend>
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                      quizAnswers[qi] === opt
                        ? "border-[#005B96]/40 bg-[#e8f4fc] text-[#021d33]"
                        : "border-slate-200 text-slate-600 hover:border-[#005B96]/25"
                    }`}
                  >
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
                      className="accent-[#005B96]"
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
            className="mt-5 rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004a7a] disabled:opacity-50"
          >
            {quizSubmitting ? "Odesílám…" : "Odeslat odpovědi"}
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
            <p className="mt-1 text-sm text-emerald-700">+{quizResult.xpAwarded} XP za kvíz</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
