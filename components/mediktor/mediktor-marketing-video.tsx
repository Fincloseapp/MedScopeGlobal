"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Volume2, X } from "lucide-react";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { pickVoice } from "@/lib/tts/voice-picker";

const STORAGE_KEY = "mediktor_video_seen_v1";

type Scene = {
  id: string;
  image: string;
  objectPosition: string;
  title: string;
  /** On-screen caption (brand casing). */
  vo: string;
  /** Spoken line for TTS / captions sync (natural spisovná čeština). */
  spoken: string;
  audioSrc: string;
  /** Max wait if audio hangs; scene advances after audio ends sooner. */
  durationMs: number;
};

/**
 * Five-scene marketing VO — spisovná, plynulá čeština as a human narrator would read.
 * Audio: prebaked Edge TTS cs-CZ-VlastaNeural (female) under /mediktor/vo/.
 */
const SCENES: Scene[] = [
  {
    id: "tired",
    image: MEDIKTOR.assets.heroFlyer,
    objectPosition: "50% 28%",
    title: "Lékař unavený z psaní",
    vo: "Psaní anamnézy zabírá lékařům desítky minut denně.",
    spoken: "Psaní anamnézy zabírá lékařům desítky minut denně.",
    audioSrc: "/mediktor/vo/01-tired.mp3",
    durationMs: 5500,
  },
  {
    id: "start",
    image: MEDIKTOR.assets.mascotPanel,
    objectPosition: "50% 45%",
    title: "Zapne MeDiktor",
    vo: "MeDiktor zapisuje za vás.",
    spoken: "Mediktor zapisuje za vás.",
    audioSrc: "/mediktor/vo/02-start.mp3",
    durationMs: 4000,
  },
  {
    id: "dictate",
    image: MEDIKTOR.assets.bannerDictate,
    objectPosition: "50% 40%",
    title: "Diktuje — text se zapisuje",
    vo: "Stačí mluvit. MeDiktor píše.",
    spoken: "Stačí mluvit. Mediktor píše.",
    audioSrc: "/mediktor/vo/03-dictate.mp3",
    durationMs: 5000,
  },
  {
    id: "done",
    image: MEDIKTOR.assets.heroFlyer,
    objectPosition: "50% 72%",
    title: "Hotová anamnéza",
    vo: "Rychlejší práce. Méně psaní. Více péče.",
    spoken: "Rychlejší práce. Méně psaní. Více péče.",
    audioSrc: "/mediktor/vo/04-done.mp3",
    durationMs: 6500,
  },
  {
    id: "cta",
    image: MEDIKTOR.assets.bannerDownload,
    objectPosition: "50% 45%",
    title: "Stáhněte si MeDiktor",
    vo: "Stáhněte si MeDiktor a začněte diktovat.",
    spoken: "Stáhněte si Mediktor a začněte diktovat.",
    audioSrc: "/mediktor/vo/05-cta.mp3",
    durationMs: 5000,
  },
];

const SCENE_GAP_MS = 420;
const WEB_SPEECH_RATE = 0.92;
const WEB_SPEECH_PITCH = 1.05;

const MALE_NAME =
  /male|muž|muz|\bman\b|jakub|ondřej|ondrej|anton[ií]n|libor|josef|pavel|martin|microsoft\s+jakub|microsoft\s+anton/i;
const FEMALE_NAME =
  /female|žena|zena|woman|zuzana|vlasta|ivona|eliska|eliška|tereza|barbora|petra|elena|marie|jana|nova|shimmer|microsoft\s+zuzana|microsoft\s+vlasta|google.*(cs|czech|čeština|cestina)/i;

