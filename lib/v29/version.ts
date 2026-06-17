/** MedScope v29.0 — site version (single source of truth for UI) */

export const V29_ENGINE_VERSION = "29.0";

export const V29_EDITORIAL_VERSION = "29";

export const V29_UI_VERSION = "v29.0";

export const V29_UI_BUILD_STAMP = "v29.0-phase11-finalization-20260617";

/** Display label for homepage hero, footer, and UI badges */
export function getSiteVersionLabel(): string {
  return V29_UI_VERSION;
}

/** Editorial copy label — v29 standard */
export const V29_EDITORIAL_COPY_LABEL =
  "přepsané podle redakčního standardu MedScopeGlobal v29";
