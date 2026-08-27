/** Per-page session voice — one fixed gender (no multi-voice UI). */

import type { VoiceGender } from "@/lib/tts/voice-picker";

const SESSION_KEY = "medscope-tts-session-gender";
const OVERRIDE_KEY = "medscope-tts-voice-gender";

/** Single default voice for article/read-aloud — Czech neural female. */
const DEFAULT_GENDER: "male" | "female" = "female";

export function initSessionVoice(): "male" | "female" {
  if (typeof window === "undefined") return DEFAULT_GENDER;
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing === "male" || existing === "female") return existing;
    sessionStorage.setItem(SESSION_KEY, DEFAULT_GENDER);
    return DEFAULT_GENDER;
  } catch {
    return DEFAULT_GENDER;
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

/** Effective gender: prefer fixed session voice (single voice policy). */
export function getEffectiveVoiceGender(): VoiceGender {
  if (typeof window === "undefined") return DEFAULT_GENDER;
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
  if (typeof window === "undefined") return DEFAULT_GENDER;
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    if (v === "male" || v === "female" || v === "auto") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_GENDER;
}
