/** Client prefs for the MeDipacient PWA shell (/app/pacient). */

export const MP_TEXT_SIZE_KEY = "mp_text_size";
export const MP_ONBOARDING_KEY = "mp_onboarding_done";

export type MpTextSize = "normal" | "larger" | "largest";

export const MP_TEXT_SIZE_OPTIONS: { id: MpTextSize; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "larger", label: "Větší" },
  { id: "largest", label: "Největší" },
];

/** Root font-size while the pacient shell is open (scales rem / Tailwind). */
export const MP_TEXT_SIZE_ROOT: Record<MpTextSize, string> = {
  normal: "",
  larger: "125%",
  largest: "150%",
};

export function parseMpTextSize(raw: string | null | undefined): MpTextSize {
  if (raw === "larger" || raw === "largest") return raw;
  return "normal";
}

export function readMpTextSize(): MpTextSize {
  try {
    return parseMpTextSize(window.localStorage.getItem(MP_TEXT_SIZE_KEY));
  } catch {
    return "normal";
  }
}

export function writeMpTextSize(size: MpTextSize) {
  try {
    window.localStorage.setItem(MP_TEXT_SIZE_KEY, size);
  } catch {
    /* private mode */
  }
}

export function applyMpTextSize(size: MpTextSize) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-mp-text-size", size);
  html.style.fontSize = MP_TEXT_SIZE_ROOT[size] || "";
}

export function clearMpTextSizeFromDocument() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.removeAttribute("data-mp-text-size");
  html.style.fontSize = "";
}

export function isMpOnboardingDone(): boolean {
  try {
    return window.localStorage.getItem(MP_ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markMpOnboardingDone() {
  try {
    window.localStorage.setItem(MP_ONBOARDING_KEY, "1");
  } catch {
    /* private mode */
  }
}
