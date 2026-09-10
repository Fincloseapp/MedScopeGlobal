import { getLegalEntity } from "@/lib/config/legal-entity";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type LegalDocId = "terms" | "privacy" | "cookies" | "advertising" | "disclaimer";

export type LegalSection = { heading: string; body: string[] };

export type ExchangeLegalDoc = {
  id: LegalDocId;
  href: string;
  title: string;
  version: string;
  updated: string;
  sections: LegalSection[];
};

const VERSION = "2026-09-10";
const UPDATED = "2026-09-10";

function entityLine() {
  const e = getLegalEntity();
  return `${e.name}${e.ico ? `, IČO ${e.ico}` : ""}, ${e.address ?? ""}`.trim();
}

const CS: Record<LegalDocId, Omit<ExchangeLegalDoc, "id" | "href">> = {
  terms: {
    title: "Obchodní podmínky MedScope B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Provozovatel a povaha služby",
        body: [
          `Provozovatelem je ${entityLine()}. Značka MedScopeGlobal provozuje B2B Exchange jako zprostředkovatele kontaktu mezi podnikateli a institucemi.`,
          "Marketplace nezpracovává platby mezi stranami, neuzavírá smlouvy za uživatele, nezajišťuje dodání ani fakturaci obchodu. Smlouva vzniká výhradně mezi kupujícím a inzerentem.",
        ],
      },
      {
        heading: "2. Pouze B2B",
        body: [
          "Služba je určena výhradně podnikatelům, klinikám, nemocnicím, laboratořím, univerzitám, výzkumným týmům a poskytovatelům telemedicíny.",
          "Spotřebitelský prodej léčivých přípravků veřejnosti je zakázán. Inzerce nesmí nabízet výdej léků pacientům.",
        ],
      },
      {
        heading: "3. Odpovědnost inzerenta",
        body: [
          "Za pravdivost nabídky, certifikace (CE, FDA, ISO), oprávnění k uvádění na trh a soulad s právem cílového regionu odpovídá inzerent / instituce.",
          "MedScopeGlobal provádí formální kontrolu (B2B charakter, povinný region, zákaz PHI a veřejného prodeje léků), nikoli věcnou certifikaci výrobku.",
        ],
      },
      {
        heading: "4. Regionální dostupnost",
        body: [
          "Každá nabídka musí obsahovat povinné pole availability_region: EU, USA, Asia nebo Global. Kombinace regionů je povolena; Global znamená dostupnost ve všech zónách filtru.",
          "Inzerent prohlašuje, že nabídka je v uvedených regionech právně uveřejnitelná.",
        ],
      },
      {
        heading: "5. Poplatky",
        body: [
          "Zprostředkování kontaktu je bez provize. Předplatné (Basic / Pro / Enterprise) a reklamní balíčky se řídí ceníkem /exchange/pricing.",
          "Volitelný success fee 5–12 % u tarifu Enterprise je možný pouze při dobrovolném vykázání uzavřeného obchodu a fakturuje se odděleně. Není podmínkou kontaktu.",
        ],
      },
      {
        heading: "6. Účty a schválení",
        body: [
          "Onboarding: registrace, ověření e-mailu, souhlas s dokumenty, identita firmy, region, první nabídka, překlady, schválení adminem.",
          "Provozovatel může nabídku odmítnout nebo stáhnout při porušení těchto podmínek.",
        ],
      },
    ],
  },
  privacy: {
    title: "Ochrana osobních údajů — B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Správce",
        body: [
          `Správcem je ${entityLine()}. Kontakt: ${getLegalEntity().legalEmail}.`,
        ],
      },
      {
        heading: "2. Žádné citlivé zdravotní údaje",
        body: [
          "Exchange nezpracovává údaje o zdravotním stavu pacientů (čl. 9 GDPR). Kontaktní formulář je určen k B2B komunikaci o produktech a službách, nikoli k zasílání zdravotnické dokumentace.",
          "Uživatel se zavazuje do zpráv nevkládat rodná čísla, diagnózy konkrétních pacientů ani lékařské zprávy.",
        ],
      },
      {
        heading: "3. Účely",
        body: [
          "Zpracováváme identifikační údaje firmy, kontaktní osobu, e-mail, telefon, IČ a region za účelem zprostředkování kontaktu, schválení nabídek, plnění smlouvy a oprávněného zájmu (bezpečnost, podvody).",
          "Právní základy: plnění smlouvy (čl. 6/1/b), právní povinnost (účetnictví), souhlas (marketingové zprávy) a oprávněný zájem (čl. 6/1/f).",
        ],
      },
      {
        heading: "4. Příjemci a překlady",
        body: [
          "Obsah nabídky může být odeslán k automatickému překladu (DeepL nebo jiný zpracovatel). Zpracovatelé v USA se využívají jen s odpovídajícími zárukami (SCC / DPF).",
          "Zpráva z kontaktního formuláře se předá inzerentovi jako samostatnému správci další komunikace.",
        ],
      },
      {
        heading: "5. Práva subjektů",
        body: [
          "Právo na přístup, opravu, výmaz, omezení, přenositelnost a námitku. Stížnost: Úřad pro ochranu osobních údajů (ČR) nebo dozorový úřad v zemi bydliště.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies — B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Nezbytné",
        body: [
          "Přihlášení, jazyk (medscope_locale), region Exchange, bezpečnost a ochrana proti zneužití. Tyto cookies nelze vypnout, služba by nefungovala.",
        ],
      },
      {
        heading: "2. Analytika a marketing",
        body: [
          "Měření zobrazení a kliků reklamních slotů Exchange (regionální reporting). Google AdSense se na plochách Exchange nespouští bez souhlasu tam, kde to vyžaduje CMP.",
          "Preference spravujete v centru cookies na /cookies.",
        ],
      },
    ],
  },
  advertising: {
    title: "Reklamní pravidla B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Formáty",
        body: [
          "Banner, sponzorovaný článek a placement v newsletteru. Cílení podle regionu (EU / USA / Asia / Global).",
        ],
      },
      {
        heading: "2. Označení",
        body: [
          "Sponzorovaný obsah je vždy označen. Lékařská zóna a klinické nástroje (OrdiZapis) reklamu neobsahují.",
        ],
      },
      {
        heading: "3. Zakázaný obsah",
        body: [
          "Léky pro veřejnost, neověřené léčebné sliby, skrytá inzerce, srovnávání s konkrétními pacienty, PHI.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Medicínské vyloučení odpovědnosti — Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Není lékařská péče",
        body: [
          "Katalog, odborné články a legislativní briefy slouží k B2B informování. Nepředstavují lékařskou radu, diagnózu ani léčbu konkrétní osoby.",
        ],
      },
      {
        heading: "2. Certifikace",
        body: [
          "Uvedení CE / FDA / ISO je prohlášení inzerenta. MedScopeGlobal neprovádí laboratorní ani notifikovanou zkoušku výrobku.",
        ],
      },
      {
        heading: "3. Regionální právo",
        body: [
          "Dostupnost v regionu neznamená, že je výrobek v každé zemi regionu automaticky registrován. Kupující ověřuje místní regulatorní stav.",
        ],
      },
    ],
  },
};

