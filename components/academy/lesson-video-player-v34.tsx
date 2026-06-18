"use client";

import { LessonVideoPlayer } from "@/components/academy/lesson-video-player";
import { AcademyVideoPlayer } from "@/lib/v34/video-engine/player";
import { extractVideoMetadata } from "@/lib/v34/video-engine/metadata";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  className?: string;
};

/** v34 — prefers AcademyVideoPlayer (HLS + retry chain), falls back to v33 audio-aware player */
export function LessonVideoPlayerV34({ video, lessonTitle, className }: Props) {
  if (!video) {
    return <LessonVideoPlayer video={video} lessonTitle={lessonTitle} className={className} />;
  }

  const meta = (video.metadata ?? {}) as Record<string, unknown>;
  const isAudioLesson = meta.lesson_format === "audio_lesson" || Boolean(meta.tts_audio_url);
  if (isAudioLesson) {
    return <LessonVideoPlayer video={video} lessonTitle={lessonTitle} className={className} />;
  }

  const videoMeta = extractVideoMetadata(video);
  if (!videoMeta.url_chain.length) {
    return <LessonVideoPlayer video={video} lessonTitle={lessonTitle} className={className} />;
  }

  return <AcademyVideoPlayer metadata={videoMeta} lessonTitle={lessonTitle} className={className} />;
}
