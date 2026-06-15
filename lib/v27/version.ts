/** MedScope v27 — site version (single source of truth for UI) */
export const V27_ENGINE_VERSION = "27.0";
export const V27_EDITORIAL_VERSION = "27";
export const V27_UI_VERSION = "v27.0";
export const V27_UI_BUILD_STAMP = "v27.0-web-transformation-20260614";

/** Display label for homepage hero and UI badges */
export function getSiteVersionLabel(): string {
  return V27_UI_VERSION;
}
