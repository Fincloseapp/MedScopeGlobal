/** MedScope v28.2 — site version (single source of truth for UI) */

export const V28_ENGINE_VERSION = "28.2";

export const V28_EDITORIAL_VERSION = "28";

export const V28_UI_VERSION = "v28.2";

export const V28_UI_BUILD_STAMP = "v28.2-stripe-webhook-health-20260617";

/** Display label for homepage hero and UI badges */
export function getSiteVersionLabel(): string {
  return V28_UI_VERSION;
}

/** Editorial copy label — v28 standard */
export const V28_EDITORIAL_COPY_LABEL =
  "přepsané podle redakčního standardu MedScopeGlobal v28";
