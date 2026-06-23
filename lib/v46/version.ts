/** MedScope v46 — security engine (canonical site version) */

export const V46_ENGINE_VERSION = "46.0";
export const V46_UI_VERSION = "v46.0";
export const V46_UI_BUILD_STAMP = "v46.0-security-composite-20260619";

export const V46_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41·42·43·44·45·46";

/** Last known stable production SHA before v41-v46 deploy */
export const V46_LAST_STABLE_SHA = "6f38ee1";

export function getSiteVersionLabel(): string {
  return "";
}

export function getCompositeVersionLabel(): string {
  return V46_COMPOSITE_LABEL;
}
