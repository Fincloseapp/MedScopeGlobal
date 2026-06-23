/** MedScope v42 — API key rotation monitoring (manual regen required) */

import {
  getSiteVersionLabel as getV43SiteVersionLabel,
  getCompositeVersionLabel as getV43CompositeVersionLabel,
} from "@/lib/v43/version";

export const V42_ENGINE_VERSION = "42.0";
export const V42_UI_VERSION = "v42.0";
export const V42_UI_BUILD_STAMP = "v42.0-key-rotation-20260619";

export const V42_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42";

export function getSiteVersionLabel(): string {
  return getV43SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV43CompositeVersionLabel();
}
