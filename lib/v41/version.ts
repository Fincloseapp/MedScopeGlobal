/** MedScope v41 — OpenAI TTS engine, streaming routes */

import {
  getSiteVersionLabel as getV42SiteVersionLabel,
  getCompositeVersionLabel as getV42CompositeVersionLabel,
} from "@/lib/v42/version";

export const V41_ENGINE_VERSION = "41.0";
export const V41_UI_VERSION = "v41.0";
export const V41_UI_BUILD_STAMP = "v41.0-tts-repair-20260619";

export const V41_COMPOSITE_LABEL = "v33·34·35·36·37·38·39·40·41";

export function getSiteVersionLabel(): string {
  return getV42SiteVersionLabel();
}

export function getCompositeVersionLabel(): string {
  return getV42CompositeVersionLabel();
}
