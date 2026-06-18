/** MedScope v40 — AI video engine, course generation, validation, audit; canonical site version */

export const V40_ENGINE_VERSION = "40.0";
export const V40_UI_VERSION = "v40.0";
export const V40_UI_BUILD_STAMP = "v40.0-video-course-audit-20260622";

export const V40_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40";

export function getSiteVersionLabel(): string {
  return V40_UI_VERSION;
}

export function getCompositeVersionLabel(): string {
  return V40_COMPOSITE_LABEL;
}
