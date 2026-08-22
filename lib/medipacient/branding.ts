export const MEDIPACIENT = {
  name: "MeDipacient",
  shortName: "MeDipacient",
  productName: "MeDipacient",
  provider: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  tagline: "Moje lékařské zprávy přehledně k dispozici",
  headline: "Lékařské zprávy v telefonu — i offline",
  pitch:
    "Vyfoťte PDF nebo fotografii lékařské zprávy bez dat. Po připojení se soubor zašifruje, OCR vytáhne diagnózy, léky a kontroly.",
  description:
    "Nahrajte PDF nebo fotografii lékařské zprávy — i bez sítě. Až budete online, MeDipacient soubor zašifruje, přečte OCR a složí časovou osu diagnóz, léků a kontrol.",
  seoTitle: "MeDipacient — lékařské zprávy v telefonu | MedScopeGlobal",
  seoDescription:
    "Stáhněte MeDipacient na plochu telefonu. Fotografujte zprávy offline, synchronizace po připojení. AES-256, GDPR, EU. Produkt MedScopeGlobal.",
  pwaShortName: "MeDipacient",
  pwaName: "MeDipacient · MedScopeGlobal",
  buildStamp: "2026.08.20d",
  /** Same-origin workspace — do not use medipacient.* (no DNS). */
  appUrl: "https://medscopeglobal.com/app/pacient",
  installUrl: "https://medscopeglobal.com/app/pacient?install=1",
  downloadQrTarget: "https://medscopeglobal.com/app/pacient?install=1",
  routes: {
    marketing: "/medipacient",
    download: "/medipacient/stahnout",
    app: "/app/pacient",
  },
  assets: {
    icon: "/assets/medipacient/logo-icon.svg",
    icon192: "/assets/medipacient/icon-192.png?v=20260819pwa",
    icon512: "/assets/medipacient/icon-512.png?v=20260819pwa",
    icon512Maskable: "/assets/medipacient/icon-512-maskable.png?v=20260819pwa",
    appleTouch: "/assets/medipacient/apple-touch-icon.png?v=20260819pwa",
    marketing: "/assets/medipacient/medipacient-marketing.png?v=20260819vis",
  },
  colors: {
    navy: "#021d33",
    primary: "#2D7FF9",
    primaryHover: "#1f6ae0",
    ink: "#1B1F23",
    surface: "#F5F7FA",
    accent: "#4ADE80",
  },
  price: "zdarma / od 199 Kč měsíčně",
  supportEmail: "podpora@medscopeglobal.com",
  get fullName() {
    return `${this.productName} od ${this.provider}`;
  },
  get lockline() {
    return `${this.productName} · ${this.domain}`;
  },
} as const;
