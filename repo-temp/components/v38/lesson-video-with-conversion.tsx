"use client";

import { LessonVideoPlayer } from "@/components/academy/lesson-video-player";
import { VideoConversionOverlay } from "@/components/v38/video-conversion-overlay";
import { getStaticCopy } from "@/lib/v38/conversion-copy";
import type { VideoAsset } from "@/types/academy";

type Props = {
  video: VideoAsset | null | undefined;
  lessonTitle: string;
  lessonContent?: string;
  courseTopic?: string;
  contentJson?: Record<string, unknown> | null;
  isVip: boolean;
  lessonIndex?: number;
  className?: string;
};

/** v38 — academy lesson video with optional conversion overlay */
export function LessonVideoWithConversion({
  video,
  lessonTitle,
  lessonContent,
  courseTopic,
  contentJson,
  isVip,
  lessonIndex = 0,
  className,
}: Props) {
  const copy = { ...getStaticCopy("video_overlay", lessonIndex), generatedBy: "static" as const };

  return (
    <VideoConversionOverlay copy={copy} enabled={!isVip} lessonIndex={lessonIndex}>
      <LessonVideoPlayer
        video={video}
        lessonTitle={lessonTitle}
        lessonContent={lessonContent}
        courseTopic={courseTopic}
        contentJson={contentJson}
        className={className}
      />
    </VideoConversionOverlay>
  );
}
