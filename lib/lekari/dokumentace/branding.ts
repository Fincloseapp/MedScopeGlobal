/** Public product brand for the physician documentation app */
export const MEDIKTOR = {
  shortName: "MeDiktor",
  productName: "MeDiktor",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  pwaShortName: "MeDiktor",
  pwaName: "MeDiktor · MedScopeGlobal",
  /** Short line under logo / banners — mobile mic for dictation + consult */
  tagline: "Nahrajte v mobilu — zápis píše MeDiktor",
  /** One-sentence pitch: mobile recording for dictation OR patient consult */
  pitch:
    "Nahrajte v telefonu diktát, nebo konzultaci s pacientem či pacientkou → odborná anamnéza a klinický zápis. Mikrofon má každý mobil.",
  /** Hero subline on marketing page */
  heroSubline:
    "Hlasový asistent pro českou ordinaci — strukturovaný návrh zápisu, ne náhrada klinického úsudku.",
  /** Supporting line under hero CTAs */
  heroSupport:
    "PWA pro ověřené lékaře · synchronizace mobil ↔ web · export do NIS",
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
    marketing: "/lekari/mediktor",
    app: "/app/mediktor",
    contact: "/kontakt",
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

/** @deprecated Use MEDIKTOR */
export const DOKSCOPE = MEDIKTOR;
