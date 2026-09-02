/** Global monetization configuration — ads, donations, affiliate, VIP */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  applyAmazonAssociateTag as applyAmazonAssociateTagGeo,
  resolveAffiliateDestination,
  type AffiliateContext,
} from "@/lib/monetization/affiliate-geo";

export { applyAmazonAssociateTagGeo as applyAmazonAssociateTag };
export type { AffiliateContext };

export type AdProvider =
  | "adsense"
  | "mediavine"
  | "ezoic"
  | "adthrive"
  | "yandex"
  | "naver"
  | "baidu"
  | "native";

export type AdPlacement = "header" | "below-title" | "in-content" | "sidebar" | "footer" | "sticky";

export const AD_PROVIDERS_BY_REGION: Record<string, AdProvider[]> = {
  USA: ["mediavine", "ezoic", "adthrive", "adsense"],
  EU: ["adsense", "mediavine", "ezoic"],
  RU: ["yandex", "adsense"],
  ASIA: ["baidu", "naver", "adsense"],
  GLOBAL: ["adsense", "native"],
};

export function getAdProvidersForLocale(locale: GlobalLocaleCode): AdProvider[] {
  const regionMap: Record<string, string> = {
    "en-US": "USA", en: "GLOBAL", cs: "EU", sk: "EU", pl: "EU", de: "EU",
    fr: "EU", it: "EU", es: "EU", ro: "EU", hu: "EU",
    ru: "RU", uk: "RU", be: "RU",
    "zh-CN": "ASIA", ja: "ASIA", ko: "ASIA", vi: "ASIA", id: "ASIA",
  };
  return AD_PROVIDERS_BY_REGION[regionMap[locale] ?? "GLOBAL"] ?? ["adsense"];
}

/** Micro-donation tiers in minor currency units (cents/haléře) */
export const DONATION_TIERS: Record<GlobalLocaleCode, { amounts: number[]; currency: string; symbol: string }> = {
  cs: { amounts: [2000, 5000, 9900], currency: "czk", symbol: "Kč" },
  sk: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  pl: { amounts: [1000, 2500, 4900], currency: "pln", symbol: "zł" },
  de: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  fr: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  it: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  es: { amounts: [200, 500, 990], currency: "eur", symbol: "€" },
  ro: { amounts: [1000, 2500, 4900], currency: "ron", symbol: "lei" },
  hu: { amounts: [80000, 200000, 390000], currency: "huf", symbol: "Ft" },
  ru: { amounts: [10000, 25000, 49000], currency: "rub", symbol: "₽" },
  uk: { amounts: [10000, 25000, 49000], currency: "uah", symbol: "₴" },
  be: { amounts: [1000, 2500, 4900], currency: "byn", symbol: "Br" },
  "zh-CN": { amounts: [1000, 2500, 4900], currency: "cny", symbol: "¥" },
  ja: { amounts: [30000, 60000, 98000], currency: "jpy", symbol: "¥" },
  ko: { amounts: [300000, 600000, 980000], currency: "krw", symbol: "₩" },
  vi: { amounts: [5000000, 12000000, 24000000], currency: "vnd", symbol: "₫" },
  id: { amounts: [3000000, 7500000, 14900000], currency: "idr", symbol: "Rp" },
  en: { amounts: [200, 500, 999], currency: "usd", symbol: "$" },
  "en-US": { amounts: [299, 499, 999], currency: "usd", symbol: "$" },
};

/** VIP pricing by locale */
export const VIP_PRICING: Record<GlobalLocaleCode, { monthly: number; currency: string; symbol: string; label: string }> = {
  cs: { monthly: 14900, currency: "czk", symbol: "Kč", label: "149 Kč/měsíc (VIP Longevity)" },
  sk: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mesiac" },
  pl: { monthly: 2900, currency: "pln", symbol: "zł", label: "29 zł/miesiąc" },
  de: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/Monat" },
  fr: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mois" },
  it: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mese" },
  es: { monthly: 599, currency: "eur", symbol: "€", label: "5,99 €/mes" },
  ro: { monthly: 2900, currency: "ron", symbol: "lei", label: "29 lei/lună" },
  hu: { monthly: 199000, currency: "huf", symbol: "Ft", label: "1 990 Ft/hó" },
  ru: { monthly: 29900, currency: "rub", symbol: "₽", label: "299 ₽/мес" },
  uk: { monthly: 14900, currency: "uah", symbol: "₴", label: "149 ₴/міс" },
  be: { monthly: 1490, currency: "byn", symbol: "Br", label: "14,90 Br/мес" },
  "zh-CN": { monthly: 2500, currency: "cny", symbol: "¥", label: "¥25/月" },
  ja: { monthly: 60000, currency: "jpy", symbol: "¥", label: "¥600/月" },
  ko: { monthly: 600000, currency: "krw", symbol: "₩", label: "₩6 000/월" },
  vi: { monthly: 12000000, currency: "vnd", symbol: "₫", label: "120 000 ₫/tháng" },
  id: { monthly: 7500000, currency: "idr", symbol: "Rp", label: "Rp 75 000/bulan" },
  en: { monthly: 499, currency: "usd", symbol: "$", label: "$4.99/month" },
  "en-US": { monthly: 699, currency: "usd", symbol: "$", label: "$6.99/month" },
};

