/** Canonical photography for MedScope B2B Tržiště / Exchange. */

export const EXCHANGE_ASSET_V = "b2b-trziste-20260911";

const ROOT = "/assets/marketing/exchange";

function v(src: string) {
  return `${src}?v=${EXCHANGE_ASSET_V}`;
}

export const EXCHANGE_VISUAL = {
  hero: v(`${ROOT}/hero.webp`),
  manufacturers: v(`${ROOT}/manufacturers.webp`),
  hospitals: v(`${ROOT}/hospitals.webp`),
  laboratories: v(`${ROOT}/laboratories.webp`),
  diagnostics: v(`${ROOT}/diagnostics.webp`),
  telemedicine: v(`${ROOT}/telemedicine.webp`),
} as const;

export type ExchangeVisualKey = keyof typeof EXCHANGE_VISUAL;
