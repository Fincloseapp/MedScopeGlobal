/** Three consumer apps of MedScopeGlobal — shared product catalog */

export type AppProductId = "medipacient" | "mediprep" | "mediktor";

export type AppProduct = {
  id: AppProductId;
  shortName: string;
  provider: "MedScopeGlobal";
  domain: "medscopeglobal.com";
  tagline: string;
  pitch: string;
  audience: string;
  priceMonthlyCzk: number;
  priceNote: string;
  marketingPath: string;
  downloadPath: string;
  appPath: string;
  manifest: string;
  serviceWorker: string;
  themeColor: string;
  backgroundColor: string;
  assets: {
    icon192: string;
    icon512: string;
    appleTouch: string;
    maskable?: string;
  };
};

const PROVIDER = "MedScopeGlobal" as const;
const DOMAIN = "medscopeglobal.com" as const;

export const MEDIPACIENT: AppProduct = {
  id: "medipacient",
  shortName: "MeDipacient",
  provider: PROVIDER,
  domain: DOMAIN,
  tagline: "Moje lékařské zprávy přehledně k dispozici",
  pitch:
    "Vyfoťte PDF nebo fotografii lékařské zprávy — i bez dat. Po připojení se soubor přečte, OCR vytáhne diagnózy, léky a kontroly.",
  audience: "Veřejnost a pacienti",
  priceMonthlyCzk: 99,
  priceNote: "zdarma k prohlížení ukázky · od 99 Kč/měsíc s předplatným Veřejnost",
  marketingPath: "/medipacient",
  downloadPath: "/medipacient/stahnout",
  appPath: "/app/pacient",
  manifest: "/medipacient-manifest.json",
  serviceWorker: "/sw-medipacient.js",
  themeColor: "#2D7FF9",
  backgroundColor: "#021d33",
  assets: {
    icon192: "/assets/medipacient/icon-192.png",
    icon512: "/assets/medipacient/icon-512.png",
    appleTouch: "/assets/medipacient/apple-touch-icon.png",
    maskable: "/assets/medipacient/icon-512-maskable.png",
  },
};

export const MEDIPREP: AppProduct = {
  id: "mediprep",
  shortName: "MeDiprep",
  provider: PROVIDER,
  domain: DOMAIN,
  tagline: "Zjisti mezery. Natrénuj je.",
  pitch:
    "Příprava na přijímačky 8 českých lékařských fakult. Originální testy biologie, chemie a fyziky. E-mail + kód, bez hesla. První test zdarma.",
  audience: "Uchazeči a studenti LF",
  priceMonthlyCzk: 149,
  priceNote: "první test zdarma · 149 Kč/měsíc Student LF · 14 dní zdarma",
  marketingPath: "/mediprep",
  downloadPath: "/mediprep/stahnout",
  appPath: "/app/priprava",
  manifest: "/mediprep-manifest.json",
  serviceWorker: "/sw-mediprep.js",
  themeColor: "#0A192F",
  backgroundColor: "#F4F7FB",
  assets: {
    icon192: "/assets/mediprep/icon-192.png",
    icon512: "/assets/mediprep/icon-512.png",
    appleTouch: "/assets/mediprep/apple-touch-icon.png",
    maskable: "/assets/mediprep/icon-512-maskable.png",
  },
};

export const MEDIKTOR_APP: AppProduct = {
  id: "mediktor",
  shortName: "MeDiktor",
  provider: PROVIDER,
  domain: DOMAIN,
  tagline: "Nahrajte v mobilu — zápis píše MeDiktor",
  pitch:
    "Nahrajte v telefonu diktát, nebo konzultaci s pacientem či pacientkou → odborná anamnéza a klinický zápis.",
  audience: "Ověření lékaři",
  priceMonthlyCzk: 390,
  priceNote: "390 Kč/měsíc · 14 dní zdarma · stejná práva jako tarif Lékař",
  marketingPath: "/mediktor",
  downloadPath: "/mediktor/stahnout",
  appPath: "/app/mediktor",
  manifest: "/mediktor-manifest.json",
  serviceWorker: "/sw-mediktor.js",
  themeColor: "#005B96",
  backgroundColor: "#021d33",
  assets: {
    icon192: "/assets/mediktor/icon-192.png",
    icon512: "/assets/mediktor/icon-512.png",
    appleTouch: "/assets/mediktor/apple-touch-icon.png",
  },
};

export const APP_PRODUCTS: AppProduct[] = [MEDIPACIENT, MEDIPREP, MEDIKTOR_APP];

export function appById(id: AppProductId): AppProduct {
  const found = APP_PRODUCTS.find((a) => a.id === id);
  if (!found) throw new Error(`Unknown app ${id}`);
  return found;
}

export function appLockline(app: AppProduct): string {
  return `${app.shortName} · ${app.domain}`;
}

export function appFullName(app: AppProduct): string {
  return `${app.shortName} od ${app.provider}`;
}

export function appSeoTitle(app: AppProduct): string {
  return `${app.shortName} — ${app.tagline} | ${app.provider}`;
}

export function appSeoDescription(app: AppProduct): string {
  return `${appFullName(app)}: ${app.pitch} Stáhněte na ${app.domain}. ${app.priceNote}.`;
}
