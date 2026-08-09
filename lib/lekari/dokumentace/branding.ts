/** Public product brand for the physician documentation app */
export const MEDIKTOR = {
  shortName: "MeDiktor",
  productName: "MeDiktor",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  pwaShortName: "MeDiktor",
  pwaName: "MeDiktor · MedScopeGlobal",
  /** Short line under logo / banners — dictation-first */
  tagline: "Diktujte v mobilu — zápis píše MeDiktor",
  /** One-sentence pitch for banners — mic/dictation primary */
  pitch:
    "Diktujte do telefonu (mikrofon má každý lékař) → odborná anamnéza a klinický zápis. Volitelně i nahrávka konzultace s pacientem.",
  priceMonthlyCzk: 390,
  assets: {
    /** Full marketing render of the app icon */
    appIcon: "/assets/mediktor/app-icon.png",
    icon192: "/assets/mediktor/icon-192.png",
    icon512: "/assets/mediktor/icon-512.png",
    appleTouch: "/assets/mediktor/apple-touch-icon.png",
    lockup: "/assets/mediktor/logo-lockup.png",
  },
  routes: {
    marketing: "/lekari/dokumentace",
    app: "/app/dokumentace",
  },
  get fullName() {
    return `${this.productName} od ${this.provider}`;
  },
  get lockline() {
    return `${this.productName} · ${this.domain}`;
  },
  get subtitle() {
    return `${this.tagline} · ${this.provider}`;
  },
  get seoTitle() {
    return `${this.productName} — AI zápisy a anamnéza pro lékaře | ${this.provider}`;
  },
  get seoDescription() {
    return `${this.productName} od ${this.provider}: diktování do mobilu → strukturovaný odborný zápis. Volitelně nahrávka konzultace. Stáhněte na ${this.domain}, ${this.priceMonthlyCzk} Kč/měsíc, 14 dní zdarma.`;
  },
} as const;

/** @deprecated Use MEDIKTOR */
export const DOKSCOPE = MEDIKTOR;
