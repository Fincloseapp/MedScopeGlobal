import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";

export type ExchangeTrustStat = { value: string; label: string };

export type ExchangeAudienceTile = {
  id: "manufacturers" | "hospitals" | "laboratories" | "telemedicine";
  image: string;
  title: string;
  body: string;
};

export type ExchangeMarketing = {
  ribbon: string;
  ribbonCta: string;
  navCta: string;
  marketplaceName: string;
  proof: string;
  featured: string;
  audiencesTitle: string;
  audiences: ExchangeAudienceTile[];
  stats: ExchangeTrustStat[];
};

function tiles(
  rows: [ExchangeAudienceTile["id"], string, string][]
): ExchangeAudienceTile[] {
  return rows.map(([id, title, body]) => ({
    id,
    image: EXCHANGE_VISUAL[id],
    title,
    body,
  }));
}

const PACK: Record<ChromePack, Omit<ExchangeMarketing, "stats">> = {
  cs: {
    ribbon: "B2B Tržiště — zdravotnický marketplace · poptávky zdarma, kontakty v Pro",
    ribbonCta: "Otevřít tržiště",
    navCta: "B2B Tržiště",
    marketplaceName: "B2B Tržiště",
    proof: "Poptávky zdarma pro kupující. Kontakty jen pro platící inzerenty. Povinný region. CE / FDA / ISO.",
    featured: "Aktuální nabídky",
    audiencesTitle: "Pro koho je tržiště",
    audiences: tiles([
      ["manufacturers", "Výrobci a dodavatelé", "CE / FDA / ISO produkty pro nemocnice a laboratoře. Jedna nabídka, přímý kontakt."],
      ["hospitals", "Kliniky a nemocnice", "Poptávky zdarma bez registrace. Smlouva vzniká mimo platformu."],
      ["laboratories", "Laboratoře a výzkum", "Panely, logistika vzorků a regionální dostupnost EU / USA / Asie."],
      ["telemedicine", "Telemedicína B2B", "Instituce–instituce. Žádná péče přímo pacientovi přes marketplace."],
    ]),
  },
  en: {
    ribbon: "B2B Marketplace — healthcare exchange · free inquiries, contacts on Pro",
    ribbonCta: "Open marketplace",
    navCta: "B2B Market",
    marketplaceName: "B2B Marketplace",
    proof: "Free buyer inquiries. Contacts for paying advertisers only. Mandatory region. CE / FDA / ISO on products.",
    featured: "Featured listings",
    audiencesTitle: "Who it is for",
    audiences: tiles([
      ["manufacturers", "Manufacturers", "CE / FDA / ISO products for hospitals and labs. One listing, direct contact."],
      ["hospitals", "Clinics and hospitals", "Free inquiries, no account. Contracts stay off-platform."],
      ["laboratories", "Laboratories and research", "Assays, sample logistics and EU / USA / Asia availability."],
      ["telemedicine", "B2B telemedicine", "Institution to institution. No direct-to-patient care on the marketplace."],
    ]),
  },
  de: {
    ribbon: "B2B-Marktplatz — Gesundheits-Exchange · Anfragen gratis, Kontakte ab Pro",
    ribbonCta: "Marktplatz öffnen",
    navCta: "B2B-Markt",
    marketplaceName: "B2B-Marktplatz",
    proof: "Kostenlose Käuferanfragen. Kontakte nur für zahlende Inserenten. Pflichtregion. CE / FDA / ISO.",
    featured: "Aktuelle Angebote",
    audiencesTitle: "Für wen",
    audiences: tiles([
      ["manufacturers", "Hersteller", "CE / FDA / ISO für Kliniken und Labore. Ein Inserat, Direktkontakt."],
      ["hospitals", "Kliniken und Krankenhäuser", "Anfragen gratis, ohne Konto. Verträge bleiben außerhalb."],
      ["laboratories", "Labore und Forschung", "Assays, Probenlogistik, EU / USA / Asien."],
      ["telemedicine", "B2B-Telemedizin", "Institution zu Institution. Keine Direktversorgung über den Marktplatz."],
    ]),
  },
  fr: {
    ribbon: "Place B2B — marketplace santé · demandes gratuites, contacts dès Pro",
    ribbonCta: "Ouvrir la place",
    navCta: "Place B2B",
    marketplaceName: "Place de marché B2B",
    proof: "Demandes gratuites. Contacts réservés aux annonceurs payants. Région obligatoire. CE / FDA / ISO.",
    featured: "Offres en avant",
    audiencesTitle: "Pour qui",
    audiences: tiles([
      ["manufacturers", "Fabricants", "Produits CE / FDA / ISO pour hôpitaux et laboratoires."],
      ["hospitals", "Cliniques et hôpitaux", "Demandes gratuites, sans compte. Contrats hors plateforme."],
      ["laboratories", "Laboratoires et recherche", "Analyses, logistique d’échantillons, UE / USA / Asie."],
      ["telemedicine", "Télémédecine B2B", "Institution à institution. Pas de soin patient sur la place."],
    ]),
  },
  it: {
    ribbon: "Piazza B2B — marketplace sanitario · richieste gratis, contatti con Pro",
    ribbonCta: "Apri la piazza",
    navCta: "Piazza B2B",
    marketplaceName: "Piazza B2B",
    proof: "Richieste gratuite. Contatti solo per inserzionisti paganti. Regione obbligatoria. CE / FDA / ISO.",
    featured: "Offerte in evidenza",
    audiencesTitle: "Per chi",
    audiences: tiles([
      ["manufacturers", "Produttori", "Dispositivi CE / FDA / ISO per ospedali e laboratori."],
      ["hospitals", "Cliniche e ospedali", "Richieste gratis, senza account. Contratti fuori piattaforma."],
      ["laboratories", "Laboratori e ricerca", "Analisi, logistica campioni, UE / USA / Asia."],
      ["telemedicine", "Telemedicina B2B", "Istituzione a istituzione. Nessuna cura diretta al paziente."],
    ]),
  },
  es: {
    ribbon: "Mercado B2B — marketplace sanitario · solicitudes gratis, contactos en Pro",
    ribbonCta: "Abrir el mercado",
    navCta: "Mercado B2B",
    marketplaceName: "Mercado B2B",
    proof: "Solicitudes gratis. Contactos solo para anunciantes de pago. Región obligatoria. CE / FDA / ISO.",
    featured: "Ofertas destacadas",
    audiencesTitle: "Para quién",
    audiences: tiles([
      ["manufacturers", "Fabricantes", "Productos CE / FDA / ISO para hospitales y laboratorios."],
      ["hospitals", "Clínicas y hospitales", "Solicitudes gratis, sin cuenta. Contratos fuera de la plataforma."],
      ["laboratories", "Laboratorios e investigación", "Ensayos, logística de muestras, UE / EE. UU. / Asia."],
      ["telemedicine", "Telemedicina B2B", "Institución a institución. Sin atención directa al paciente."],
    ]),
  },
  "pt-BR": {
    ribbon: "Mercado B2B — marketplace de saúde · pedidos grátis, contactos no Pro",
    ribbonCta: "Abrir o mercado",
    navCta: "Mercado B2B",
    marketplaceName: "Mercado B2B",
    proof: "Pedidos grátis. Contactos só para anunciantes pagantes. Região obrigatória. CE / FDA / ISO.",
    featured: "Ofertas em destaque",
    audiencesTitle: "Para quem",
    audiences: tiles([
      ["manufacturers", "Fabricantes", "Produtos CE / FDA / ISO para hospitais e laboratórios."],
      ["hospitals", "Clínicas e hospitais", "Pedidos grátis, sem conta. Contratos fora da plataforma."],
      ["laboratories", "Laboratórios e investigação", "Ensaios, logística de amostras, UE / EUA / Ásia."],
      ["telemedicine", "Telemedicina B2B", "Instituição a instituição. Sem cuidado direto ao paciente."],
    ]),
  },
};

const STAT_LABELS: Record<ChromePack, [string, string, string, string]> = {
  cs: ["provize z obchodu", "povinný region", "pouze B2B", "u produktů"],
  en: ["deal commission", "mandatory region", "B2B only", "on products"],
  de: ["Dealprovision", "Pflichtregion", "nur B2B", "bei Produkten"],
  fr: ["commission d’affaire", "région obligatoire", "B2B uniquement", "sur les produits"],
  it: ["commissione sull’affare", "regione obbligatoria", "solo B2B", "sui prodotti"],
  es: ["comisión del trato", "región obligatoria", "solo B2B", "en productos"],
  "pt-BR": ["comissão do negócio", "região obrigatória", "somente B2B", "em produtos"],
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
