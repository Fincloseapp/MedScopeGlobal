"use client";

import { LessonVideoPlayerV34 } from "@/components/academy/lesson-video-player-v34";
import { VideoConversionOverlay } from "@/components/v38/video-conversion-overlay";
import { getStaticCopy } from "@/lib/v38/conversion-copy";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  isVip: boolean;
  lessonIndex?: number;
  className?: string;
};

/** v38 — academy lesson video with optional conversion overlay */
export function LessonVideoWithConversion({
  video,
  lessonTitle,
  isVip,
  lessonIndex = 0,
  className,
}: Props) {
  const copy = { ...getStaticCopy("video_overlay", lessonIndex), generatedBy: "static" as const };

  return (
    <VideoConversionOverlay copy={copy} enabled={!isVip} lessonIndex={lessonIndex}>
      <LessonVideoPlayerV34 video={video} lessonTitle={lessonTitle} className={className} />
    </VideoConversionOverlay>
  );
}
