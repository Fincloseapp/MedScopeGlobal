import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

/** Original Czech marketing copy for /lekari/mediktor — MedScopeGlobal / MeDiktor only. */
export const MEDIKTOR_MARKETING = {
  icpNote:
    "MeDiktor je určen ověřeným lékařům. Veřejnost vidí pouze obecné informace; plná aplikace vyžaduje lékařský účet MedScopeGlobal.",

  hero: {
    title: `${MEDIKTOR.shortName} — ${MEDIKTOR.tagline}`,
    subline: MEDIKTOR.heroSubline,
    support: MEDIKTOR.heroSupport,
    providerLine: `Produkt od ${MEDIKTOR.provider} · ${MEDIKTOR.domain}`,
    ctaPrimary: {
      label: "Stáhnout přes QR",
      href: `${MEDIKTOR.routes.marketing}#stahnout`,
    },
    ctaSecondary: {
      label: "Jak to funguje",
      href: `${MEDIKTOR.routes.marketing}#ukazka`,
    },
    ctaApp: { label: "Otevřít aplikaci", href: MEDIKTOR.routes.app },
  },

  capabilities: {
    title: "Co MeDiktor v ordinaci řeší",
    intro:
      "Zaměřujeme se na rychlejší dokumentaci bez ztráty odborné kontroly — vše pod vaší supervizí.",
    items: [
      {
        id: "voice",
        title: "Hlas místo psaní",
        text: "Diktát po vyšetření nebo záznam konzultace — mikrofon v mobilu i u PC. Méně času u klávesnice.",
      },
      {
        id: "structure",
        title: "Struktura pro českou praxi",
        text: "Návrh rozdělený do sekcí dle zvolené šablony (ambulantní zpráva, SOAP, anamnéza…).",
      },
      {
        id: "templates",
        title: "Šablony podle workflow",
        text: "Volíte režim a šablonu před nahráním — výstup odpovídá zvyklostem vaší ordinace.",
      },
      {
        id: "export",
        title: "Export a kopírování",
        text: "Upravitelný text, PDF, DOCX nebo TXT — zkopírujete do NIS podle interních pravidel.",
      },
      {
        id: "sync",
        title: "Historie v účtu",
        text: "Zápisy pod stejným účtem na mobilu i na webu — návrat k rozpracované dokumentaci.",
      },
      {
        id: "privacy",
        title: "Audio jen pro zpracování",
        text: "Zvuk se po vygenerování textu neukládá trvale. V účtu zůstává schválený textový návrh.",
      },
    ],
  },

  whyDoctors: {
    title: "Proč lékaři volí MeDiktor",
    items: [
      {
        title: "Více času u pacienta",
        text: "Administrativu zkrátíte diktováním — zápis dokončíte až po kontrole návrhu.",
      },
      {
        title: "Odborný jazyk",
        text: "Návrh respektuje klinickou terminologii; finální znění vždy schvaluje lékař.",
      },
      {
        title: "Mobil i ordinace",
        text: "Nahrávání u lůžka, v ambulanci nebo u PC — podle zvoleného vstupního zařízení.",
      },
      {
        title: "Právní jistota",
        text: "Souhlas při nahrávce rozhovoru, jasné vymezení role asistenta, odpovědnost u lékaře.",
      },
    ],
  },

  howItWorks: {
    title: "Průběh práce",
    summary: "Nahrát → Zpracovat → Schválit → Exportovat",
    steps: [
      {
        n: 1,
        title: "Připravíte vstup",
        text: "Zvolíte režim (diktát / konzultace), šablonu a povolíte mikrofon.",
      },
      {
        n: 2,
        title: "Nahrajete hlas",
        text: "Mluvíte přirozeně — aplikace rozdělí dlouhé nahrávky na bezpečné segmenty.",
      },
      {
        n: 3,
        title: "Zkontrolujete návrh",
        text: "Upravíte text, ověříte diagnózu a plán — teprve potom kopírujete do NIS.",
      },
      {
        n: 4,
        title: "Uložíte do účtu",
        text: "Historie zápisů zůstává v MedScopeGlobal — mobil i web pod stejným přihlášením.",
      },
    ],
  },

  pricingHighlight: {
    eyebrow: "Vstup pro samostatnou ordinaci",
    title: `MeDiktor — ${MEDIKTOR.priceMonthlyCzk} Kč/měsíc`,
    body:
      "Levnější než balíček Lékař v praxi (490 Kč), se stejnými právy lékaře v rámci MedScopeGlobal: guidelines, CME, klinický AI i historie zápisů.",
    bullets: [
      "Diktát i konzultace v mobilu i u PC",
      "Šablony ambulantní, SOAP, anamnéza, propuštění…",
      "Export PDF · DOCX · TXT · kopírování",
      "14 dní zkušební období · ročně 3900 Kč",
    ],
    trialLabel: "Začít 14 dní zdarma",
    altLinkLabel: "Lékař v praxi za 490 Kč",
    altLinkHref: "/predplatne#physician",
  },

  workflowStrip: {
    title: "Nahrajte · AI zpracuje · Schválíte",
    body:
      "MeDiktor nepřebírá klinické rozhodování — připraví návrh strukturovaného zápisu. Vy rozhodnete, co uložíte do zdravotnické dokumentace.",
  },

  valueProps: [
    {
      id: "record",
      title: "Nahrávání kde pracujete",
      text: "Telefon u pacienta, headset u PC, nebo nahraný soubor z diktafonu.",
    },
    {
      id: "ai",
      title: "Návrh struktury",
      text: "Text rozdělený do sekcí šablony — připravený k revizi, ne k automatickému uložení.",
    },
    {
      id: "review",
      title: "Kontrola lékaře",
      text: "Každý export prochází vaším schválením. Asistent nenahrazuje vyšetření.",
    },
    {
      id: "compliance",
      title: "Souhlas a ochrana dat",
      text: "Informace pacienta při nahrávce rozhovoru. Audio se po zpracování nearchivuje.",
    },
  ] as const,

  hospitals: {
    title: "Pro týmy a pracoviště",
    text:
      "Hromadné nasazení, zaškolení ordinace a individuální podmínky pro více lékařů — napište nám.",
    cta: { label: "Kontakt pro pracoviště", href: MEDIKTOR.routes.contact },
  },

  legal: {
    title: "Právní rámec",
    items: [
      `${MEDIKTOR.fullName} je softwarový asistent pro lékaře — není zdravotnický prostředek, diagnóza ani léčebný algoritmus.`,
      "Lékař odpovídá za kontrolu, úpravu a schválení zápisu před uložením do zdravotnické dokumentace nebo NIS.",
      "Před nahráváním konzultace informujte pacienta nebo pacientku o účelu záznamu. Režim diktátu probíhá bez přítomnosti pacienta.",
      "Zvuková data slouží výhradně ke generování textového návrhu a po zpracování se neukládají trvale (ephemeral zpracování).",
      "Textové návrhy a historie zápisů se ukládají do zabezpečeného účtu MedScopeGlobal dle podmínek služby a GDPR.",
      "Výstup může využívat AI — vždy jej před použitím klinicky ověřte.",
    ],
  },

  footerCta: {
    priceLine: `${MEDIKTOR.priceMonthlyCzk} Kč/měsíc včetně balíčku Lékař · 14 dní trial · demo 3 zápisy/den po přihlášení`,
    subscribeHref: "/predplatne#dokumentace",
  },
} as const;
