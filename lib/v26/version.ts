/** MedScope v26 — editorial engine + site version (single source of truth) */
export const V26_ENGINE_VERSION = "26.1";
export const V26_EDITORIAL_VERSION = "26";
export const V26_UI_VERSION = "v26.1";
export const V26_UI_BUILD_STAMP = "v26.1-nav-images-20260614";

/** Display label for homepage hero and UI badges */
export function getSiteVersionLabel(): string {
  return V26_UI_VERSION;
}
