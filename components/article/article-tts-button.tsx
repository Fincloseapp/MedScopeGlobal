"use client";

import { TtsListenButton } from "@/components/tts/tts-listen-button";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";

type Props = {
  title?: string;
  excerpt?: string;
  content?: string;
  locale?: string;
};

const TTS_LABEL: Record<string, string> = {
  cs: "Poslechnout článek",
  sk: "Vypočuť článok",
  de: "Artikel anhören",
  fr: "Écouter l’article",
  es: "Escuchar el artículo",
  it: "Ascolta l’articolo",
  pl: "Odsłuchaj artykuł",
  en: "Listen to the article",
};

function ttsLang(locale?: string): string {
  const tag = (locale ?? "cs").toLowerCase();
  if (tag.startsWith("cs")) return "cs-CZ";
  if (tag.startsWith("sk")) return "sk-SK";
  if (tag.startsWith("de")) return "de-DE";
  if (tag.startsWith("fr")) return "fr-FR";
  if (tag.startsWith("es")) return "es-ES";
  if (tag.startsWith("it")) return "it-IT";
  if (tag.startsWith("pl")) return "pl-PL";
  if (tag.startsWith("en")) return "en-US";
  return `${tag.split("-")[0]}-${tag.split("-")[0].toUpperCase()}`;
}

export function ArticleTtsButton({ excerpt, title, content, locale = "cs" }: Props) {
  const text = prepareArticleForSpeech({ title, excerpt, content });
  if (!text) return null;
  const primary = locale.toLowerCase().split("-")[0];
  const label = TTS_LABEL[primary] ?? TTS_LABEL.en;

  return (
    <TtsListenButton
      text={text}
      label={label}
      className="not-prose my-5"
      full
      lang={ttsLang(locale)}
      variant="editorial"
    />
  );
}
