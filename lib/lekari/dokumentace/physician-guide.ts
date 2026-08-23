import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

/** In-app physician guide — original MeDiktor copy, shared by návod tab and help cards. */
export const MEDIKTOR_PHYSICIAN_GUIDE = {
  title: "Návod pro lékaře",
  subtitle:
    "Od prvního povolení mikrofonu po export do NIS — postup v aplikaci MeDiktor.",

  quickStart: {
    title: "Rychlý start",
    steps: [
      {
        id: "mic",
        title: "1. Povolte mikrofon",
        text: "Jednorázově potvrďte přístup v prohlížeči nebo v nastavení telefonu. Bez mikrofonu nelze nahrávat.",
      },
      {
        id: "mode",
        title: "2. Zvolte režim a šablonu",
        text: "Diktát po vyšetření, konzultace s pacientem, nebo doslovný přepis. Šablona určí strukturu výstupu.",
      },
      {
        id: "record",
        title: "3. Nahrajte a zpracujte",
        text: "Klepněte na Diktovat / Nahrávat konzultaci → Stop a zpracovat. Dlouhé nahrávky se dělí po dvou minutách.",
      },
      {
        id: "review",
        title: "4. Zkontrolujte a exportujte",
        text: "Upravte návrh, zkopírujte do NIS nebo stáhněte PDF/DOCX. Historie je v záložce Historie.",
      },
    ],
  },

  modes: {
    title: "Režimy nahrávání",
    items: [
      {
        id: "dictation",
        title: "Diktát",
        text: "Po vyšetření bez pacienta — shrnete nález, plán a doporučení vlastními slovy.",
      },
      {
        id: "consultation",
        title: "Konzultace",
        text: "Rozhovor s pacientem nebo pacientkou. Předem informujte o nahrávání a účelu zpracování.",
      },
      {
        id: "verbatim",
        title: "Doslovný přepis",
        text: "Vyčištěný přepis bez strukturování — vhodné pro volný text nebo poznámky mimo šablonu.",
      },
    ],
  },

  templates: {
    title: "Šablony výstupu",
    intro:
      "Šablona určí nadpisy sekcí v návrhu. Specializaci můžete doplnit volitelně pro jemnější tón textu.",
    examples: [
      "Ambulantní zpráva — běžná návštěva v praxi",
      "SOAP — struktura S · O · A · P",
      "Anamnéza — rozšířený anamnestický zápis",
      "Propuštění / specialista / praktický lékař",
    ],
  },

  export: {
    title: "Export a historie",
    items: [
      "Kopírování do schránky pro vložení do NIS",
      "Stažení PDF, DOCX nebo TXT s hlavičkou MeDiktor",
      "Sdílení přes nativní dialog (mobil)",
      "Historie zápisů synchronizovaná pod stejným účtem",
    ],
  },

  troubleshooting: {
    title: "Když mikrofon nefunguje",
    items: [
      "iPhone: Nastavení → Safari nebo MeDiktor → Mikrofon → Povolit",
      "Android: Nastavení → Aplikace → Chrome / MeDiktor → Oprávnění → Mikrofon",
      "PC: ikona zámku u adresy → Mikrofon → Povolit, pak znovu v aplikaci",
      "Zkontrolujte, že mikrofon neblokuje jiná aplikace (Teams, Zoom)",
    ],
  },

  legal: {
    title: "Právní upozornění",
    items: [
      `${MEDIKTOR.fullName} není zdravotnický prostředek ani nástroj pro stanovení diagnózy.`,
      "Lékař odpovídá za klinickou správnost a schválení každého zápisu.",
      "Při nahrávce konzultace informujte pacienta / pacientku o účelu a zpracování.",
      "Audio se po vygenerování textu neukládá trvale — v účtu zůstává textový návrh.",
      "Výstup může využívat AI — vždy jej před použitím klinicky ověřte.",
    ],
    marketingLink: {
      label: "Marketing a předplatné",
      href: MEDIKTOR.routes.marketing,
    },
  },
} as const;

/** Compact tips shown in the recording workspace (app variant). */
export const MEDIKTOR_WORKSPACE_TIPS = [
  {
    id: "consent",
    title: "Souhlas",
    text: "U konzultace nejdřív informujte pacienta. U diktátu stačí potvrzení, že nejde o rozhovor s pacientem.",
  },
  {
    id: "template",
    title: "Šablona",
    text: "Zvolte šablonu před nahráním — struktura se aplikuje na celý návrh.",
  },
  {
    id: "segments",
    title: "Dlouhé nahrávky",
    text: "Aplikace automaticky dělí záznam po 2 minutách kvůli spolehlivému odeslání.",
  },
  {
    id: "review",
    title: "Kontrola",
    text: "Návrh vždy projděte před kopírováním do NIS — odpovědnost zůstává u vás.",
  },
] as const;
