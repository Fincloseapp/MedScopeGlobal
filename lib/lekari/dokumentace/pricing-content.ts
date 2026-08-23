import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { subscriptionProductId } from "@/lib/v27/config";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export type MediktorPricingTierId = "solo" | "practice" | "hospital";

export type MediktorPricingTier = {
  id: MediktorPricingTierId;
  name: string;
  audience: string;
  headline: string;
  description: string;
  priceLabel: string;
  priceNote?: string;
  features: readonly string[];
  checkout?: {
    monthlyProductId: string;
    annualProductId: string;
    monthlyLabel: string;
    annualLabel: string;
  };
  contactHref?: string;
  contactLabel?: string;
  highlighted?: boolean;
  badge?: string;
};

function kontaktHref(subject: string, body?: string): string {
  const params = new URLSearchParams({ predmet: subject });
  if (body) params.set("zprava", body);
  return `/kontakt?${params.toString()}`;
}

/** MeDiktor pricing tiers — standalone product, no Medivox */
export const MEDIKTOR_PRICING = {
  path: "/mediktor/ceny",
  seoTitle: `Ceník ${MEDIKTOR.shortName} — tarify pro lékaře, ambulance a nemocnice | ${MEDIKTOR.provider}`,
  seoDescription: `${MEDIKTOR.shortName} od ${MEDIKTOR.provider}: samostatný tarif od ${MEDIKTOR.priceMonthlyCzk} Kč/měsíc pro jednotlivého lékaře, nabídky pro ambulance a nemocnice na míru. ${VIP_TRIAL_DAYS} dní zdarma, platba kartou přes Stripe.`,
  eyebrow: `Ceník · ${MEDIKTOR.domain}`,
  title: `Kolik stojí ${MEDIKTOR.shortName}?`,
  intro:
    "MeDiktor je samostatný produkt — nemusíte kupovat celou platformu. Jednotlivý lékař si aktivuje předplatné online; pro ambulance, více ordinací a nemocnice připravíme nabídku na míru.",
  trialNote: `${VIP_TRIAL_DAYS} dní zkušební období zdarma u online tarifů · platba kartou přes Stripe · zrušení kdykoli`,
  tiers: [
    {
      id: "solo",
      name: "Solo",
      audience: "Jednotlivý lékař",
      headline: `${MEDIKTOR.priceMonthlyCzk} Kč / měsíc`,
      description:
        "Kompletní MeDiktor pro jednoho ověřeného lékaře — diktát i konzultace, šablony, export a historie zápisů. Stejná práva lékaře v MedScopeGlobal jako u tarifu Lékař v praxi (490 Kč), levnější vstup.",
      priceLabel: `${MEDIKTOR.priceMonthlyCzk} Kč`,
      priceNote: "měsíčně · ročně 3 900 Kč (≈ 2 měsíce zdarma)",
      features: [
        "MeDiktor PWA — mobil i web pod jedním účtem",
        "Diktát i konzultace s pacientem",
        "Šablony: ambulantní, SOAP, anamnéza, propuštění…",
        "Export PDF · DOCX · TXT",
        "Guidelines, CME a klinický AI v ceně",
        `${VIP_TRIAL_DAYS} dní zkušební období zdarma`,
      ],
      checkout: {
        monthlyProductId: subscriptionProductId("dokumentace", "month"),
        annualProductId: subscriptionProductId("dokumentace", "year"),
        monthlyLabel: `Začít ${VIP_TRIAL_DAYS} dní zdarma — měsíčně`,
        annualLabel: `Začít trial — ročně (3 900 Kč)`,
      },
      highlighted: true,
      badge: "Nejčastější volba",
    },
    {
      id: "practice",
      name: "Ambulance / pracoviště",
      audience: "Ordinace, odbornost, více lékařů",
      headline: "Od 390 Kč / lékař",
      description:
        "Pro ambulanci nebo odborné pracoviště s více lékaři — individuální kalkulace podle počtu uživatelů, zaškolení a fakturace na IČO. Online self-serve checkout zatím jen pro jednotlivce.",
      priceLabel: "Od 390 Kč",
      priceNote: "za lékaře / měsíc · individuální nabídka",
      features: [
        "Vše ze tarifu Solo pro každého lékaře",
        "Hromadné nasazení a onboarding ordinace",
        "Fakturace na IČO / smlouva",
        "Koordinace více uživatelů na pracovišti",
        "Prioritní technická podpora",
        "Možnost pilotního období",
      ],
      contactHref: kontaktHref(
        "MeDiktor — poptávka pro ambulanci / pracoviště",
        "Dobrý den,\n\nmám zájem o MeDiktor pro naši ambulanci / odborné pracoviště.\n\nPočet lékařů: \nNázev pracoviště / IČO: \n\nDěkuji.",
      ),
      contactLabel: "Poptat nabídku pro pracoviště",
    },
    {
      id: "hospital",
      name: "Nemocnice / enterprise",
      audience: "Nemocnice, sítě, B2B",
      headline: "Nabídka na míru",
      description:
        "Pro nemocnice a větší zdravotnická zařízení — integrace do workflow, školení, SLA a smluvní podmínky. MeDiktor jako samostatný modul bez nutnosti celého balíčku platformy.",
      priceLabel: "Individuálně",
      priceNote: "B2B smlouva · kontakt",
      features: [
        "Enterprise nasazení a školení týmů",
        "Smluvní SLA a fakturace",
        "Podpora více oddělení / lokalit",
        "Pilotní projekt před rolloutem",
        "Právní a GDPR dokumentace pro nemocnici",
        "Dedikovaný kontakt obchodu",
      ],
      contactHref: kontaktHref(
        "MeDiktor — enterprise / nemocnice",
        "Dobrý den,\n\nmáme zájem o enterprise nabídku MeDiktor pro nemocnici / zdravotnické zařízení.\n\nZařízení: \nPočet lékařů / oddělení: \n\nDěkuji.",
      ),
      contactLabel: "Kontakt pro nemocnice",
    },
  ] satisfies MediktorPricingTier[],
  bundleNote: {
    title: "Potřebujete celý balíček Lékař v praxi?",
    body: "Tarif Lékař v praxi (490 Kč/měsíc) zahrnuje MeDiktor i plný přístup k odborné sekci, guidelines a Research Hub. MeDiktor standalone (390 Kč) má stejná práva lékaře — volte podle toho, zda chcete výhradně dokumentaci nebo celý obsah.",
    physicianHref: "/predplatne#physician",
    physicianLabel: "Lékař v praxi — 490 Kč",
    mediktorHref: "/predplatne#dokumentace",
    mediktorLabel: "MeDiktor standalone — 390 Kč",
  },
  comparison: {
    title: "Srovnání tarifů",
    rows: [
      { feature: "MeDiktor — AI zápisy", solo: true, practice: true, hospital: true },
      { feature: "Online self-serve checkout (Stripe)", solo: true, practice: false, hospital: false },
      { feature: "Fakturace na IČO / smlouva", solo: false, practice: true, hospital: true },
      { feature: "Zaškolení ordinace / týmu", solo: false, practice: true, hospital: true },
      { feature: "Enterprise SLA", solo: false, practice: false, hospital: true },
      { feature: "Guidelines, CME, klinický AI", solo: true, practice: true, hospital: true },
      { feature: `${VIP_TRIAL_DAYS} dní trial`, solo: true, practice: "Dohodou", hospital: "Dohodou" },
    ],
  },
  faq: [
    {
      q: "Musím koupit celou platformu MedScopeGlobal?",
      a: "Ne. MeDiktor standalone (390 Kč) je samostatný vstup se stejnými právy lékaře. Nemusíte platit za celý marketingový balíček — jen za dokumentační nástroj a lékařský přístup v rámci účtu.",
    },
    {
      q: "Jaký je rozdíl oproti tarifu Lékař v praxi (490 Kč)?",
      a: "Prakticky stejná práva lékaře v MedScopeGlobal. Tarif 490 Kč je marketingově zaměřený na celý obsah platformy; MeDiktor za 390 Kč je levnější vstup pro ty, kdo primárně chtějí AI zápisy.",
    },
    {
      q: "Může ambulance zaplatit kartou online?",
      a: "Online checkout přes Stripe je dnes nastaven pro jednotlivé lékaře (tarif Solo). Pro více uživatelů na jednom IČO nás kontaktujte — připravíme nabídku a fakturaci.",
    },
    {
      q: "Je MeDiktor zdravotnický prostředek?",
      a: "Ne. MeDiktor je softwarový asistent pro dokumentaci — není zdravotnický prostředek. Finální znění zápisu vždy schvaluje lékař.",
    },
  ],
  legal:
    "MeDiktor od MedScopeGlobal je asistent pro dokumentaci, nikoli zdravotnický prostředek ani klinické rozhodování. Ceny jsou uvedeny včetně DPH pro fyzické osoby; B2B fakturace dle smlouvy. Předplatné lze zrušit kdykoli v účtu nebo přes podporu.",
} as const;
