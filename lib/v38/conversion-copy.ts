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
      body: "Plný přístup k VIP článkům a Academy.",
      ctaLabel: "Předplatné",
      ctaHref: "/predplatne",
    },
  ],
  nav_strip: [
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
  const pool = STATIC_POOL.nav_strip;
  return pool[Math.abs(seed) % pool.length] ?? pool[0]!;
}

export function isStudentAudiencePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/studenti" ||
    pathname.startsWith("/studenti/") ||
    pathname.startsWith("/academy/") ||
    pathname.startsWith("/studium/") ||
    pathname.startsWith("/medicina/") ||
    pathname.startsWith("/ai-asistent/student")
  );
}

export function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}
