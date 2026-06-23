/** MedScope v35 — course platform + content validation; delegates to v36 */

import { getSiteVersionLabel as getV36SiteVersionLabel } from "@/lib/v36/version";

export const V35_ENGINE_VERSION = "35.0";
export const V35_UI_VERSION = "v35.0";
export const V35_UI_BUILD_STAMP = "v35.0-course-validation-20260620";

export function getSiteVersionLabel(): string {
  return getV36SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return `${V35_UI_VERSION} (courses+validation)`;
}
