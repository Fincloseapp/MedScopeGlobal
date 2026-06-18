/** MedScope v37 — AI content quality engine; canonical site version */

export const V37_ENGINE_VERSION = "37.0";
export const V37_UI_VERSION = "v37.0";
export const V37_UI_BUILD_STAMP = "v37.0-quality-engine-20260620";

export const V37_COMPOSITE_LABEL = "v33·34·35·36·37";

export function getSiteVersionLabel(): string {
  return V37_UI_VERSION;
}

export function getCompositeVersionLabel(): string {
  return V37_COMPOSITE_LABEL;
}
