"use client";

import { LessonVideoPlayer } from "@/components/academy/lesson-video-player";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  className?: string;
};

/** v34 — stable MP4 player (no TTS gate, no HLS complexity) */
export function LessonVideoPlayerV34({ video, lessonTitle, className }: Props) {
  return <LessonVideoPlayer video={video} lessonTitle={lessonTitle} className={className} />;
}
