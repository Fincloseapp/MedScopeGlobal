import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";

export type ExchangeTrustStat = { value: string; label: string };

export type ExchangeMarketing = {
  ribbon: string;
  ribbonCta: string;
  navCta: string;
  proof: string;
  featured: string;
  stats: ExchangeTrustStat[];
};

const PACK: Record<ChromePack, Omit<ExchangeMarketing, "stats">> = {
  cs: {
    ribbon: "MedScope B2B Exchange — zdravotnický marketplace · přímý kontakt bez provize",
    ribbonCta: "Vstoupit",
    navCta: "Exchange",
    proof: "Přímý kontakt. Žádná provize. Povinný region. Certifikace CE / FDA / ISO.",
    featured: "Aktuální nabídky",
  },
  en: {
    ribbon: "MedScope B2B Exchange — healthcare marketplace · direct contact, no intro fee",
    ribbonCta: "Open",
    navCta: "Exchange",
    proof: "Direct contact. No introduction fee. Mandatory region. CE / FDA / ISO on products.",
    featured: "Featured listings",
  },
  de: {
    ribbon: "MedScope B2B Exchange — Gesundheits-Marktplatz · Direktkontakt, keine Provision",
    ribbonCta: "Öffnen",
    navCta: "Exchange",
    proof: "Direktkontakt. Keine Kontaktprovision. Pflichtregion. CE / FDA / ISO bei Produkten.",
    featured: "Aktuelle Angebote",
  },
  fr: {
    ribbon: "MedScope B2B Exchange — marketplace santé · contact direct, sans commission",
    ribbonCta: "Entrer",
    navCta: "Exchange",
    proof: "Contact direct. Aucune commission d’introduction. Région obligatoire. CE / FDA / ISO.",
    featured: "Offres en avant",
  },
  it: {
    ribbon: "MedScope B2B Exchange — marketplace sanitario · contatto diretto, senza commissione",
    ribbonCta: "Entra",
    navCta: "Exchange",
    proof: "Contatto diretto. Nessuna commissione. Regione obbligatoria. CE / FDA / ISO.",
    featured: "Offerte in evidenza",
  },
  es: {
    ribbon: "MedScope B2B Exchange — marketplace sanitario · contacto directo, sin comisión",
    ribbonCta: "Entrar",
    navCta: "Exchange",
    proof: "Contacto directo. Sin comisión de presentación. Región obligatoria. CE / FDA / ISO.",
    featured: "Ofertas destacadas",
  },
  "pt-BR": {
    ribbon: "MedScope B2B Exchange — marketplace de saúde · contato direto, sem comissão",
    ribbonCta: "Entrar",
    navCta: "Exchange",
    proof: "Contato direto. Sem comissão de introdução. Região obrigatória. CE / FDA / ISO.",
    featured: "Ofertas em destaque",
  },
};

const STAT_LABELS: Record<ChromePack, [string, string, string, string]> = {
  cs: ["provize za kontakt", "povinný region", "pouze B2B", "u produktů"],
  en: ["introduction fee", "mandatory region", "B2B only", "on products"],
  de: ["Kontaktprovision", "Pflichtregion", "nur B2B", "bei Produkten"],
  fr: ["commission de contact", "région obligatoire", "B2B uniquement", "sur les produits"],
  it: ["commissione di contatto", "regione obbligatoria", "solo B2B", "sui prodotti"],
  es: ["comisión de contacto", "región obligatoria", "solo B2B", "en productos"],
  "pt-BR": ["comissão de contato", "região obrigatória", "somente B2B", "em produtos"],
};

export function getExchangeMarketing(locale?: string | null): ExchangeMarketing {
  const pack = chromePack(locale);
  const copy = PACK[pack];
  const labels = STAT_LABELS[pack];
  const regions = AVAILABILITY_REGIONS.map((region) => regionLabel(region, locale ?? "en")).join(" · ");
  return {
    ...copy,
    stats: [
      { value: "0 %", label: labels[0] },
      { value: regions, label: labels[1] },
      { value: "B2B", label: labels[2] },
      { value: "CE · FDA · ISO", label: labels[3] },
    ],
  };
}
