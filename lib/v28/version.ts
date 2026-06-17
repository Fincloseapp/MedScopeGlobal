/** MedScope v28 — backward-compat layer; site UI delegates to v29 */

import {
  V29_EDITORIAL_COPY_LABEL,
  V29_UI_BUILD_STAMP,
  V29_UI_VERSION,
  getSiteVersionLabel as getV29SiteVersionLabel,
} from "@/lib/v29/version";

export const V28_ENGINE_VERSION = "28.2";

export const V28_EDITORIAL_VERSION = "28";

/** Live site UI label — delegates to v29 (no stale v28.2 in HTML) */
export const V28_UI_VERSION = V29_UI_VERSION;

export const V28_UI_BUILD_STAMP = V29_UI_BUILD_STAMP;

/** Display label for homepage hero and UI badges — v29.0 */
export function getSiteVersionLabel(): string {
  return getV29SiteVersionLabel();
}

export const V28_EDITORIAL_COPY_LABEL = V29_EDITORIAL_COPY_LABEL;

/** Current site UI version (v29) for callers that need the live label */
export const V28_SITE_UI_VERSION = V29_UI_VERSION;
