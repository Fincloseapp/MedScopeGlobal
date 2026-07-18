"use client";

import { useState } from "react";
import { LockedVideoPlayer } from "@/components/academy/b2b/locked-video-player";
import { CmeQuizPlayer } from "@/components/academy/b2b/cme-quiz-player";

type Props = {
  lessonId: string;
  lessonTitle: string;
  videoUrl: string;
  poster?: string | null;
  quizId: string | null;
  quizTitle?: string | null;
  initiallyUnlocked: boolean;
};

export function CmeLessonQuizSection({
  lessonId,
  lessonTitle,
  videoUrl,
  poster,
  quizId,
  quizTitle,
  initiallyUnlocked,
}: Props) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-serif text-2xl text-[#021d33]">{lessonTitle}</h2>
        <div className="mt-4">
          <LockedVideoPlayer
            src={videoUrl}
            lessonId={lessonId}
            poster={poster}
            title={lessonTitle}
            onUnlocked={() => setUnlocked(true)}
          />
        </div>
      </section>

      {quizId ? (
        <section>
          <h2 className="font-serif text-2xl text-[#021d33]">
            {quizTitle ?? "Závěrečný kvíz"}
          </h2>
          <div className="mt-4">
            <CmeQuizPlayer
              quizId={quizId}
              disabled={!unlocked}
              disabledReason="Nejdříve dokončete povinné video — přetáčení vpřed je zakázáno."
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
