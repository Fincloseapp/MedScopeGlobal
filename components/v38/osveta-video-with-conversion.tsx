"use client";

import { OsvetaVideoPlayer } from "@/components/verejnost/osveta-video-player";
import { VideoConversionOverlay } from "@/components/v38/video-conversion-overlay";
import { getStaticCopy } from "@/lib/v38/conversion-copy";
import type { PublicHealthQuiz, PublicHealthVideoWithTopic } from "@/types/public-osveta";

type Props = {
  video: PublicHealthVideoWithTopic;
  quiz: PublicHealthQuiz | null;
  isVip: boolean;
};

/** v38 — public osvěta video with soft conversion gate */
export function OsvetaVideoWithConversion({ video, quiz, isVip }: Props) {
  const copy = { ...getStaticCopy("video_overlay"), generatedBy: "static" as const };

  return (
    <VideoConversionOverlay copy={copy} enabled={!isVip}>
      <OsvetaVideoPlayer video={video} quiz={quiz} />
    </VideoConversionOverlay>
  );
}
