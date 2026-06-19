/** Client-side OpenAI TTS playback via POST /api/tts */

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

function revokeActiveUrl() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

export async function speak(text: string, voice = "alloy"): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  revokeActiveUrl();

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed, voice }),
  });

  if (!res.ok) {
    throw new Error(`TTS failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  activeObjectUrl = url;

  const audio = new Audio(url);
  audio.playsInline = true;
  audio.preload = "auto";
  activeAudio = audio;

  audio.addEventListener("ended", () => {
    revokeActiveUrl();
    if (activeAudio === audio) activeAudio = null;
  });

  await audio.play();
}

export function stopSpeaking(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  revokeActiveUrl();
}
