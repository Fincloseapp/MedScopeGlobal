/** MedScope v38 — nav UX polish + subscription conversion engine; delegates to v39→v40 */

import {
  getSiteVersionLabel as getV39SiteVersionLabel,
  getCompositeVersionLabel as getV39CompositeVersionLabel,
} from "@/lib/v39/version";

export const V38_ENGINE_VERSION = "38.0";
export const V38_UI_VERSION = "v38.0";
export const V38_UI_BUILD_STAMP = "v38.0-conversion-nav-20260620";

export const V38_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40";

export function getSiteVersionLabel(): string {
  return getV39SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV39CompositeVersionLabel();
}
