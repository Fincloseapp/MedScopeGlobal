import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

/** Structured Czech copy for /mediktor and collateral (docs/mediktor). */
export const MEDIKTOR_MARKETING = {
  icpNote:
    "MeDiktor je určen lékařům. Veřejnost a studenti vidí promo na homepage, produkt a stažení cílí na lékaře.",
  hero: {
    title: `${MEDIKTOR.shortName} – ${MEDIKTOR.tagline}`,
    subline: MEDIKTOR.heroSubline,
    support: MEDIKTOR.heroSupport,
    providerLine: `Produkt od ${MEDIKTOR.provider} · ${MEDIKTOR.domain}`,
    ctaPrimary: { label: "Stáhnout aplikaci", href: `${MEDIKTOR.routes.marketing}#stahnout` },
    ctaSecondary: { label: "Vyzkoušet zdarma", href: MEDIKTOR.routes.app },
  },
  whyDoctors: {
    title: "Proč lékaři používají MeDiktor",
    items: [
      {
        title: "Šetří čas",
        text: "Diktujete místo psaní — méně času u klávesnice, více u pacienta.",
      },
      {
        title: "Odborný zápis",
        text: "Strukturovaná anamnéza a klinický text připravený pro českou ordinaci.",
      },
      {
        title: "Přesnost a terminologie",
        text: "Návrh v odborném jazyce; finální znění vždy schvaluje lékař.",
      },
      {
        title: "Bezpečnost",
        text: "Souhlas při nahrávce rozhovoru · audio po zpracování neukládáme (ephemeral).",
      },
      {
        title: "PC i mobil",
        text: "Nahrávejte v telefonu — diktát i konzultaci — a dokončete zápis na PC.",
      },
    ],
  },
  howItWorks: {
    title: "Jak s tím pracovat",
    summary: "Stáhnout → nahrát → zkontrolovat → zkopírovat do dokumentace",
    steps: [
      { n: 1, title: "Stáhnete", text: "Ikona MeD na plochu telefonu i PC (PWA)." },
      {
        n: 2,
        title: "Informujete / diktujete",
        text: "Diktát po vyšetření, nebo konzultaci — pacientovi řeknete větu ze zákona (v návodu).",
      },
      { n: 3, title: "Zápis vznikne", text: "MeDiktor připraví odborný text. Uloží se do vašeho účtu." },
      { n: 4, title: "Vložíte do SW", text: "Kopírovat / .doc, nebo automatický webhook do NIS." },
    ],
  },
  benefits: {
    title: "Výhody",
    items: [
      "Úspora času na zápisu typicky 30–50 %",
      "Méně administrativy — více péče",
      "Vyšší přesnost díky kontrole lékaře nad návrhem",
      "Diktát i mimo ordinaci (cesta, sál, domácí příprava)",
      "Pro praktiky, specialisty i nemocniční týmy",
    ],
  },
  startNow: {
    title: "Začněte hned",
    text: "Instalujte PWA MeDiktor (zatím bez native App Store) — ověřený lékařský účet MedScopeGlobal.",
    ctas: [
      { label: "Instalovat PWA", href: `${MEDIKTOR.routes.marketing}#stahnout` },
      { label: "Návod pro lékaře", href: "/mediktor/navod" },
      { label: "Otevřít aplikaci", href: MEDIKTOR.routes.app },
      { label: "14 dní zdarma", href: "/predplatne#dokumentace" },
    ],
  },
  hospitals: {
    title: "Pro nemocnice a kliniky",
    text: "Nasazení pro více lékařů, školení týmu a individuální podmínky. Ozvěte se — připravíme nabídku.",
    cta: { label: "Kontaktujte nás", href: MEDIKTOR.routes.contact },
  },
  mobileEmphasis:
    "Mobilní nahrávání slouží jak pro diktát po vyšetření, tak pro záznam konzultace s pacientem nebo pacientkou.",
  legal: [
    "MeDiktor od MedScopeGlobal je asistent pro lékaře — není zdravotnický prostředek ani diagnóza.",
    "Lékař odpovídá za kontrolu a schválení zápisu před uložením do zdravotnické dokumentace.",
    "Diktát bez pacienta: nahráváte sebe, zvláštní souhlas s nahrávkou není potřeba.",
    "Konzultace s pacientem: před nahráváním nahlas informujte a získejte souhlas. Skryté nahrávání nedělejte. Péči lze poskytnout i bez nahrávky (diktát po vyšetření).",
    "Právní rámec ČR: OZ č. 89/2012 Sb. § 84–90, GDPR čl. 6 a 9 odst. 2 písm. h) a čl. 13, zákon č. 110/2019 Sb., zákon č. 372/2011 Sb. § 31, § 51, § 53 a násl.",
    "Audio se po zpracování neukládá. Text zápisu se ukládá do účtu lékaře na MedScopeGlobal.",
  ],
} as const;
