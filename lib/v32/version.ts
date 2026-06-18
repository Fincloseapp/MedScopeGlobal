/** MedScope v32 — AI autopilot + composite site version */

import { V30_UI_VERSION } from "@/lib/v30/version";
import { V31_UI_VERSION } from "@/lib/v31/version";
import { V33_UI_VERSION, getSiteVersionLabel as getV33SiteVersionLabel } from "@/lib/v33/version";

export const V32_ENGINE_VERSION = "32.0";
export const V32_UI_VERSION = "v32.0";

/** Live site UI label — delegates to v33 */
export const V32_SITE_UI_VERSION = V33_UI_VERSION;

/** Composite label for homepage/footer */
export const V32_COMPOSITE_LABEL = "v30·31·32·33";

export function getSiteVersionLabel(): string {
  return getV33SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return `${V32_UI_VERSION} (${V30_UI_VERSION}+${V31_UI_VERSION})`;
}

export const V32_UI_BUILD_STAMP = "v32.0-autopilot-20260619";
