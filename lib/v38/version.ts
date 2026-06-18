/** MedScope v38 — nav UX polish + subscription conversion engine; canonical site version */

export const V38_ENGINE_VERSION = "38.0";
export const V38_UI_VERSION = "v38.0";
export const V38_UI_BUILD_STAMP = "v38.0-conversion-nav-20260620";

export const V38_COMPOSITE_LABEL = "v33·34·35·36·37·38";

export function getSiteVersionLabel(): string {
  return V38_UI_VERSION;
}

export function getCompositeVersionLabel(): string {
  return V38_COMPOSITE_LABEL;
}
