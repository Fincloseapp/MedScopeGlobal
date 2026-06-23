/** MedScope v36 — video watch analytics (consent/anonymized per /privacy#video-analytics); delegates to v37 */

import { getSiteVersionLabel as getV37SiteVersionLabel } from "@/lib/v37/version";

export const V36_ENGINE_VERSION = "36.0";
export const V36_UI_VERSION = "v36.0";
export const V36_UI_BUILD_STAMP = "v36.0-video-analytics-20260620";

export function getSiteVersionLabel(): string {
  return getV37SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return `${V36_UI_VERSION} (analytics)`;
}
