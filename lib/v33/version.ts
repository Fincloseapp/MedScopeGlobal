/** MedScope v33 — navbar, video player, lesson UI repair; delegates to v34 */

import { getSiteVersionLabel as getV34SiteVersionLabel } from "@/lib/v34/version";

export const V33_ENGINE_VERSION = "33.0";
export const V33_UI_VERSION = "v33.0";
export const V33_UI_BUILD_STAMP = "v33.0-navbar-video-ui-20260618";

/** Reliable interim MP4 for academy video fallback / DB repair */
export const V33_FALLBACK_MP4_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

export function getSiteVersionLabel(): string {
  return getV34SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return "v33·34·35·36·37·38";
}