/** Force female cs-CZ (prefer Zuzana / Vlasta / Google čeština); never pick a known male voice. */
function pickFemaleCzechVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = pickVoice("female", "cs-CZ", voices);
  if (preferred && !MALE_NAME.test(preferred.name)) return preferred;

  const isCs = (v: SpeechSynthesisVoice) =>
    /cs(-|_|$)/i.test(v.lang) || /czech|čeština|cestina|vlasta|zuzana/i.test(v.name);
  const isSk = (v: SpeechSynthesisVoice) => /sk(-|_|$)/i.test(v.lang) || /slovak/i.test(v.name);
  const label = (v: SpeechSynthesisVoice) =>
    `${v.name} ${(v as SpeechSynthesisVoice & { gender?: string }).gender ?? ""}`;

  const cs = voices.filter(isCs);
  const sk = voices.filter(isSk);
  const femaleCs = cs.find((v) => FEMALE_NAME.test(label(v)));
  if (femaleCs) return femaleCs;
  const nonMaleCs = cs.find((v) => !MALE_NAME.test(v.name));
  if (nonMaleCs) return nonMaleCs;
  const femaleSk = sk.find((v) => FEMALE_NAME.test(label(v)));
  if (femaleSk) return femaleSk;
  return sk.find((v) => !MALE_NAME.test(v.name)) ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let activeNarrationAudio: HTMLAudioElement | null = null;

function stopActiveAudio() {
  if (!activeNarrationAudio) return;
  try {
    activeNarrationAudio.pause();
    activeNarrationAudio.removeAttribute("src");
    activeNarrationAudio.load();
  } catch {
    /* ignore */
  }
  activeNarrationAudio = null;
}

function playHtmlAudio(src: string, signal: { cancelled: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || signal.cancelled) {
      resolve(false);
      return;
    }
    stopActiveAudio();
    const audio = new Audio(src);
    activeNarrationAudio = audio;
    audio.preload = "auto";
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearInterval(watch);
      if (activeNarrationAudio === audio) activeNarrationAudio = null;
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        /* ignore */
      }
      resolve(ok);
    };
    const watch = window.setInterval(() => {
      if (signal.cancelled) finish(false);
    }, 100);
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    void audio.play().then(
      () => {
        if (signal.cancelled) finish(false);
      },
      () => finish(false),
    );
  });
}

async function fetchNeuralFemaleLine(
  text: string,
  signal: { cancelled: boolean },
): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, lang: "cs-CZ", gender: "female" }),
    });
    if (signal.cancelled || !res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("audio")) return false;
    const buf = await res.arrayBuffer();
    if (signal.cancelled || !buf.byteLength) return false;
    const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
    const ok = await playHtmlAudio(url, signal);
    URL.revokeObjectURL(url);
    return ok;
  } catch {
    return false;
  }
}

function speakWebSpeechFemale(
  text: string,
  voice: SpeechSynthesisVoice | null,
  signal: { cancelled: boolean },
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis || signal.cancelled) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "cs-CZ";
    if (voice && !MALE_NAME.test(voice.name)) {
      u.voice = voice;
      u.lang = voice.lang || "cs-CZ";
    }
    u.rate = WEB_SPEECH_RATE;
    u.pitch = WEB_SPEECH_PITCH;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

async function narrateScene(
  scene: Scene,
  voice: SpeechSynthesisVoice | null,
  signal: { cancelled: boolean },
): Promise<void> {
  if (signal.cancelled) return;

  // 1) Prefers baked female Edge TTS mp3 (human-like, consistent).
  const baked = await playHtmlAudio(scene.audioSrc, signal);
  if (baked || signal.cancelled) return;

  // 2) Live Edge neural female via /api/tts.
  const neural = await fetchNeuralFemaleLine(scene.spoken, signal);
  if (neural || signal.cancelled) return;

  // 3) Web Speech — female cs-CZ only.
  await Promise.race([
    speakWebSpeechFemale(scene.spoken, voice, signal),
    sleep(scene.durationMs),
  ]);
}