export type AffiliateCategory = "supplements" | "lab-tests" | "fitness" | "sleep" | "longevity";

export type AffiliateProduct = {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: AffiliateCategory;
  affiliateUrl: Record<string, string>;
  imageUrl: string;
  regions: string[];
};

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: "magnesium-glycinate",
    name: {
      cs: "Magnesium glycinát",
      sk: "Magnézium glycinát",
      en: "Magnesium Glycinate",
      "en-US": "Magnesium Glycinate",
      de: "Magnesiumglycinat",
      fr: "Magnésium glycinate",
      it: "Magnesio glicinato",
      es: "Magnesio glicinato",
      pl: "Magnez bisglicynian",
      ja: "マグネシウムグリシネート",
    },
    description: {
      cs: "Večer, kdy chcete opravdu usnout — bez kofeinu v krvi.",
      sk: "Večer, keď chcete naozaj zaspať.",
      en: "The evening mineral people reach for when sleep will not come.",
      "en-US": "The evening mineral people reach for when sleep will not come.",
      de: "Das Mineral, nach dem greifen, die abends zur Ruhe kommen wollen.",
      fr: "Le minéral du soir, quand le sommeil ne vient pas.",
      it: "Il minerale della sera, quando il sonno non arriva.",
      es: "El mineral de la noche, cuando el sueño no llega.",
      pl: "Minerał na wieczór, gdy sen nie przychodzi.",
      ja: "夜、眠りたいときに手に取るミネラル。",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/magnesium-glycinate?locale=cs",
      sk: "/go/magnesium-glycinate?locale=sk",
      en: "/go/magnesium-glycinate?locale=en",
      "en-US": "/go/magnesium-glycinate?locale=en-US",
      de: "/go/magnesium-glycinate?locale=de",
      fr: "/go/magnesium-glycinate?locale=fr",
      it: "/go/magnesium-glycinate?locale=it",
      es: "/go/magnesium-glycinate?locale=es",
      pl: "/go/magnesium-glycinate?locale=pl",
      ja: "/go/magnesium-glycinate?locale=ja",
    },
    imageUrl: "/assets/affiliate/magnesium.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "omega-3-test",
    name: {
      cs: "Omega-3",
      sk: "Omega-3",
      en: "Omega-3",
      "en-US": "Omega-3 Index Test",
      de: "Omega-3",
      fr: "Oméga-3",
      it: "Omega-3",
      es: "Omega-3",
      pl: "Omega-3",
      ja: "オメガ3",
    },
    description: {
      cs: "To, co čtenáři hledají u textů o srdci a zánětu — v místním obchodě.",
      sk: "To, čo čitatelia hľadajú pri textoch o srdci.",
      en: "What readers look up after pieces on the heart and inflammation.",
      "en-US": "Know your omega-3 index — then decide what to buy.",
      de: "Wonach Leser nach Texten zu Herz und Entzündung greifen.",
      fr: "Ce que les lecteurs cherchent après un texte sur le cœur.",
      it: "Quello che i lettori cercano dopo un testo sul cuore.",
      es: "Lo que buscan los lectores tras un texto sobre el corazón.",
      pl: "To, czego szukają czytelnicy po tekście o sercu.",
      ja: "心臓や炎症の記事のあとで読者が探すもの。",
    },
    category: "lab-tests",
    affiliateUrl: {
      cs: "/go/omega-3-test?locale=cs",
      sk: "/go/omega-3-test?locale=sk",
      en: "/go/omega-3-test?locale=en",
      "en-US": "/go/omega-3-test?locale=en-US",
      de: "/go/omega-3-test?locale=de",
      fr: "/go/omega-3-test?locale=fr",
      it: "/go/omega-3-test?locale=it",
      es: "/go/omega-3-test?locale=es",
      pl: "/go/omega-3-test?locale=pl",
      ja: "/go/omega-3-test?locale=ja",
    },
    imageUrl: "/assets/affiliate/omega-test.svg",
    regions: ["EU", "USA"],
  },
  {
    id: "sleep-tracker",
    name: {
      cs: "Sledování spánku",
      sk: "Sledovanie spánku",
      en: "Sleep tracker",
      "en-US": "Oura Ring",
      de: "Schlaftracker",
      fr: "Tracker de sommeil",
      it: "Tracker del sonno",
      es: "Tracker de sueño",
      pl: "Tracker snu",
      ja: "スリープトラッカー",
    },
    description: {
      cs: "Vidět vlastní noc — HRV, hloubku, pravidelnost — ne jen dojem.",
      sk: "Vidieť vlastnú noc — HRV, hĺbku, pravidelnosť.",
      en: "See your own night — HRV, depth, regularity — not just a feeling.",
      "en-US": "See your own night — HRV, depth, regularity.",
      de: "Die eigene Nacht sehen — HRV, Tiefe, Regelmäßigkeit.",
      fr: "Voir sa propre nuit — HRV, profondeur, régularité.",
      it: "Vedere la propria notte — HRV, profondità, regolarità.",
      es: "Ver tu propia noche — HRV, profundidad, regularidad.",
      pl: "Zobaczyć własną noc — HRV, głębokość, regularność.",
      ja: "自分の夜を見る。HRV、深さ、規則性。",
    },
    category: "sleep",
    affiliateUrl: {
      cs: "/go/sleep-tracker?locale=cs",
      sk: "/go/sleep-tracker?locale=sk",
      en: "/go/sleep-tracker?locale=en",
      "en-US": "/go/sleep-tracker?locale=en-US",
      de: "/go/sleep-tracker?locale=de",
      fr: "/go/sleep-tracker?locale=fr",
      it: "/go/sleep-tracker?locale=it",
      es: "/go/sleep-tracker?locale=es",
      pl: "/go/sleep-tracker?locale=pl",
      ja: "/go/sleep-tracker?locale=ja",
    },
    imageUrl: "/assets/affiliate/device.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "vitamin-d3-k2",
    name: {
      cs: "Vitamin D3 + K2",
      sk: "Vitamín D3 + K2",
      en: "Vitamin D3 + K2",
      "en-US": "Vitamin D3 + K2",
      de: "Vitamin D3 + K2",
      fr: "Vitamine D3 + K2",
      it: "Vitamina D3 + K2",
      es: "Vitamina D3 + K2",
      pl: "Witamina D3 + K2",
      ja: "ビタミンD3 + K2",
    },
    description: {
      cs: "Zimní reflex — když slunce nestačí a kosti i nálada to poznají.",
      sk: "Zimný reflex — keď slnko nestačí.",
      en: "The winter reflex — when the sun is not enough.",
      "en-US": "The winter reflex — when the sun is not enough.",
      de: "Der Winterreflex — wenn die Sonne nicht reicht.",
      fr: "Le réflexe d’hiver — quand le soleil ne suffit pas.",
      it: "Il riflesso d’inverno — quando il sole non basta.",
      es: "El reflejo de invierno — cuando el sol no basta.",
      pl: "Zimowy odruch — gdy słońca za mało.",
      ja: "冬の反射。太陽だけでは足りないとき。",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/vitamin-d3-k2?locale=cs",
      sk: "/go/vitamin-d3-k2?locale=sk",
      en: "/go/vitamin-d3-k2?locale=en",
      "en-US": "/go/vitamin-d3-k2?locale=en-US",
      de: "/go/vitamin-d3-k2?locale=de",
      fr: "/go/vitamin-d3-k2?locale=fr",
      it: "/go/vitamin-d3-k2?locale=it",
      es: "/go/vitamin-d3-k2?locale=es",
      pl: "/go/vitamin-d3-k2?locale=pl",
      ja: "/go/vitamin-d3-k2?locale=ja",
    },
    imageUrl: "/assets/affiliate/supplement.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "creatine-monohydrate",
    name: { cs: "Kreatin monohydrát", en: "Creatine monohydrate", de: "Kreatin-Monohydrat" },
    description: {
      cs: "Síla a svaly — to, co čtenáři hledají u textů o pohybu a stárnutí.",
      en: "Strength and muscle — what readers look up after pieces on movement and aging.",
      de: "Kraft und Muskel — wonach Leser nach Texten zu Bewegung und Altern greifen.",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/creatine-monohydrate?locale=cs",
      sk: "/go/creatine-monohydrate?locale=sk",
      en: "/go/creatine-monohydrate?locale=en",
      de: "/go/creatine-monohydrate?locale=de",
      fr: "/go/creatine-monohydrate?locale=fr",
      it: "/go/creatine-monohydrate?locale=it",
      es: "/go/creatine-monohydrate?locale=es",
      pl: "/go/creatine-monohydrate?locale=pl",
      ja: "/go/creatine-monohydrate?locale=ja",
    },
    imageUrl: "/assets/affiliate/powder.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "collagen-peptides",
    name: { cs: "Kolagenové peptidy", en: "Collagen peptides", de: "Kollagenpeptide" },
    description: {
      cs: "Kůže a klouby — běžné hledání po textech o stárnutí pleti.",
      en: "Skin and joints — a common next search after aging-skin pieces.",
      de: "Haut und Gelenke — oft gesucht nach Texten zum Altern der Haut.",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/collagen-peptides?locale=cs",
      sk: "/go/collagen-peptides?locale=sk",
      en: "/go/collagen-peptides?locale=en",
      de: "/go/collagen-peptides?locale=de",
      fr: "/go/collagen-peptides?locale=fr",
      it: "/go/collagen-peptides?locale=it",
      es: "/go/collagen-peptides?locale=es",
      pl: "/go/collagen-peptides?locale=pl",
    },
    imageUrl: "/assets/affiliate/powder.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "electrolyte-powder",
    name: { cs: "Elektrolyty", en: "Electrolyte powder", de: "Elektrolyt-Pulver" },
    description: {
      cs: "Hydratace po výkonu nebo v horku — bez sladkého nápoje z automatu.",
      en: "Hydration after effort or heat — not a vending-machine drink.",
      de: "Hydration nach Belastung oder Hitze.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/electrolyte-powder?locale=cs",
      sk: "/go/electrolyte-powder?locale=sk",
      en: "/go/electrolyte-powder?locale=en",
      de: "/go/electrolyte-powder?locale=de",
      fr: "/go/electrolyte-powder?locale=fr",
      it: "/go/electrolyte-powder?locale=it",
      es: "/go/electrolyte-powder?locale=es",
      pl: "/go/electrolyte-powder?locale=pl",
    },
    imageUrl: "/assets/affiliate/powder.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "sleep-mask",
    name: { cs: "Maska na spaní", en: "Sleep mask", de: "Schlafmaske" },
    description: {
      cs: "Tma, když město nespí — levný doplněk k textům o spánku.",
      en: "Darkness when the city will not sleep.",
      de: "Dunkelheit, wenn die Stadt nicht schläft.",
    },
    category: "sleep",
    affiliateUrl: {
      cs: "/go/sleep-mask?locale=cs",
      sk: "/go/sleep-mask?locale=sk",
      en: "/go/sleep-mask?locale=en",
      de: "/go/sleep-mask?locale=de",
      fr: "/go/sleep-mask?locale=fr",
      it: "/go/sleep-mask?locale=it",
      es: "/go/sleep-mask?locale=es",
      pl: "/go/sleep-mask?locale=pl",
    },
    imageUrl: "/assets/affiliate/sleep-tracker.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "blood-pressure-monitor",
    name: { cs: "Tlakoměr na paži", en: "Upper-arm blood pressure monitor", de: "Oberarm-Blutdruckmessgerät" },
    description: {
      cs: "Vidět vlastní čísla doma — u textů o srdci a tlaku.",
      en: "See your own numbers at home — after pieces on the heart.",
      de: "Die eigenen Zahlen zu Hause sehen.",
    },
    category: "lab-tests",
    affiliateUrl: {
      cs: "/go/blood-pressure-monitor?locale=cs",
      sk: "/go/blood-pressure-monitor?locale=sk",
      en: "/go/blood-pressure-monitor?locale=en",
      de: "/go/blood-pressure-monitor?locale=de",
      fr: "/go/blood-pressure-monitor?locale=fr",
      it: "/go/blood-pressure-monitor?locale=it",
      es: "/go/blood-pressure-monitor?locale=es",
      pl: "/go/blood-pressure-monitor?locale=pl",
    },
    imageUrl: "/assets/affiliate/device.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "resistance-bands",
    name: { cs: "Odporové gumy", en: "Resistance bands", de: "Fitnessbänder" },
    description: {
      cs: "Pohyb doma — bez posilovny, u textů o sarkopenii a stárnutí.",
      en: "Home movement — after pieces on muscle and aging.",
      de: "Bewegung zu Hause — nach Texten zu Muskel und Altern.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/resistance-bands?locale=cs",
      sk: "/go/resistance-bands?locale=sk",
      en: "/go/resistance-bands?locale=en",
      de: "/go/resistance-bands?locale=de",
      fr: "/go/resistance-bands?locale=fr",
      it: "/go/resistance-bands?locale=it",
      es: "/go/resistance-bands?locale=es",
      pl: "/go/resistance-bands?locale=pl",
    },
    imageUrl: "/assets/affiliate/wellness.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "protein-powder",
    name: { cs: "Protein", en: "Protein powder", de: "Proteinpulver" },
    description: {
      cs: "Po pohybu — to, co čtenáři hledají u textů o svalu a regeneraci.",
      en: "After movement — what readers look up after pieces on muscle.",
      de: "Nach der Bewegung — wonach Leser nach Texten zum Muskel greifen.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/protein-powder?locale=cs",
      sk: "/go/protein-powder?locale=sk",
      en: "/go/protein-powder?locale=en",
      de: "/go/protein-powder?locale=de",
      fr: "/go/protein-powder?locale=fr",
      it: "/go/protein-powder?locale=it",
      es: "/go/protein-powder?locale=es",
      pl: "/go/protein-powder?locale=pl",
    },
    imageUrl: "/assets/affiliate/powder.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "probiotic",
    name: { cs: "Probiotika", en: "Probiotic", de: "Probiotika" },
    description: {
      cs: "Střevo a každodenní rytmus — bez slibů zázraku.",
      en: "Gut rhythm — no miracle claims.",
      de: "Darmrhythmus — ohne Wunderversprechen.",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/probiotic?locale=cs",
      en: "/go/probiotic?locale=en",
      de: "/go/probiotic?locale=de",
      fr: "/go/probiotic?locale=fr",
      it: "/go/probiotic?locale=it",
      es: "/go/probiotic?locale=es",
      pl: "/go/probiotic?locale=pl",
    },
    imageUrl: "/assets/affiliate/supplement.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "zinc",
    name: { cs: "Zinek", en: "Zinc", de: "Zink" },
    description: {
      cs: "Zimní doplněk, který lidé hledají vedle D3.",
      en: "The winter mineral people look up next to D3.",
      de: "Das Wintermineral neben D3.",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/zinc?locale=cs",
      en: "/go/zinc?locale=en",
      de: "/go/zinc?locale=de",
      fr: "/go/zinc?locale=fr",
      it: "/go/zinc?locale=it",
      es: "/go/zinc?locale=es",
      pl: "/go/zinc?locale=pl",
    },
    imageUrl: "/assets/affiliate/supplement.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "foam-roller",
    name: { cs: "Foam roller", en: "Foam roller", de: "Faszienrolle" },
    description: {
      cs: "Po výkonu — uvolnění, ne diagnostika.",
      en: "After effort — release, not a diagnosis.",
      de: "Nach der Belastung — lösen, nicht diagnostizieren.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/foam-roller?locale=cs",
      en: "/go/foam-roller?locale=en",
      de: "/go/foam-roller?locale=de",
      fr: "/go/foam-roller?locale=fr",
      it: "/go/foam-roller?locale=it",
      es: "/go/foam-roller?locale=es",
      pl: "/go/foam-roller?locale=pl",
    },
    imageUrl: "/assets/affiliate/wellness.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "yoga-mat",
    name: { cs: "Podložka na jógu", en: "Yoga mat", de: "Yogamatte" },
    description: {
      cs: "Místo na podlaze — u textů o pohybu a spánku.",
      en: "A place on the floor — after pieces on movement and sleep.",
      de: "Ein Platz auf dem Boden — nach Texten zu Bewegung und Schlaf.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/yoga-mat?locale=cs",
      en: "/go/yoga-mat?locale=en",
      de: "/go/yoga-mat?locale=de",
      fr: "/go/yoga-mat?locale=fr",
      it: "/go/yoga-mat?locale=it",
      es: "/go/yoga-mat?locale=es",
      pl: "/go/yoga-mat?locale=pl",
    },
    imageUrl: "/assets/affiliate/wellness.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "glass-water-bottle",
    name: { cs: "Skleněná lahev", en: "Glass water bottle", de: "Glasflasche" },
    description: {
      cs: "Voda po ruce — tichý návyk, ne kampaň.",
      en: "Water at hand — a quiet habit, not a campaign.",
      de: "Wasser greifbar — eine stille Gewohnheit.",
    },
    category: "longevity",
    affiliateUrl: {
      cs: "/go/glass-water-bottle?locale=cs",
      en: "/go/glass-water-bottle?locale=en",
      de: "/go/glass-water-bottle?locale=de",
      fr: "/go/glass-water-bottle?locale=fr",
      it: "/go/glass-water-bottle?locale=it",
      es: "/go/glass-water-bottle?locale=es",
      pl: "/go/glass-water-bottle?locale=pl",
    },
    imageUrl: "/assets/affiliate/bottle.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "blue-light-glasses",
    name: { cs: "Brýle proti modrému světlu", en: "Blue-light glasses", de: "Blaulichtfilter-Brille" },
    description: {
      cs: "Večer u obrazovky — když chcete ještě usnout.",
      en: "Evening screens — when you still want to sleep.",
      de: "Abends am Bildschirm — wenn der Schlaf noch kommen soll.",
    },
    category: "sleep",
    affiliateUrl: {
      cs: "/go/blue-light-glasses?locale=cs",
      en: "/go/blue-light-glasses?locale=en",
      de: "/go/blue-light-glasses?locale=de",
      fr: "/go/blue-light-glasses?locale=fr",
      it: "/go/blue-light-glasses?locale=it",
      es: "/go/blue-light-glasses?locale=es",
      pl: "/go/blue-light-glasses?locale=pl",
    },
    imageUrl: "/assets/affiliate/glasses.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "weighted-blanket",
    name: { cs: "Zátěžová deka", en: "Weighted blanket", de: "Gewichtsdecke" },
    description: {
      cs: "Tíha, která večer zklidní — u textů o spánku.",
      en: "Weight that settles the evening — after pieces on sleep.",
      de: "Gewicht, das den Abend beruhigt.",
    },
    category: "sleep",
    affiliateUrl: {
      cs: "/go/weighted-blanket?locale=cs",
      en: "/go/weighted-blanket?locale=en",
      de: "/go/weighted-blanket?locale=de",
      fr: "/go/weighted-blanket?locale=fr",
      it: "/go/weighted-blanket?locale=it",
      es: "/go/weighted-blanket?locale=es",
      pl: "/go/weighted-blanket?locale=pl",
    },
    imageUrl: "/assets/affiliate/blanket.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "coq10",
    name: { cs: "Koenzym Q10", en: "CoQ10", de: "Coenzym Q10" },
    description: {
      cs: "U textů o srdci a energii — bez zázračných slibů.",
      en: "After pieces on the heart and energy — no miracle claims.",
      de: "Nach Texten zu Herz und Energie — ohne Wunder.",
    },
    category: "supplements",
    affiliateUrl: {
      cs: "/go/coq10?locale=cs",
      en: "/go/coq10?locale=en",
      de: "/go/coq10?locale=de",
      fr: "/go/coq10?locale=fr",
      it: "/go/coq10?locale=it",
      es: "/go/coq10?locale=es",
      pl: "/go/coq10?locale=pl",
    },
    imageUrl: "/assets/affiliate/coq10.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
  {
    id: "grip-strengthener",
    name: { cs: "Posilovač stisku", en: "Grip strengthener", de: "Handtrainer" },
    description: {
      cs: "Síla úchopu — u textů o sarkopenii a stárnutí.",
      en: "Grip strength — after pieces on muscle and aging.",
      de: "Griffkraft — nach Texten zu Muskel und Altern.",
    },
    category: "fitness",
    affiliateUrl: {
      cs: "/go/grip-strengthener?locale=cs",
      en: "/go/grip-strengthener?locale=en",
      de: "/go/grip-strengthener?locale=de",
      fr: "/go/grip-strengthener?locale=fr",
      it: "/go/grip-strengthener?locale=it",
      es: "/go/grip-strengthener?locale=es",
      pl: "/go/grip-strengthener?locale=pl",
    },
    imageUrl: "/assets/affiliate/grip.svg",
    regions: ["EU", "USA", "GLOBAL"],
  },
];

