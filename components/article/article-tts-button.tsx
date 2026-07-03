"use client";

import { TtsListenButton } from "@/components/tts/tts-listen-button";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";

type Props = {
  title?: string;
  excerpt?: string;
  content?: string;
};

/** Article read-aloud via Web Speech API — poslechová verze celého článku. */
export function ArticleTtsButton({ excerpt, title, content }: Props) {
  const text = prepareArticleForSpeech({ title, excerpt, content });
  if (!text) return null;

  return (
    <TtsListenButton
      text={text}
      label="Poslechnout článek"
      className="not-prose my-4"
      full
      lang="cs-CZ"
    />
  );
}
