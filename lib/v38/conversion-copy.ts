/** v38 — static conversion copy pool with "pro váš zájem" framing */

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
      body: "Aplikace MeDipacient, MeDiprep a MeDiktor plus VIP články. 14 dní zdarma.",
      ctaLabel: "14 dní zdarma",
      ctaHref: "/predplatne?trial=1",
    },
  ],
  nav_strip: [
    {
      slot: "nav_strip",
      eyebrow: "Pro váš zájem",
      headline: "Tři aplikace na ploše telefonu",
      body: "MeDipacient, MeDiprep a MeDiktor — zkušební dashboard hned, předplatné od 99 Kč. 14 dní zdarma.",
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
      eyebrow: "Pro váš zájem",
      headline: "Líbí se vám tento obsah?",
      body: "S předplatným získáte neomezený přístup k VIP článkům, prioritní alerty a AI tutor.",
      ctaLabel: "Zobrazit předplatné",
      ctaHref: "/predplatne",
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

export function getStaticCopy(slot: ConversionSlot, seed = 0): ConversionCopy {
  const pool = STATIC_POOL[slot];
  return pool[Math.abs(seed) % pool.length] ?? pool[0]!;
}

/** Path-aware nav strip for student / academy prep surfaces. */
export function getStudentiNavStripCopy(seed = 0): ConversionCopy {
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
  return student[Math.abs(seed) % student.length] ?? student[0]!;
}

export function getVerejnostNavStripCopy(): ConversionCopy {
  return {
    slot: "nav_strip",
    eyebrow: "Pro váš zájem",
    headline: "MeDipacient: zprávy v telefonu",
    body: "Zkušební časová osa je otevřená. Nahrání vlastních zpráv po přihlášení — 99 Kč/měsíc.",
    ctaLabel: "Otevřít MeDipacient",
    ctaHref: "/app/pacient",
    hint: "Stažení na plochu jako MeDiktor",
  };
}

export function getLekariNavStripCopy(): ConversionCopy {
  return {
    slot: "nav_strip",
    eyebrow: "Pro ověřené lékaře",
    headline: "MeDiktor napíše zápis z diktátu",
    body: "Nahrávejte v mobilu. Stažení po ověření účtu. 390 Kč/měsíc · 14 dní zdarma.",
    ctaLabel: "Stáhnout MeDiktor",
    ctaHref: "/lekari/dokumentace",
  };
}

export function isStudentAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/studenti" ||
    pathname.startsWith("/studenti/") ||
    pathname.startsWith("/academy/") ||
    pathname.startsWith("/studium/") ||
    pathname.startsWith("/medicina/") ||
    pathname.startsWith("/mediprep") ||
    pathname.startsWith("/app/priprava") ||
    pathname.startsWith("/ai-asistent/student")
  );
}

export function isPublicAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/verejnost" ||
    pathname.startsWith("/verejnost/") ||
    pathname.startsWith("/medipacient") ||
    pathname.startsWith("/app/pacient")
  );
}

export function isPhysicianAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/lekari" ||
    pathname.startsWith("/lekari/") ||
    pathname.startsWith("/odborna") ||
    pathname.startsWith("/app/dokumentace")
  );
}

export function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}