/**
 * Legacy static map — kept for smoke tests and operators.
 * Runtime redirects go through `resolveAffiliateDestination` (locale + region).
 */
export const AFFILIATE_REDIRECT_DESTINATIONS: Record<string, string> = {
  "mg-cz": "https://www.heureka.cz/?h%5Bfraze%5D=magnesium%20glycin%C3%A1t",
  "mg-sk": "https://www.heureka.sk/?h%5Bfraze%5D=hor%C4%8D%C3%ADk%20glycin%C3%A1t",
  "mg-en": "https://www.amazon.co.uk/s?k=magnesium%20glycinate",
  "mg-us": "https://www.amazon.com/s?k=magnesium%20glycinate",
  "mg-de": "https://www.amazon.de/s?k=Magnesiumglycinat",
  "mg-fr": "https://www.amazon.fr/s?k=magn%C3%A9sium%20glycinate",
  "mg-pl": "https://www.amazon.pl/s?k=magnez%20bisglicynian",
};

export function getAffiliateRedirectDestination(
  slug: string,
  ctx: AffiliateContext = {}
): string | null {
  return resolveAffiliateDestination(slug, ctx);
}

export const HIGH_CTR_PLACEMENTS: AdPlacement[] = ["below-title", "in-content", "sticky"];

/** IAB-oriented inventory for display ads (homepage, articles, app landings). */
export type AdInventorySurface = "homepage" | "article" | "app-landing";

