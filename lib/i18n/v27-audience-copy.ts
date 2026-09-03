import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import type { V27Audience } from "@/lib/v27/config";
import { V27_AUDIENCES } from "@/lib/v27/config";

type HubOverlay = {
  label: string;
  shortLabel: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  enter: string;
};

const B2B: Record<ChromePack, HubOverlay> = {
  cs: {
    label: "Pro firmy",
    shortLabel: "B2B",
    description: "Reklama, sponzorství, pharma balíčky a univerzitní partnerství.",
    ctaPrimary: "Ceník inzerce",
    ctaSecondary: "Kontakt",
    enter: "Vstoupit",
  },
  de: {
    label: "Für Unternehmen",
    shortLabel: "B2B",
    description: "Werbung, Sponsoring, Pharma-Pakete und Universitätspartnerschaften.",
    ctaPrimary: "Werbe-Preisliste",
    ctaSecondary: "Kontakt",
    enter: "Öffnen",
  },
  fr: {
    label: "Pour les entreprises",
    shortLabel: "B2B",
    description: "Publicité, sponsoring, offres pharma et partenariats universitaires.",
    ctaPrimary: "Tarifs publicitaires",
    ctaSecondary: "Contact",
    enter: "Entrer",
  },
  it: {
    label: "Per le aziende",
    shortLabel: "B2B",
    description: "Pubblicità, sponsorizzazioni, pacchetti pharma e partnership universitarie.",
    ctaPrimary: "Listino pubblicitario",
    ctaSecondary: "Contatti",
    enter: "Entra",
  },
  es: {
    label: "Para empresas",
    shortLabel: "B2B",
    description: "Publicidad, patrocinio, paquetes pharma y alianzas universitarias.",
    ctaPrimary: "Tarifas publicitarias",
    ctaSecondary: "Contacto",
    enter: "Entrar",
  },
  "pt-BR": {
    label: "Para empresas",
    shortLabel: "B2B",
    description: "Publicidade, patrocínio, pacotes pharma e parcerias universitárias.",
    ctaPrimary: "Tabela de anúncios",
    ctaSecondary: "Contato",
    enter: "Entrar",
  },
  en: {
    label: "For companies",
    shortLabel: "B2B",
    description: "Advertising, sponsorship, pharma packages and university partnerships.",
    ctaPrimary: "Advertising rates",
    ctaSecondary: "Contact",
    enter: "Enter",
  },
};

export function getV27AudienceHubCopy(audience: V27Audience, locale?: string | null) {
  const cfg = V27_AUDIENCES[audience];
  const pack = chromePack(locale);
  const overlay = audience === "b2b" ? B2B[pack] : null;
  return {
    label: overlay?.label ?? cfg.label,
    shortLabel: overlay?.shortLabel ?? cfg.shortLabel,
    description: overlay?.description ?? cfg.description,
    primaryHref: cfg.ctaPrimary.href,
    secondaryHref: cfg.ctaSecondary.href,
    primaryLabel: overlay?.ctaPrimary ?? cfg.ctaPrimary.label,
    secondaryLabel: overlay?.ctaSecondary ?? cfg.ctaSecondary.label,
    hubHref: cfg.href,
    enter: overlay?.enter ?? (pack === "cs" ? "Vstoupit" : "Enter"),
  };
}
