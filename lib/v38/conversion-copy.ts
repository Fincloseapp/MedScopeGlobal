import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeListedCzk } from "@/lib/i18n/payment-currency";

export type ConversionSlot = "article_gate" | "article_inline" | "video_overlay" | "nav_strip" | "nav_cta";

export type ConversionCopy = {
  slot: ConversionSlot;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  hint?: string;
};

const STATIC_POOL: Record<ConversionSlot, ConversionCopy[]> = {
  nav_cta: [
    {
      slot: "nav_cta",
      eyebrow: "Pro váš zájem",
      headline: "MedScope Premium",
      body: "Aplikace MeDipacient, MeDiprep a OrdiZapis plus VIP články. 14 dní zdarma.",
      ctaLabel: "14 dní zdarma",
      ctaHref: "/predplatne?trial=1",
    },
  ],
  nav_strip: [
    {
      slot: "nav_strip",
      eyebrow: "Pro váš zájem",
      headline: "Tři aplikace na ploše telefonu",
      body: "MeDipacient, MeDiprep a OrdiZapis — zkušební dashboard hned, předplatné od 99 Kč. 14 dní zdarma.",
      ctaLabel: "Stáhnout aplikace",
      ctaHref: "/aplikace",
      hint: "14 dní na vyzkoušení",
    },
    {
      slot: "nav_strip",
      eyebrow: "Doporučeno pro vás",
      headline: "MeDipacient složí vaše lékařské zprávy",
      body: "Zkušební osa diagnóz, léků a kontrol je otevřená. Vlastní PDF po přihlášení — tarif Veřejnost 99 Kč.",
      ctaLabel: "Otevřít MeDipacient",
      ctaHref: "/app/pacient",
    },
    {
      slot: "nav_strip",
      eyebrow: "Pro váš zájem",
      headline: "Obsah šitý na míru vašemu studiu medicíny",
      body: "Academy kurzy, AI tutor a materiály bez limitů free vrstvy — od 149 Kč/měsíc.",
      ctaLabel: "Zobrazit plány",
      ctaHref: "/predplatne?trial=1#student",
      hint: "14 dní na vyzkoušení",
    },
    {
      slot: "nav_strip",
      eyebrow: "Doporučeno pro vás",
      headline: "Pokračujte v přípravě na medicínu",
      body: "Přípravné kurzy, self-test a AI tutor — studentské předplatné od 149 Kč/měsíc.",
      ctaLabel: "14 dní zdarma",
      ctaHref: "/predplatne?trial=1#student",
    },
  ],
  article_gate: [
    {
      slot: "article_gate",
      eyebrow: "Pro váš zájem",
      headline: "Tento obsah je součástí MedScope VIP",
      body: "Na základě vašeho zájmu o medicínu jsme pro vás připravili plný přístup k odborným článkům, alertům a AI asistentovi.",
      ctaLabel: "Odemknout předplatným",
      ctaHref: "/predplatne",
      hint: "Náhled níže — zbytek po aktivaci",
    },
    {
      slot: "article_gate",
      eyebrow: "Exkluzivně pro předplatitele",
      headline: "Pokračujte ve čtení s MedScope Premium",
      body: "VIP články obsahují klinické dopady, klíčové body a ověřené zdroje — navržené pro studenty a lékaře.",
      ctaLabel: "Vybrat plán",
      ctaHref: "/predplatne",
    },
  ],
  article_inline: [
    {
      slot: "article_inline",
      eyebrow: "Volitelné předplatné",
      headline: "Číst dál bez reklam",
      body: "14 dní zdarma, potom tarif Veřejnost 99 Kč. Tipy v článcích zůstávají dobrovolné.",
      ctaLabel: "Vyzkoušet 14 dní",
      ctaHref: "/predplatne?trial=1",
    },
  ],
  video_overlay: [
    {
      slot: "video_overlay",
      eyebrow: "Pro váš zájem",
      headline: "Pokračujte ve videu s MedScope Premium",
      body: "Plné videokurzy Academy, AI lektor a certifikáty — navržené pro vaši přípravu na LF.",
      ctaLabel: "Odemknout plný přístup",
      ctaHref: "/predplatne",
      hint: "První minuta zdarma",
    },
    {
      slot: "video_overlay",
      eyebrow: "Doporučeno pro vás",
      headline: "Chcete vidět zbytek lekce?",
      body: "Předplatitelé sledují celé kurzy bez přerušení a získávají XP do žebříčku Academy.",
      ctaLabel: "Aktivovat předplatné",
      ctaHref: "/predplatne",
    },
  ],
};

