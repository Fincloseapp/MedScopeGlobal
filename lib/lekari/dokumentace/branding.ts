/** Public product brand for the physician documentation app */
export const ORDIZAPIS = {
  shortName: "OrdiZapis",
  productName: "OrdiZapis",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  pwaShortName: "OrdiZapis",
  pwaName: "OrdiZapis · MedScopeGlobal",
  /** Short line under logo / banners — mobile mic for dictation + consult */
  tagline: "Nahrajte v mobilu — zápis píše OrdiZapis",
  /** One-sentence pitch: mobile recording for dictation OR patient consult */
  pitch:
    "Nahrajte v telefonu diktát, nebo konzultaci s pacientem či pacientkou → odborná anamnéza a klinický zápis. Mikrofon má každý mobil.",
  priceMonthlyCzk: 390,
  assets: {
    /** Full marketing render of the app icon */
    appIcon: "/assets/ordizapis/app-icon.png",
    icon192: "/assets/ordizapis/icon-192.png",
    icon512: "/assets/ordizapis/icon-512.png",
    appleTouch: "/assets/ordizapis/apple-touch-icon.png",
    lockup: "/assets/ordizapis/logo-lockup.png",
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
    return `${this.productName} od ${this.provider}: nahrávání v mobilu — diktát nebo konzultace s pacientem/pacientkou → strukturovaný odborný zápis. Stáhněte na ${this.domain}, ${this.priceMonthlyCzk} Kč/měsíc, 14 dní zdarma.`;
  },
} as const;

/** @deprecated Use ORDIZAPIS */
export const MEDIKTOR = ORDIZAPIS;

/** @deprecated Use ORDIZAPIS */
export const DOKSCOPE = ORDIZAPIS;
