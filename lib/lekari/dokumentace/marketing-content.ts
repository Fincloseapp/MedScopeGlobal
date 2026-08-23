import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

/** Original Czech marketing copy for /mediktor hub — MedScopeGlobal / MeDiktor only. */
export const MEDIKTOR_MARKETING = {
  icpNote:
    "MeDiktor je určen ověřeným lékařům. Veřejnost vidí pouze obecné informace; plná aplikace vyžaduje lékařský účet MedScopeGlobal.",

  hero: {
    eyebrow: `Pro lékaře · ${MEDIKTOR.domain}`,
    title: MEDIKTOR.shortName,
    tagline: MEDIKTOR.tagline,
    pitch: MEDIKTOR.pitch,
    priceLine: `Samostatně ${MEDIKTOR.priceMonthlyCzk} Kč/měsíc · 14 dní zdarma`,
    subline: MEDIKTOR.heroSubline,
    support: MEDIKTOR.heroSupport,
    providerLine: `Produkt od ${MEDIKTOR.provider} · ${MEDIKTOR.domain}`,
    ctaPrimary: {
      label: "Stáhnout přes QR",
      href: `${MEDIKTOR.routes.marketing}#stahnout`,
    },
    ctaSecondary: {
      label: "Jak to funguje",
      href: `${MEDIKTOR.routes.marketing}#jak-to-funguje`,
    },
    ctaPricing: { label: "390 Kč / měsíc", href: "/predplatne#dokumentace" },
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
        title: "Export Word a PDF",
        text: "Upravitelný text, PDF, DOCX nebo TXT — zkopírujete do NIS nebo stáhnete pro archivaci.",
      },
      {
        id: "sync",
        title: "Mobil i PC",
        text: "Zápisy pod stejným účtem na mobilu i na webu — návrat k rozpracované dokumentaci.",
      },
      {
        id: "privacy",
        title: "Audio jen pro zpracování",
        text: "Zvuk se po vygenerování textu neukládá trvale. V účtu zůstává schválený textový návrh.",
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

  account: {
    title: "Účet a předplatné",
    text: "Správa účtu, ověření lékaře, instalace PWA a stav předplatného — v aplikaci MeDiktor nebo na stránce předplatného.",
    links: [
      { label: "Účet v MeDiktoru", href: "/app/mediktor?tab=ucet" },
      { label: "Předplatné MeDiktor", href: "/predplatne#dokumentace" },
      { label: "Ověření lékaře", href: "/academy/lekari/overeni" },
    ],
  },

  guide: {
    title: "Návod a dokumentace",
    text: "Podrobný návod k mikrofonu, režimům diktát/konzultace a exportu — v aplikaci nebo níže na této stránce.",
    href: "/app/mediktor?tab=navod",
    linkLabel: "Otevřít návod v aplikaci",
  },

  faq: {
    title: "Časté dotazy lékařů",
    items: [
      {
        q: "Potřebuji ověřený lékařský účet?",
        a: "Stažení PWA a plný přístup vyžadují ověřený lékařský účet MedScopeGlobal. Po přihlášení můžete vyzkoušet demo (3 zápisy/den).",
      },
      {
        q: "Je MeDiktor zdravotnický prostředek?",
        a: "Ne. MeDiktor je asistent pro dokumentaci — není zdravotnický prostředek, diagnóza ani klinické rozhodování. Finální znění vždy schvaluje lékař.",
      },
      {
        q: "Jak je to s GDPR a nahráváním pacienta?",
        a: "Před nahrávkou konzultace informujte pacienta nebo pacientku. Režim diktátu probíhá bez pacienta. Audio se po zpracování neukládá (ephemeral zpracování).",
      },
      {
        q: "Funguje to offline?",
        a: "Nahrávku můžete připravit offline; odeslání a AI zpracování vyžadují síť. Historie zápisů je dostupná po přihlášení.",
      },
      {
        q: "Mohu exportovat do Word nebo PDF?",
        a: "Ano. Po schválení zápisu exportujete PDF, Word (.docx) nebo prostý text — v aplikaci v historii zápisů.",
      },
      {
        q: "Jaký je rozdíl oproti tarifu Lékař v praxi?",
        a: "MeDiktor standalone (390 Kč) má stejná práva jako Lékař v praxi (490 Kč) — je to levnější vstup do stejného balíčku pro lékaře.",
      },
    ],
  },

  legal: {
    title: "Právní rámec a ochrana údajů",
    intro:
      "MeDiktor zpracovává zdravotní údaje v rozsahu nezbytném pro generování zápisu. Provozovatel platformy je uveden v zásadách ochrany osobních údajů.",
    items: [
      `${MEDIKTOR.fullName} je softwarový asistent pro lékaře — není zdravotnický prostředek, diagnóza ani léčebný algoritmus.`,
      "Lékař odpovídá za kontrolu, úpravu a schválení zápisu před uložením do zdravotnické dokumentace nebo NIS.",
      "Obsah generovaný AI je návrh — může obsahovat chyby; vždy kontrolujte před použitím u pacienta.",
      "Před nahráváním konzultace informujte pacienta nebo pacientku o účelu záznamu. Režim diktátu probíhá bez přítomnosti pacienta.",
      "Zvuková data slouží výhravně ke generování textového návrhu a po zpracování se neukládají trvale (ephemeral zpracování).",
      "Textové návrhy a historie zápisů se ukládají do zabezpečeného účtu MedScopeGlobal dle podmínek služby a GDPR.",
    ],
    links: [
      { label: "Zásady ochrany osobních údajů", href: "/privacy" },
      { label: "Obchodní podmínky (VOP)", href: "/terms" },
      { label: "GDPR — přehled", href: "/gdpr" },
      { label: "Právní checklist", href: "/pravni-checklist" },
    ],
  },

  footerCta: {
    priceLine: `${MEDIKTOR.priceMonthlyCzk} Kč/měsíc včetně balíčku Lékař · 14 dní trial · demo 3 zápisy/den po přihlášení`,
    subscribeHref: "/predplatne#dokumentace",
  },
} as const;
