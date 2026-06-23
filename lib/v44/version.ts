/** MedScope v44 — region health probes + edge failover status */

import {
  getSiteVersionLabel as getV45SiteVersionLabel,
  getCompositeVersionLabel as getV45CompositeVersionLabel,
} from "@/lib/v45/version";

export const V44_ENGINE_VERSION = "44.0";
export const V44_UI_VERSION = "v44.0";
export const V44_UI_BUILD_STAMP = "v44.0-region-health-20260619";

export const V44_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42·43·44";

export function getSiteVersionLabel(): string {
  return getV45SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV45CompositeVersionLabel();
}
