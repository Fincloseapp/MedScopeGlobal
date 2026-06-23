/** MedScope v37 — AI content quality engine; delegates site label to v38 */

import {
  getSiteVersionLabel as getV38SiteVersionLabel,
  getCompositeVersionLabel as getV38CompositeVersionLabel,
} from "@/lib/v38/version";

export const V37_ENGINE_VERSION = "37.0";
export const V37_UI_VERSION = "v37.0";
export const V37_UI_BUILD_STAMP = "v37.0-quality-engine-20260620";

export const V37_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40";

export function getSiteVersionLabel(): string {
  return getV38SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV38CompositeVersionLabel();
}
