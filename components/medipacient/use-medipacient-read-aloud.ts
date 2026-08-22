"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { splitForSpeech } from "@/lib/medipacient/read-aloud";

const LANG = "cs-CZ";
const RATE = 0.88;

function pickCzechVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  return (
    voices.find((v) => norm(v) === "cs-cz") ||
    voices.find((v) => norm(v).startsWith("cs")) ||
    voices.find((v) => /czech|cestina|čeština|jakub|vlasta|zuzana|anton/i.test(v.name))
  );
}

function waitForVoices(timeoutMs = 1500): Promise<void> {
  return new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length) {
      resolve();
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.setTimeout(done, timeoutMs);
  });
}

export function useMeDipacientReadAloud() {
  const [speaking, setSpeaking] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const generationRef = useRef(0);
  const keepAliveRef = useRef<number | null>(null);

  const clearKeepAlive = () => {
    if (keepAliveRef.current != null) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  };

  const stop = useCallback(() => {
    generationRef.current += 1;
    clearKeepAlive();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setUnsupported(true);
        return;
      }
      const chunks = splitForSpeech(text);
      if (!chunks.length) return;

      stop();
      const gen = generationRef.current;
      setSpeaking(true);
      await waitForVoices();
      if (gen !== generationRef.current) return;

      const voice = pickCzechVoice();
      keepAliveRef.current = window.setInterval(() => {
        if (!window.speechSynthesis.speaking) return;
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 8000);

      const speakChunk = (chunk: string) =>
        new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = LANG;
          utterance.rate = RATE;
          utterance.pitch = 1;
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang || LANG;
          }
          utterance.onend = () => resolve();
          utterance.onerror = () => reject(new Error("speech"));
          window.speechSynthesis.speak(utterance);
        });

      try {
        for (const chunk of chunks) {
          if (gen !== generationRef.current) return;
          try {
            await speakChunk(chunk);
          } catch {
            if (gen !== generationRef.current) return;
            break;
          }
        }
      } finally {
        if (gen === generationRef.current) {
          clearKeepAlive();
          setSpeaking(false);
        }
      }
    },
    [stop],
  );

  return { speaking, unsupported, speak, stop };
}
