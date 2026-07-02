"use client";

import { TtsListenButton } from "@/components/tts/tts-listen-button";

type Props = {
  excerpt: string;
  title?: string;
};

/** Article audio preview via Web Speech API (/api/tts browser mode) */
export function ArticleTtsButton({ excerpt, title }: Props) {
  const text = excerpt.trim();
  if (!text) return null;

  return (
    <TtsListenButton
      text={title ? `${title}. ${text}` : text}
      label="Poslechnout článek"
      className="not-prose my-4"
      maxChars={4096}
    />
  );
}
