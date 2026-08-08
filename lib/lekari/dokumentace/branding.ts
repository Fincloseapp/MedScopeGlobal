/** Public product brand for the physician documentation app */
export const DOKSCOPE = {
  shortName: "DokScope",
  productName: "DokScope",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  pwaShortName: "DokScope",
  pwaName: "DokScope · MedScopeGlobal",
  tagline: "AI zápisy pro ordinaci",
  get fullName() {
    return `${this.productName} od ${this.provider}`;
  },
  get lockline() {
    return `${this.productName} · ${this.domain}`;
  },
  get subtitle() {
    return `${this.tagline} od ${this.provider}`;
  },
  get seoTitle() {
    return `${this.productName} — AI zápisy pro lěkaře | ${this.provider}`;
  },
  get seoDescription() {
    return `${this.productName} od ${this.provider}: nahrávka nebo diktát → strukturovaný klinický zápis. Aplikace na ${this.domain}, 390 Kč/měsíc.`;
  },
} as const;
