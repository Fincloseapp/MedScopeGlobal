/** MedScope v27 — site version (single source of truth for UI) */
export const V27_ENGINE_VERSION = "27.1";
export const V27_EDITORIAL_VERSION = "27";
export const V27_UI_VERSION = "v27.1";
export const V27_UI_BUILD_STAMP = "v27.1-homepage-restructure-20260615";

/** Display label for homepage hero and UI badges */
export function getSiteVersionLabel(): string {
  return V27_UI_VERSION;
}