const EN: Record<LegalDocId, Omit<ExchangeLegalDoc, "id" | "href">> = {
  terms: {
    title: "MedScope B2B Exchange terms and conditions",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Operator and nature of the service",
        body: [
          `The operator is ${entityLine()}. MedScopeGlobal operates B2B Exchange as an intermediary that introduces businesses and institutions.`,
          "The marketplace does not process payments between the parties, does not conclude contracts on users’ behalf, and does not handle delivery or commercial invoicing. The contract is solely between buyer and advertiser.",
        ],
      },
      {
        heading: "2. B2B only",
        body: [
          "The service is for businesses, clinics, hospitals, laboratories, universities, research teams and telemedicine providers only.",
          "Consumer sale of medicinal products to the public is prohibited. Listings may not offer dispensing of medicines to patients.",
        ],
      },
      {
        heading: "3. Advertiser responsibility",
        body: [
          "The advertiser / institution is responsible for the accuracy of the listing, certifications (CE, FDA, ISO), market access rights and compliance in the target region.",
          "MedScopeGlobal performs a formal check (B2B character, mandatory region, no PHI, no public drug sales), not a notified-body product assessment.",
        ],
      },
      {
        heading: "4. Regional availability",
        body: [
          "Every listing must include availability_region: EU, USA, Asia or Global. Combinations are allowed; Global matches every regional filter.",
          "The advertiser represents that the offer may lawfully be published in the stated regions.",
        ],
      },
      {
        heading: "5. Fees",
        body: [
          "Introductions carry no commission. Subscriptions (Basic / Pro / Enterprise) and advertising packs follow /exchange/pricing.",
          "An optional 5–12% success fee on Enterprise applies only if the organisation voluntarily reports a closed deal, invoiced separately. It is not a condition of contact.",
        ],
      },
      {
        heading: "6. Accounts and approval",
        body: [
          "Onboarding: registration, email verification, legal consent, company identity, region, first listing, translations, admin approval.",
          "The operator may refuse or take down a listing that breaches these terms.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy — B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Controller",
        body: [`The controller is ${entityLine()}. Contact: ${getLegalEntity().legalEmail}.`],
      },
      {
        heading: "2. No patient health data",
        body: [
          "Exchange does not process patient health data (GDPR Art. 9). The contact form is for B2B communication about products and services, not medical records.",
          "Users must not submit national ID numbers, named patient diagnoses or clinical reports.",
        ],
      },
      {
        heading: "3. Purposes",
        body: [
          "We process company identity, contact person, email, phone, registration ID and region to introduce parties, review listings, perform the contract and pursue legitimate interests (security, fraud).",
          "Legal bases: contract (Art. 6(1)(b)), legal obligation, consent (marketing) and legitimate interest (Art. 6(1)(f)).",
        ],
      },
      {
        heading: "4. Recipients and translation",
        body: [
          "Listing copy may be sent to an automatic translation processor (DeepL or equivalent). US processors are used only with appropriate safeguards (SCCs / DPF).",
          "A contact-form message is disclosed to the advertiser, who becomes controller of the subsequent correspondence.",
        ],
      },
      {
        heading: "5. Data-subject rights",
        body: [
          "Access, rectification, erasure, restriction, portability and objection. Complaints: the Czech DPA or the supervisory authority in your country of residence.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies — B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Strictly necessary",
        body: [
          "Sign-in, language (medscope_locale), Exchange region, security and abuse prevention. These cookies cannot be switched off.",
        ],
      },
      {
        heading: "2. Analytics and advertising",
        body: [
          "Impression and click measurement for Exchange ad slots (regional reporting). Google AdSense does not run on Exchange surfaces without CMP consent where required.",
          "Manage preferences in the cookie centre at /cookies.",
        ],
      },
    ],
  },
  advertising: {
    title: "Advertising policy — B2B Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Formats",
        body: [
          "Banner, sponsored article and newsletter placement. Targeting by region (EU / USA / Asia / Global).",
        ],
      },
      {
        heading: "2. Labelling",
        body: [
          "Sponsored content is always labelled. The physician zone and clinical tools (OrdiZapis) do not carry ads.",
        ],
      },
      {
        heading: "3. Prohibited content",
        body: [
          "Medicines for the public, unverified therapeutic claims, undisclosed advertising, patient-identifying comparisons, PHI.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Medical disclaimer — Exchange",
    version: VERSION,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Not medical care",
        body: [
          "The catalogue, expert articles and legislative briefs are B2B information. They are not medical advice, diagnosis or treatment of any person.",
        ],
      },
      {
        heading: "2. Certifications",
        body: [
          "CE / FDA / ISO marks are the advertiser’s representation. MedScopeGlobal does not perform laboratory or notified-body testing.",
        ],
      },
      {
        heading: "3. Regional law",
        body: [
          "Availability in a region does not mean the product is registered in every country of that region. The buyer must verify local regulatory status.",
        ],
      },
    ],
  },
};

const HREFS: Record<LegalDocId, string> = {
  terms: "/exchange/legal/terms",
  privacy: "/exchange/legal/privacy",
  cookies: "/exchange/legal/cookies",
  advertising: "/exchange/legal/advertising",
  disclaimer: "/exchange/legal/disclaimer",
};

export function getExchangeLegalDoc(id: LegalDocId, locale?: string | null): ExchangeLegalDoc {
  const pack: ChromePack = chromePack(locale);
  const source = pack === "cs" ? CS : EN;
  const doc = source[id];
  return { id, href: HREFS[id], ...doc };
}

export function listExchangeLegalDocs(locale?: string | null): ExchangeLegalDoc[] {
  return (Object.keys(HREFS) as LegalDocId[]).map((id) => getExchangeLegalDoc(id, locale));
}