export type AdInventoryEntry = {
  id: string;
  surface: AdInventorySurface;
  /** Route pattern for operators */
  routes: string[];
  placement: AdPlacement;
  /** Typical creative sizes (IAB / responsive) */
  sizes: string[];
  format: "display" | "native" | "sticky-mobile";
  /** Higher = place first when inventory is scarce */
  incomePriority: 1 | 2 | 3;
  notes: string;
};

/**
 * Canonical ad placements — wire via `GlobalAdSlot`.
 * Empty in production until `NEXT_PUBLIC_ADS_ENABLED` + provider keys are set.
 */
export const AD_INVENTORY: AdInventoryEntry[] = [
  {
    id: "home-mid",
    surface: "homepage",
    routes: ["/"],
    placement: "in-content",
    sizes: ["728x90", "970x90", "320x100", "300x250"],
    format: "display",
    incomePriority: 1,
    notes: "Below magazine feed, above apps — high viewability, not in hero.",
  },
  {
    id: "home-footer",
    surface: "homepage",
    routes: ["/"],
    placement: "footer",
    sizes: ["728x90", "320x50", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "Before closing CTA strip.",
  },
  {
    id: "article-below-title",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "below-title",
    sizes: ["728x90", "320x100", "300x250"],
    format: "display",
    incomePriority: 1,
    notes: "Highest CTR on long-form; keep one unit only.",
  },
  {
    id: "article-in-content",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "in-content",
    sizes: ["300x250", "336x280", "responsive"],
    format: "display",
    incomePriority: 1,
    notes: "After primary body; never inside medical disclaimer.",
  },
  {
    id: "article-footer",
    surface: "article",
    routes: ["/article/[slug]", "/{locale}/article/[slug]"],
    placement: "footer",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "After tip / affiliate blocks, before related.",
  },
  {
    id: "article-sticky",
    surface: "article",
    routes: ["/article/[slug]"],
    placement: "sticky",
    sizes: ["320x50", "320x100"],
    format: "sticky-mobile",
    incomePriority: 3,
    notes: "Mobile only; enable only with explicit env + consent.",
  },
  {
    id: "landing-mediflow",
    surface: "app-landing",
    routes: ["/mediflow"],
    placement: "in-content",
    sizes: ["728x90", "300x250", "320x100"],
    format: "display",
    incomePriority: 2,
    notes: "Below fold after product pillars — never in hero.",
  },
  {
    id: "landing-medipacient",
    surface: "app-landing",
    routes: ["/medipacient"],
    placement: "in-content",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 2,
    notes: "Between steps grid and pricing — respectful density.",
  },
  {
    id: "landing-ordizaznam",
    surface: "app-landing",
    routes: ["/ordizaznam", "/ordizapis"],
    placement: "in-content",
    sizes: ["728x90", "300x250"],
    format: "display",
    incomePriority: 3,
    notes: "Physician landing — lighter inventory; prefer B2B later.",
  },
];

export type ClientAdConfig = {
  /** Master switch — must be true AND a provider key present to render live ads */
  enabled: boolean;
  /** Dev-only dashed boxes when live ads are off */
  showPlaceholders: boolean;
  adsenseClientId: string | null;
  mediavineSiteId: string | null;
  ezoicSiteId: string | null;
};

/** Read public ad env (inlined at build for client components). */
export function getClientAdConfig(): ClientAdConfig {
  const adsenseClientId = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim() || null;
  const mediavineSiteId = (process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID ?? "").trim() || null;
  const ezoicSiteId = (process.env.NEXT_PUBLIC_EZOIC_SITE_ID ?? "").trim() || null;
  const hasProvider = Boolean(adsenseClientId || mediavineSiteId || ezoicSiteId);
  const flag = (process.env.NEXT_PUBLIC_ADS_ENABLED ?? "").trim().toLowerCase();
  const enabled =
    (flag === "1" || flag === "true" || flag === "yes") && hasProvider;
  const showPlaceholders =
    (process.env.NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS ?? "").trim().toLowerCase() === "1" ||
    (process.env.NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS ?? "").trim().toLowerCase() === "true";

  return {
    enabled,
    showPlaceholders,
    adsenseClientId,
    mediavineSiteId,
    ezoicSiteId,
  };
}

export function resolveAdProvider(
  locale: GlobalLocaleCode,
  config: ClientAdConfig = getClientAdConfig()
): AdProvider | null {
  if (!config.enabled) return null;
  const preferred = getAdProvidersForLocale(locale);
  for (const p of preferred) {
    if (p === "adsense" && config.adsenseClientId) return "adsense";
    if (p === "mediavine" && config.mediavineSiteId) return "mediavine";
    if (p === "ezoic" && config.ezoicSiteId) return "ezoic";
  }
  if (config.adsenseClientId) return "adsense";
  if (config.mediavineSiteId) return "mediavine";
  if (config.ezoicSiteId) return "ezoic";
  return null;
}

export function formatDonationAmount(amountMinor: number, locale: GlobalLocaleCode): string {
  const tier = DONATION_TIERS[locale] ?? DONATION_TIERS.en;
  return formatMinorAmount(amountMinor, locale, tier.symbol);
}

/** Article tip (Příspěvek) tiers — voluntary micro-contributions; not VIP / předplatné */
export const ARTICLE_TIP_TIERS: Record<
  GlobalLocaleCode,
  { amounts: number[]; currency: string; symbol: string; minAmount: number }
> = {
  cs: { amounts: [1500, 2000, 5000], currency: "czk", symbol: "Kč", minAmount: 1500 },
  sk: { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 },
  pl: { amounts: [1000, 2500, 4900], currency: "pln", symbol: "zł", minAmount: 100 },
  de: { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 },
  fr: { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 },
  it: { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 },
  es: { amounts: [200, 500, 1000], currency: "eur", symbol: "€", minAmount: 50 },
  ro: { amounts: [50, 125, 250, 500, 1250], currency: "ron", symbol: "lei", minAmount: 50 },
  hu: { amounts: [8000, 20000, 40000, 80000, 200000], currency: "huf", symbol: "Ft", minAmount: 8000 },
  ru: { amounts: [1000, 2500, 5000, 10000, 25000], currency: "rub", symbol: "₽", minAmount: 1000 },
  uk: { amounts: [1000, 2500, 5000, 10000, 25000], currency: "uah", symbol: "₴", minAmount: 1000 },
  be: { amounts: [100, 250, 500, 1000, 2500], currency: "byn", symbol: "Br", minAmount: 100 },
  "zh-CN": { amounts: [100, 250, 500, 1000, 2500], currency: "cny", symbol: "¥", minAmount: 100 },
  ja: { amounts: [3000, 6000, 12000, 24000, 60000], currency: "jpy", symbol: "¥", minAmount: 3000 },
  ko: { amounts: [30000, 60000, 120000, 240000, 600000], currency: "krw", symbol: "₩", minAmount: 30000 },
  vi: { amounts: [500000, 1250000, 2500000, 5000000, 12500000], currency: "vnd", symbol: "₫", minAmount: 500000 },
  id: { amounts: [300000, 750000, 1500000, 3000000, 7500000], currency: "idr", symbol: "Rp", minAmount: 300000 },
  en: { amounts: [200, 500, 1000], currency: "usd", symbol: "$", minAmount: 50 },
  "en-US": { amounts: [200, 500, 1000], currency: "usd", symbol: "$", minAmount: 50 },
};

const ZERO_DECIMAL_CCY = new Set(["jpy", "krw", "vnd", "idr", "huf"]);

export function formatMinorAmount(
  amountMinor: number,
  locale: GlobalLocaleCode,
  symbol?: string,
  currency?: string
): string {
  const tier = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.en;
  const sym = symbol ?? tier.symbol;
  const ccy = (currency ?? tier.currency).toLowerCase();
  const zeroDecimal =
    ZERO_DECIMAL_CCY.has(ccy) ||
    locale === "ja" ||
    locale === "ko" ||
    locale === "vi" ||
    locale === "id" ||
    locale === "hu";
  const major = zeroDecimal ? amountMinor : amountMinor / 100;
  return `${major} ${sym}`;
}

export function formatTipAmount(
  amountMinor: number,
  locale: GlobalLocaleCode,
  symbol?: string
): string {
  return formatMinorAmount(amountMinor, locale, symbol);
}
