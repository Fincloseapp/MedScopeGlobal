/** Client TTS — tries /api/tts audio; falls back to Web Speech API (no OpenAI required). */

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function revokeActiveUrl() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

function stopWebSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

function speakWithWebSpeech(text: string, lang = "cs-CZ"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Web Speech API unavailable"));
      return;
    }

    stopWebSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.onend = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      reject(new Error("Web Speech synthesis failed"));
    };
    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string, voice = "alloy"): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  stopWebSpeech();
  revokeActiveUrl();

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed, voice }),
  });

  if (!res.ok) {
    return speakWithWebSpeech(trimmed);
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = (await res.json()) as { mode?: string; text?: string; lang?: string };
    if (json.mode === "browser" && json.text) {
      return speakWithWebSpeech(json.text, json.lang ?? "cs-CZ");
    }
    return speakWithWebSpeech(trimmed);
  }

  const blob = await res.blob();
  if (!blob.size) {
    return speakWithWebSpeech(trimmed);
  }

  const url = URL.createObjectURL(blob);
  activeObjectUrl = url;

  const audio = new Audio(url);
  audio.setAttribute("playsinline", "");
  audio.preload = "auto";
  activeAudio = audio;

  audio.addEventListener("ended", () => {
    revokeActiveUrl();
    if (activeAudio === audio) activeAudio = null;
  });

  try {
    await audio.play();
  } catch {
    revokeActiveUrl();
    activeAudio = null;
    return speakWithWebSpeech(trimmed);
  }
}

export function stopSpeaking(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  stopWebSpeech();
  revokeActiveUrl();
}