const I18N_STATIC: Record<string, Partial<Record<ConversionSlot, ConversionCopy>>> = {
  en: {
    nav_cta: {
      slot: "nav_cta",
      eyebrow: "For you",
      headline: "MedScope Premium",
      body: "MeDipacient, MediFlow and OrdiZapis plus VIP articles. 14 days free.",
      ctaLabel: "14 days free",
      ctaHref: "/predplatne?trial=1",
    },
    nav_strip: {
      slot: "nav_strip",
      eyebrow: "For you",
      headline: "Apps on your home screen",
      body: "MeDipacient, MediFlow and OrdiZapis — open the trial dashboard now. 14 days free.",
      ctaLabel: "Get the apps",
      ctaHref: "/aplikace",
      hint: "14-day trial",
    },
  },
  de: {
    nav_cta: {
      slot: "nav_cta",
      eyebrow: "Für Sie",
      headline: "MedScope Premium",
      body: "MeDipacient, MediFlow und OrdiZapis plus VIP-Artikel. 14 Tage kostenlos.",
      ctaLabel: "14 Tage kostenlos",
      ctaHref: "/predplatne?trial=1",
    },
    nav_strip: {
      slot: "nav_strip",
      eyebrow: "Für Sie",
      headline: "Apps auf dem Homescreen",
      body: "MeDipacient, MediFlow und OrdiZapis — Testdashboard sofort. 14 Tage kostenlos.",
      ctaLabel: "Apps laden",
      ctaHref: "/aplikace",
      hint: "14 Tage testen",
    },
  },
  fr: {
    nav_cta: {
      slot: "nav_cta",
      eyebrow: "Pour vous",
      headline: "MedScope Premium",
      body: "MeDipacient, MediFlow et OrdiZapis plus articles VIP. 14 jours gratuits.",
      ctaLabel: "14 jours gratuits",
      ctaHref: "/predplatne?trial=1",
    },
    nav_strip: {
      slot: "nav_strip",
      eyebrow: "Pour vous",
      headline: "Des applis sur l’écran d’accueil",
      body: "MeDipacient, MediFlow et OrdiZapis — tableau d’essai immédiat. 14 jours gratuits.",
      ctaLabel: "Télécharger les applis",
      ctaHref: "/aplikace",
      hint: "Essai de 14 jours",
    },
  },
};

function withLocalPrices(copy: ConversionCopy, locale?: string | null): ConversionCopy {
  return {
    ...copy,
    headline: localizeListedCzk(copy.headline, locale),
    body: localizeListedCzk(copy.body, locale),
    ctaLabel: localizeListedCzk(copy.ctaLabel, locale),
  };
}

export function getStaticCopy(slot: ConversionSlot, seed = 0, locale = "cs"): ConversionCopy {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary !== "cs") {
    const pack = I18N_STATIC[primary] ?? I18N_STATIC.en;
    const localized = pack?.[slot];
    if (localized) return withLocalPrices(localized, locale);
  }
  const pool = STATIC_POOL[slot];
  return withLocalPrices(pool[Math.abs(seed) % pool.length] ?? pool[0]!, locale);
}

/** Path-aware nav strip for student / academy prep surfaces. */
export function getStudentiNavStripCopy(seed = 0, locale = "cs"): ConversionCopy {
  const student: ConversionCopy[] = [
    {
      slot: "nav_strip",
      eyebrow: "Pro váš zájem",
      headline: "Pokračujte v přípravě s MeDiprep",
      body: "První test zdarma, pak simulace 8 českých LF. Student 149 Kč · 14 dní zdarma.",
      ctaLabel: "Otevřít MeDiprep",
      ctaHref: "/app/priprava",
      hint: "14 dní na vyzkoušení",
    },
    {
      slot: "nav_strip",
      eyebrow: "Doporučeno pro vás",
      headline: "Pokračujte v přípravě na medicínu",
      body: "Přípravné kurzy, self-test a AI tutor — studentské předplatné od 149 Kč/měsíc.",
      ctaLabel: "14 dní zdarma",
      ctaHref: "/predplatne?trial=1#student",
    },
  ];
  return withLocalPrices(student[Math.abs(seed) % student.length] ?? student[0]!, locale);
}

export function getVerejnostNavStripCopy(locale?: string | null): ConversionCopy {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "de") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "Für Sie",
        headline: "MeDipacient: Befunde auf dem Handy",
        body: "Die Test-Zeitachse ist offen. Eigene Befunde nach der Anmeldung hochladen — 99 CZK/Monat.",
        ctaLabel: "MeDipacient öffnen",
        ctaHref: "/app/pacient",
        hint: "Als App auf den Bildschirm legen",
      },
      locale
    );
  }
  if (primary === "fr") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "Pour vous",
        headline: "MeDipacient : comptes rendus sur le téléphone",
        body: "La frise d’essai est ouverte. Déposez vos propres comptes rendus après connexion — 99 CZK/mois.",
        ctaLabel: "Ouvrir MeDipacient",
        ctaHref: "/app/pacient",
        hint: "Installer sur l’écran d’accueil",
      },
      locale
    );
  }
  if (primary !== "cs") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "For you",
        headline: "MeDipacient: reports on your phone",
        body: "The trial timeline is open. Upload your own reports after sign-in — 99 CZK/month.",
        ctaLabel: "Open MeDipacient",
        ctaHref: "/app/pacient",
        hint: "Add to the home screen",
      },
      locale
    );
  }
  return withLocalPrices(
    {
      slot: "nav_strip",
      eyebrow: "Pro váš zájem",
      headline: "MeDipacient: zprávy v telefonu",
      body: "Zkušební časová osa je otevřená. Nahrání vlastních zpráv po přihlášení — 99 Kč/měsíc.",
      ctaLabel: "Otevřít MeDipacient",
      ctaHref: "/app/pacient",
      hint: "Stažení na plochu jako OrdiZapis",
    },
    locale
  );
}

