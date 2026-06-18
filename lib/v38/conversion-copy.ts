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
      body: "VIP články, AI tutor a kurzy Academy bez limitů — od 149 Kč/měsíc.",
      ctaLabel: "Zobrazit plány",
      ctaHref: "/predplatne",
      hint: "7 dní na vyzkoušení",
    },
    {
      slot: "nav_strip",
      eyebrow: "Doporučeno pro vás",
      headline: "Pokračujte tam, kde jste skončili",
      body: "Předplatitelé mají prioritní přístup ke klinickým briefům a videokurzům.",
      ctaLabel: "Aktivovat předplatné",
      ctaHref: "/predplatne",
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

export function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}
