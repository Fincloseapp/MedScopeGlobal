/** Public product brand for the student LF-prep app — parallel to MeDiktor. */
export const MEDIPREP = {
  shortName: "MeDiprep",
  productName: "MeDiprep",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  pwaShortName: "MeDiprep",
  pwaName: "MeDiprep · MedScopeGlobal",
  tagline: "Zjisti mezery. Natrénuj je.",
  headline: "Připrav se na medicínu s jistotou",
  socialLine: "Ovládni medicínu. Rychleji. Chytřeji.",
  promoLine: "Moderní cesta k úspěchu na medicíně",
  partnerLine: "Tvůj partner na cestě k medicíně",
  startCta: "Začni přípravu hned",
  pitch:
    "Stáhněte MeDiprep na telefon i PC. Biologie, chemie a fyzika nanečisto — simulace podle fakulty, drill a týdenní plán.",
  heroSubline: "Příprava na přijímačky českých lékařských fakult. Originální otázky, vlastní účet, aplikace na ploše.",
  heroSupport: "E-mail + kód. Bez hesla. První test zdarma — pak simulace a drill v předplatném.",
  colors: {
    navy: "#0A192F",
    navyDeep: "#07111F",
    lime: "#A3E635",
    cyan: "#22D3EE",
    orange: "#F97316",
    tassel: "#C45C26",
  },
  priceMonthlyCzk: 149,
  priceAnnualCzk: 1490,
  trialDays: 14,
  downloadQrTarget: "https://medscopeglobal.com/app/priprava?install=1",
  supportPhone: "+420 733 635 144",
  assets: {
    appIcon: "/assets/mediprep/app-icon.png",
    icon192: "/assets/mediprep/icon-192.png?v=20260819p",
    icon512: "/assets/mediprep/icon-512.png?v=20260819p",
    appleTouch: "/assets/mediprep/apple-touch-icon.png?v=20260819p",
    banner: "/mediprep/banner.png?v=20260818d",
    social: "/mediprep/social.png?v=20260818d",
    promo: "/mediprep/promo.png?v=20260818d",
    logo: "/mediprep/logo.png?v=20260818d",
    logoDark: "/mediprep/logo-dark.png?v=20260818e",
  },
  routes: {
    marketing: "/mediprep",
    app: "/app/priprava",
    download: "/mediprep/stahnout",
    guide: "/mediprep/navod",
    pricingAnchor: "/predplatne#student",
  },
  get fullName() {
    return `${this.productName} od ${this.provider}`;
  },
  get lockline() {
    return `${this.productName} · ${this.domain}`;
  },
  get seoTitle() {
    return `${this.productName} — příprava na přijímačky LF | ${this.provider}`;
  },
  get seoDescription() {
    return `${this.productName} od ${this.provider}: stáhněte aplikaci, přihlaste se e-mailem a procvičujte B/C/F. Simulace 8 českých LF, ${this.priceMonthlyCzk} Kč/měsíc, ${this.trialDays} dní zdarma.`;
  },
} as const;

export const MEDIPREP_ONBOARDING = {
  welcome: {
    title: "Stáhněte MeDiprep. Začněte během 30 sekund.",
    cta: "Pokračovat",
  },
  contact: {
    title: "Zadejte e-mail. Pošleme ověřovací kód (bez hesla).",
    emailPlaceholder: "tvuj@email.cz",
    cta: "Poslat kód e-mailem",
  },
  otp: {
    title: "Zadejte kód z e-mailu.",
    cta: "Ověřit a vstoupit",
    resend: "Poslat kód znovu",
    sentViaEmail: "Kód jsme poslali e-mailem",
  },
  faculty: {
    title: "Na kterou fakultu míříte?",
    skip: "Vyberu později",
    cta: "Uložit a pokračovat",
  },
  marketing: {
    downloadCta: "Začni přípravu hned",
    startIn30: "Účet založíte během 30 sekund.",
    otpBlurb: "Stačí e-mail a ověřovací kód — bez hesla. Aplikace na ploše telefonu i PC.",
  },
} as const;
