/** MedScope v33 — navbar, video player, lesson UI repair */

export const V33_ENGINE_VERSION = "33.0";
export const V33_UI_VERSION = "v33.0";
export const V33_UI_BUILD_STAMP = "v33.0-navbar-video-ui-20260618";

/** Reliable interim MP4 for academy video fallback / DB repair */
export const V33_FALLBACK_MP4_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

export function getSiteVersionLabel(): string {
  return V33_UI_VERSION;
}

export function getCompositeVersionLabel(): string {
  return `${V33_UI_VERSION} (v32.0)`;
}