export function getLekariNavStripCopy(locale = "cs"): ConversionCopy {
  return withLocalPrices(
    {
      slot: "nav_strip",
      eyebrow: "Pro ověřené lékaře",
      headline: "OrdiZapis napíše zápis z diktátu",
      body: "Nahrávejte v mobilu. Stažení po ověření účtu. 390 Kč/měsíc · 14 dní zdarma.",
      ctaLabel: "Stáhnout OrdiZapis",
      ctaHref: "/lekari/dokumentace",
    },
    locale
  );
}

/** MediFlow surfaces — never push MeDipacient 99 Kč here */
export function getMediFlowNavStripCopy(): ConversionCopy {
  return {
    slot: "nav_strip",
    eyebrow: "MediFlow",
    headline: "Wellness deník zdarma",
    body: "Symptomy, suplementy a články z ViaLongeVita. VIP Longevity sync (protokoly) je oddělený plán — ne Student LF.",
    ctaLabel: "Otevřít MediFlow",
    ctaHref: "/app/mediflow",
    hint: "Zdarma · VIP sync volitelně",
  };
}

export function getVipNavStripCopy(locale = "cs"): ConversionCopy {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "de") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "VIP Longevity",
        headline: "10 Protokolle · 14 Tage kostenlos",
        body: "Schlaf, Stoffwechsel, Bewegung. Dann 149 Kč/Monat — getrennt von Academy und MeDipacient.",
        ctaLabel: "VIP-Test starten",
        ctaHref: "/predplatne?trial=1&plan=vip",
        hint: "14 Tage zum Testen",
      },
      locale
    );
  }
  if (primary === "fr") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "VIP Longevity",
        headline: "10 protocoles · 14 jours gratuits",
        body: "Sommeil, métabolisme, mouvement. Puis 149 Kč/mois — distinct de l’Academy et de MeDipacient.",
        ctaLabel: "Commencer l’essai VIP",
        ctaHref: "/predplatne?trial=1&plan=vip",
        hint: "14 jours pour essayer",
      },
      locale
    );
  }
  if (primary !== "cs") {
    return withLocalPrices(
      {
        slot: "nav_strip",
        eyebrow: "VIP Longevity",
        headline: "10 protocols · 14 days free",
        body: "Sleep, metabolism, movement. Then 149 Kč/month — separate from Academy and MeDipacient.",
        ctaLabel: "Start the VIP trial",
        ctaHref: "/predplatne?trial=1&plan=vip",
        hint: "14 days to try",
      },
      locale
    );
  }
  return withLocalPrices(
    {
      slot: "nav_strip",
      eyebrow: "VIP Longevity",
      headline: "10 protokolů · 14 dní zdarma",
      body: "Spánek, metabolismus, pohyb. Pak 149 Kč/měsíc — odděleně od Student LF (Academy) a MeDipacient.",
      ctaLabel: "Začít zkušební VIP",
      ctaHref: "/predplatne?trial=1&plan=vip",
      hint: "14 dní na vyzkoušení",
    },
    locale
  );
}

/** Strip `/cs`, `/en`, … so audience path checks work with locale-prefixed URLs. */
function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/[a-z]{2}(?:-[a-zA-Z]+)?(?=\/|$)/, "");
  return stripped || "/";
}

export function isStudentAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = stripLocalePrefix(pathname);
  return (
    p === "/studenti" ||
    p.startsWith("/studenti/") ||
    p.startsWith("/academy/") ||
    p.startsWith("/studium/") ||
    p.startsWith("/medicina/") ||
    p.startsWith("/mediprep") ||
    p.startsWith("/app/priprava") ||
    p.startsWith("/ai-asistent/student")
  );
}

export function isPublicAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = stripLocalePrefix(pathname);
  return (
    p === "/verejnost" ||
    p.startsWith("/verejnost/") ||
    p.startsWith("/medipacient") ||
    p.startsWith("/app/pacient")
  );
}

export function isPhysicianAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = stripLocalePrefix(pathname);
  return (
    p === "/lekari" ||
    p.startsWith("/lekari/") ||
    p.startsWith("/odborna") ||
    p.startsWith("/app/dokumentace") ||
    p.startsWith("/ordizaznam")
  );
}

export function isMediFlowAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = stripLocalePrefix(pathname);
  return p === "/mediflow" || p.startsWith("/mediflow/") || p.startsWith("/app/mediflow");
}

export function isVipAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = stripLocalePrefix(pathname);
  return p === "/vip" || p.startsWith("/vip/");
}

export function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}
