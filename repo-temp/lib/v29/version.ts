/** MedScope v29.0 — health/compat layer; live UI delegates to v32 */

import {
  V32_UI_VERSION,
} from "@/lib/v32/version";

export const V29_ENGINE_VERSION = "29.0";

export const V29_EDITORIAL_VERSION = "29";

export const V29_UI_VERSION = "v29.0";

export const V29_UI_BUILD_STAMP = "v29.0-phase11-finalization-20260617";

/** Live site UI label — v32.0 (security + performance + autopilot) */
export const V29_SITE_UI_VERSION = V32_UI_VERSION;

/** Display label for homepage hero, footer, and UI badges (hidden from public UI) */
export function getSiteVersionLabel(): string {
  return "";
}

/** Editorial copy label — redakční standard MedScopeGlobal */
export const V29_EDITORIAL_COPY_LABEL =
  "přepsané podle redakčního standardu MedScopeGlobal";
