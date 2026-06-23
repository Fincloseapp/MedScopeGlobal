/** MedScope v43 — real-time health monitoring + auto-heal stubs */

import {
  getSiteVersionLabel as getV44SiteVersionLabel,
  getCompositeVersionLabel as getV44CompositeVersionLabel,
} from "@/lib/v44/version";

export const V43_ENGINE_VERSION = "43.0";
export const V43_UI_VERSION = "v43.0";
export const V43_UI_BUILD_STAMP = "v43.0-health-monitor-20260619";

export const V43_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42·43";

export function getSiteVersionLabel(): string {
  return getV44SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV44CompositeVersionLabel();
}