export function MediktorMarketingVideo() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const signalRef = useRef({ cancelled: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadVoices = () => {
      voiceRef.current = pickFemaleCzechVoice();
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);

    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) {
      setOpen(true);
      setNeedsTap(true);
    }
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis?.cancel();
      stopActiveAudio();
      cancelRef.current = true;
      signalRef.current.cancelled = true;
    };
  }, []);

  const close = useCallback(() => {
    cancelRef.current = true;
    signalRef.current.cancelled = true;
    window.speechSynthesis?.cancel();
    stopActiveAudio();
    setPlaying(false);
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const runSequence = useCallback(async () => {
    cancelRef.current = false;
    signalRef.current = { cancelled: false };
    setPlaying(true);
    setNeedsTap(false);
    setProgress(0);
    voiceRef.current = pickFemaleCzechVoice();

    for (let i = 0; i < SCENES.length; i++) {
      if (cancelRef.current || signalRef.current.cancelled) return;
      setSceneIdx(i);
      setProgress(((i + 0.15) / SCENES.length) * 100);
      const scene = SCENES[i]!;
      await narrateScene(scene, voiceRef.current, signalRef.current);
      if (cancelRef.current || signalRef.current.cancelled) return;
      await sleep(SCENE_GAP_MS);
      setProgress(((i + 1) / SCENES.length) * 100);
    }
    if (!cancelRef.current) {
      setPlaying(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, []);

  const scene = SCENES[sceneIdx] ?? SCENES[0]!;

  return (
    <>
      <section id="video" className="border-b border-[#d9e8f4] bg-[#021d33]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              Podívejte se · 30 sekund
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Od diktátu k hotové anamnéze
            </h2>
            <p className="mt-2 text-sm leading-6 text-sky-100/90">
              Krátké video MeDiktor se zvukem — jak lékaři ušetří desítky minut denně.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setNeedsTap(true);
              setSceneIdx(0);
              setProgress(0);
            }}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#22a05a] px-6 text-sm font-semibold text-white hover:bg-[#1b874b]"
          >
            <Play className="h-4 w-4 fill-current" />
            Přehrát video MeDiktor
          </button>
        </div>
      </section>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#021d33]/92 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Video MeDiktor"
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#031a2c] shadow-2xl">
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
                aria-label="Zavřít video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#021d33]">
              <Image
                key={scene.id}
                src={scene.image}
                alt={scene.title}
                fill
                priority
                className="object-cover transition-opacity duration-500"
                style={{ objectPosition: scene.objectPosition }}
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#021d33] via-[#021d33]/35 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                  {MEDIKTOR.shortName}
                </p>
                <p className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                  {scene.title}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-sky-50/95 sm:text-base">
                  {scene.vo}
                </p>
              </div>

              {!playing || needsTap ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-4">
                  <button
                    type="button"
                    onClick={() => void runSequence()}
                    className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/25 bg-[#021d33]/85 px-6 py-6 text-center text-white shadow-xl backdrop-blur"
                  >
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#22a05a]">
                      <Play className="h-7 w-7 fill-current" />
                    </span>
                    <span className="font-display text-lg font-bold">Přehrát video MeDiktor</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-sky-100/90">
                      <Volume2 className="h-3.5 w-3.5" />
                      Se zvukem · cca 30 s · klepněte pro start
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="h-1 bg-white/10">
              <div
                className="h-full bg-[#22a05a] transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <p className="text-xs text-sky-100/80">
                Scéna {sceneIdx + 1}/{SCENES.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {!playing ? (
                  <button
                    type="button"
                    onClick={() => void runSequence()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#22a05a] px-4 text-xs font-semibold text-white hover:bg-[#1b874b]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Přehrát se zvukem
                  </button>
                ) : null}
                <Link
                  href={MEDIKTOR.routes.app}
                  onClick={close}
                  className="inline-flex h-9 items-center rounded-full border border-white/30 px-4 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Vyzkoušet aplikaci
                </Link>
                <a
                  href="#stahnout"
                  onClick={close}
                  className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-[#021d33] hover:bg-sky-50"
                >
                  Stáhnout
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
