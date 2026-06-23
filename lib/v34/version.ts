/** MedScope v34 — full video engine; delegates site label to v35 */

import { getSiteVersionLabel as getV35SiteVersionLabel } from "@/lib/v35/version";

export const V34_ENGINE_VERSION = "34.0";
export const V34_UI_VERSION = "v34.0";
export const V34_UI_BUILD_STAMP = "v34.0-video-engine-20260620";

export function getSiteVersionLabel(): string {
  return getV35SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return `${V34_UI_VERSION} (video-engine)`;
}
