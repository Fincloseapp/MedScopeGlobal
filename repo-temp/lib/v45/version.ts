/** MedScope v45 — self-tuning performance analyzer */

import {
  getSiteVersionLabel as getV46SiteVersionLabel,
  getCompositeVersionLabel as getV46CompositeVersionLabel,
} from "@/lib/v46/version";

export const V45_ENGINE_VERSION = "45.0";
export const V45_UI_VERSION = "v45.0";
export const V45_UI_BUILD_STAMP = "v45.0-performance-20260619";

export const V45_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42·43·44·45";

export function getSiteVersionLabel(): string {
  return getV46SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV46CompositeVersionLabel();
}
