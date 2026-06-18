/** MedScope v40 — AI video engine; delegates site label to v41-v46 chain */

import {
  getSiteVersionLabel as getV41SiteVersionLabel,
  getCompositeVersionLabel as getV41CompositeVersionLabel,
} from "@/lib/v41/version";

export const V40_ENGINE_VERSION = "40.0";
export const V40_UI_VERSION = "v40.0";
export const V40_UI_BUILD_STAMP = "v40.0-video-course-audit-20260622";

export const V40_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42·43·44·45·46";

export function getSiteVersionLabel(): string {
  return getV41SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV41CompositeVersionLabel();
}
