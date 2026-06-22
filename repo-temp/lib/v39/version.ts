/** MedScope v39 — AI medical review engine; delegates site label to v40 */

import {
  getSiteVersionLabel as getV40SiteVersionLabel,
  getCompositeVersionLabel as getV40CompositeVersionLabel,
} from "@/lib/v40/version";

export const V39_ENGINE_VERSION = "39.0";
export const V39_UI_VERSION = "v39.0";
export const V39_UI_BUILD_STAMP = "v39.0-medical-review-20260622";

export const V39_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40";

export function getSiteVersionLabel(): string {
  return getV40SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV40CompositeVersionLabel();
}
