"use client";

import { OsvetaVideoPlayer } from "@/components/verejnost/osveta-video-player";
import { VideoConversionOverlay } from "@/components/v38/video-conversion-overlay";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import type { PublicHealthQuiz, PublicHealthVideoWithTopic } from "@/types/public-osveta";

type Props = {
  video: PublicHealthVideoWithTopic;
  quiz: PublicHealthQuiz | null;
  isVip: boolean;
  locale?: string;
};

/** v38 — public osvěta video with soft conversion gate */
export function OsvetaVideoWithConversion({ video, quiz, isVip, locale = "cs" }: Props) {
  const chrome = getVerejnostChrome(locale);
  const copy = {
    slot: "video_overlay" as const,
    eyebrow: chrome.videoOverlayEyebrow,
    headline: chrome.videoOverlayHeadline,
    body: chrome.videoOverlayBody,
    ctaLabel: chrome.videoOverlayCta,
    ctaHref: localizePublicHref("/predplatne#public", locale),
    hint: chrome.videoOverlayHint,
    generatedBy: "static" as const,
  };

  return (
    <VideoConversionOverlay
      copy={copy}
      enabled={!isVip}
      dialogAria={chrome.videoGateAria}
      continueLabel={chrome.videoGateContinue}
    >
      <OsvetaVideoPlayer video={video} quiz={quiz} locale={locale} />
    </VideoConversionOverlay>
  );
}
