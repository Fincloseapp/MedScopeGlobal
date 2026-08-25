/** Three consumer apps of MedScopeGlobal — shared product catalog */

export type AppProductId = "medipacient" | "mediprep" | "ordizapis" | "mediflow";
/** @deprecated Legacy product id — use ordizapis */
export type LegacyAppProductId = AppProductId | "mediktor";

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

export const ORDIZAPIS_APP: AppProduct = {
  id: "ordizapis",
  shortName: "OrdiZapis",
  provider: PROVIDER,
  domain: DOMAIN,
  tagline: "Nahrajte v mobilu — zápis píše OrdiZapis",
  pitch:
    "Nahrajte v telefonu diktát, nebo konzultaci s pacientem či pacientkou → odborná anamnéza a klinický zápis.",
  audience: "Ověření lékaři",
  priceMonthlyCzk: 390,
  priceNote: "390 Kč/měsíc · 14 dní zdarma · stejná práva jako tarif Lékař",
  marketingPath: "/lekari/dokumentace",
  downloadPath: "/lekari/dokumentace",
  appPath: "/app/dokumentace",
  manifest: "/dokumentace-manifest.json",
  serviceWorker: "/sw-dokumentace.js",
  themeColor: "#005B96",
  backgroundColor: "#021d33",
  assets: {
    icon192: "/assets/ordizapis/icon-192.png",
    icon512: "/assets/ordizapis/icon-512.png",
    appleTouch: "/assets/ordizapis/apple-touch-icon.png",
  },
};

/** @deprecated Use ORDIZAPIS_APP */
export const MEDIKTOR_APP = ORDIZAPIS_APP;

export const MEDIFLOW: AppProduct = {
  id: "mediflow",
  shortName: "MediFlow",
  provider: PROVIDER,
  domain: DOMAIN,
  tagline: "Váš osobní wellness deník",
  pitch:
    "Ukládejte články z MedscopeGlobal, sledujte symptomy a suplementy. Bez diagnostiky — pro vlastní přehled a sdílení s lékařem.",
  audience: "Veřejnost a wellness nadšenci",
  priceMonthlyCzk: 0,
  priceNote: "zdarma · VIP export PDF a sync od 149 Kč/měsíc",
  marketingPath: "/mediflow",
  downloadPath: "/mediflow/stahnout",
  appPath: "/app/mediflow",
  manifest: "/mediflow-manifest.json",
  serviceWorker: "/sw-mediflow.js",
  themeColor: "#10b981",
  backgroundColor: "#0a1628",
  assets: {
    icon192: "/assets/mediflow/icon-192.png",
    icon512: "/assets/mediflow/icon-512.png",
    appleTouch: "/assets/mediflow/icon-192.png",
    maskable: "/assets/mediflow/icon-512-maskable.png",
  },
};

export const APP_PRODUCTS: AppProduct[] = [MEDIPACIENT, MEDIPREP, ORDIZAPIS_APP, MEDIFLOW];

export function appById(id: LegacyAppProductId): AppProduct {
  const normalized: AppProductId = id === "mediktor" ? "ordizapis" : id;
  const found = APP_PRODUCTS.find((a) => a.id === normalized);
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
