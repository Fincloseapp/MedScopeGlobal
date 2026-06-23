/** Per-page session voice — random male/female on load, overridable via picker. */

import type { VoiceGender } from "@/lib/tts/voice-picker";

const SESSION_KEY = "medscope-tts-session-gender";
const OVERRIDE_KEY = "medscope-tts-voice-gender";

function randomGender(): "male" | "female" {
  return Math.random() < 0.5 ? "male" : "female";
}

export function initSessionVoice(): "male" | "female" {
  if (typeof window === "undefined") return "female";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing === "male" || existing === "female") return existing;
    const picked = randomGender();
    sessionStorage.setItem(SESSION_KEY, picked);
    return picked;
  } catch {
    return randomGender();
  }
}

export function getSessionVoice(): "male" | "female" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(SESSION_KEY);
    if (v === "male" || v === "female") return v;
  } catch {
    /* ignore */
  }
  return null;
}

/** Effective gender: user override (localStorage) > session random > auto picks session. */
export function getEffectiveVoiceGender(): VoiceGender {
  if (typeof window === "undefined") return "auto";
  try {
    const override = localStorage.getItem(OVERRIDE_KEY);
    if (override === "male" || override === "female") return override;
  } catch {
    /* ignore */
  }
  const session = getSessionVoice();
  if (session) return session;
  return initSessionVoice();
}

export function setUserVoiceOverride(gender: VoiceGender): void {
  try {
    if (gender === "auto") {
      localStorage.removeItem(OVERRIDE_KEY);
    } else {
      localStorage.setItem(OVERRIDE_KEY, gender);
    }
  } catch {
    /* ignore */
  }
}

export function getUserVoiceOverride(): VoiceGender {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    if (v === "male" || v === "female" || v === "auto") return v;
  } catch {
    /* ignore */
  }
  return "auto";
}
