import { MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { normalizeLocale } from "@/lib/i18n/config";
import { exchangeEdition, type ExchangeEdition } from "@/lib/i18n/exchange-copy-editions";
import type { ExchangeListingId } from "@/lib/b2b/exchange-listings";

export type ExchangeListingCopy = {
  region: string;
  category: string;
  title: string;
  maker: string;
  cert: string;
  summary: string;
};

export type ExchangeCopy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  leadBefore: string;
  firmyLinkLabel: string;
  leadAfter: string;
  registerCta: string;
  adsCta: string;
  regions: string;
  heroAlt: string;
  listings: Record<ExchangeListingId, ExchangeListingCopy>;
};

const PACK: Record<ChromePack, ExchangeCopy> = {
  cs: {
    metaTitle: "B2B Tržiště — výrobci a laboratoře v Česku a EU",
    metaDescription:
      "Poptávky zdarma pro nemocnice a laboratoře. Kontakty vidí platící inzerent. Česko a EU, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Tržiště pro výrobce, nemocnice a laboratoře",
    leadBefore: `Kupující z Česka a EU poptává zdarma. Kontakty vidí jen platící inzerent — bez provize z obchodu. Magazín ${MAGAZINE.name} sem nepatří: čtenářská inzerce je na`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Registrovat firmu",
    adsCta: "Inzerce v magazínu",
    regions: "Regiony: Česko · EU. Certifikace: CE / IVDR / ISO.",
    heroAlt: "Laboratorní stanice — tržiště výrobců MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Česko + EU",
        category: "Diagnostika · POC",
        title: "CE-IVDR analyzátor pro ordinaci (imunoassay)",
        maker: "EU výrobce, distribuce ČR/SK",
        cert: "CE / IVDR",
        summary:
          "Point-of-care imunoassay pro ambulance a laboratoře v Česku a na Slovensku. Kontakty až po ověření inzerenta — bez provize z obchodu.",
      },
      "lab-panels-eu": {
        region: "EU",
        category: "Laboratoř",
        title: "Imunologické panely pro EU laboratoře",
        maker: "Výrobce v EU, sklady DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Specializované panely pro nemocniční a smluvní laboratoře v Evropské unii. Sklady DE/CZ, certifikace CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Česko",
        category: "Telemedicína B2B",
        title: "Instituce–instituce: telemedicínský kanál pro české sítě",
        maker: "Dodavatel se sídlem v ČR",
        cert: "GDPR · bez péče přímo pacientovi",
        summary:
          "B2B napojení nemocnice / laboratoř / síť ambulancí. Žádná distanční péče koncovému pacientovi přes tržiště.",
      },
    },
  },
  en: {
    metaTitle: "B2B marketplace — manufacturers and labs in Czechia and the EU",
    metaDescription:
      "Free demand posts for hospitals and labs. Contacts are visible to paying advertisers. Czechia and the EU, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Marketplace for manufacturers, hospitals and laboratories",
    leadBefore: `Buyers in Czechia and the EU post demand for free. Only paying advertisers see contacts — no trade commission. ${MAGAZINE.name} does not belong here: reader advertising sits on`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Register a company",
    adsCta: "Magazine advertising",
    regions: "Regions: Czechia · EU. Certification: CE / IVDR / ISO.",
    heroAlt: "Laboratory workstation — MedScopeGlobal manufacturer marketplace",
    listings: {
      "poc-cr-ce": {
        region: "Czechia + EU",
        category: "Diagnostics · POC",
        title: "CE-IVDR immunoassay analyser for the clinic",
        maker: "EU manufacturer, CZ/SK distribution",
        cert: "CE / IVDR",
        summary:
          "Point-of-care immunoassay for clinics and labs in Czechia and Slovakia. Contacts after advertiser verification — no trade commission.",
      },
      "lab-panels-eu": {
        region: "EU",
        category: "Laboratory",
        title: "Immunology panels for EU laboratories",
        maker: "EU manufacturer, DE/CZ warehouses",
        cert: "CE / ISO 13485",
        summary:
          "Specialist panels for hospital and contract labs in the European Union. DE/CZ stock, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Czechia",
        category: "B2B telemedicine",
        title: "Institution-to-institution telemedicine for Czech networks",
        maker: "Supplier incorporated in Czechia",
        cert: "GDPR · no direct-to-patient care",
        summary:
          "B2B links between hospitals, labs and clinic networks. No remote care to end patients through the marketplace.",
      },
    },
  },
  de: {
    metaTitle: "B2B-Marktplatz — Hersteller und Labore in Tschechien und der EU",
    metaDescription:
      "Kostenlose Nachfrage für Kliniken und Labore. Kontakte sehen zahlende Inserenten. Tschechien und EU, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Marktplatz für Hersteller, Kliniken und Labore",
    leadBefore: `Käufer in Tschechien und der EU stellen Nachfrage kostenlos ein. Kontakte sehen nur zahlende Inserenten — ohne Handelsprovision. ${MAGAZINE.name} gehört nicht hierher: Leserwerbung liegt auf`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Firma registrieren",
    adsCta: "Magazinwerbung",
    regions: "Regionen: Tschechien · EU. Zertifizierung: CE / IVDR / ISO.",
    heroAlt: "Laborarbeitsplatz — MedScopeGlobal-Herstellermarktplatz",
    listings: {
      "poc-cr-ce": {
        region: "Tschechien + EU",
        category: "Diagnostik · POC",
        title: "CE-IVDR-Immunoassay-Analysator für die Praxis",
        maker: "EU-Hersteller, Vertrieb CZ/SK",
        cert: "CE / IVDR",
        summary:
          "Point-of-Care-Immunoassay für Praxen und Labore in Tschechien und der Slowakei. Kontakte nach Prüfung — ohne Handelsprovision.",
      },
      "lab-panels-eu": {
        region: "EU",
        category: "Labor",
        title: "Immunologie-Panels für EU-Labore",
        maker: "EU-Hersteller, Lager DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Spezialpanels für Krankenhaus- und Auftragslabore in der EU. Lager DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Tschechien",
        category: "B2B-Telemedizin",
        title: "Institution-zu-Institution: Telemedizin für tschechische Netze",
        maker: "Anbieter mit Sitz in Tschechien",
        cert: "DSGVO · keine Direktversorgung von Patientinnen",
        summary:
          "B2B-Anbindung Klinik / Labor / Praxiskette. Keine Fernbehandlung von Endpatienten über den Marktplatz.",
      },
    },
  },
  fr: {
    metaTitle: "Place de marché B2B — fabricants et laboratoires en Tchéquie et dans l’UE",
    metaDescription:
      "Demandes gratuites pour hôpitaux et laboratoires. Les contacts sont visibles aux annonceurs payants. Tchéquie et UE, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Place de marché pour fabricants, hôpitaux et laboratoires",
    leadBefore: `Les acheteurs en Tchéquie et dans l’UE publient gratuitement. Seuls les annonceurs payants voient les contacts — sans commission. ${MAGAZINE.name} n’a pas sa place ici : la publicité lecteurs est sur`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Enregistrer une entreprise",
    adsCta: "Publicité magazine",
    regions: "Régions : Tchéquie · UE. Certification : CE / IVDR / ISO.",
    heroAlt: "Poste de laboratoire — place de marché MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Tchéquie + UE",
        category: "Diagnostic · POC",
        title: "Analyseur d’immunoessais CE-IVDR pour le cabinet",
        maker: "Fabricant UE, distribution CZ/SK",
        cert: "CE / IVDR",
        summary:
          "Immunoessai au point de soin pour cabinets et laboratoires en Tchéquie et en Slovaquie. Contacts après vérification — sans commission.",
      },
      "lab-panels-eu": {
        region: "UE",
        category: "Laboratoire",
        title: "Panels d’immunologie pour laboratoires de l’UE",
        maker: "Fabricant UE, entrepôts DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Panels spécialisés pour laboratoires hospitaliers et contractuels dans l’UE. Stocks DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Tchéquie",
        category: "Télémédecine B2B",
        title: "Canal institution–institution pour les réseaux tchèques",
        maker: "Fournisseur établi en Tchéquie",
        cert: "RGPD · pas de soins directs au patient",
        summary:
          "Liaison B2B hôpital / laboratoire / réseau de cabinets. Aucun soin à distance au patient final via la place de marché.",
      },
    },
  },
  it: {
    metaTitle: "Mercato B2B — produttori e laboratori in Cechia e UE",
    metaDescription:
      "Richieste gratuite per ospedali e laboratori. I contatti li vedono gli inserzionisti paganti. Cechia e UE, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Mercato per produttori, ospedali e laboratori",
    leadBefore: `Gli acquirenti in Cechia e UE pubblicano gratis. I contatti li vedono solo gli inserzionisti paganti — senza commissione. ${MAGAZINE.name} non sta qui: la pubblicità per i lettori è su`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Registra l’azienda",
    adsCta: "Pubblicità sul magazine",
    regions: "Regioni: Cechia · UE. Certificazione: CE / IVDR / ISO.",
    heroAlt: "Postazione di laboratorio — mercato produttori MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Cechia + UE",
        category: "Diagnostica · POC",
        title: "Analizzatore immunoassay CE-IVDR per ambulatorio",
        maker: "Produttore UE, distribuzione CZ/SK",
        cert: "CE / IVDR",
        summary:
          "Immunoassay point-of-care per ambulatori e laboratori in Cechia e Slovacchia. Contatti dopo verifica — senza commissione.",
      },
      "lab-panels-eu": {
        region: "UE",
        category: "Laboratorio",
        title: "Pannelli immunologici per laboratori UE",
        maker: "Produttore UE, magazzini DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Pannelli specialistici per laboratori ospedalieri e in conto terzi nell’UE. Scorte DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Cechia",
        category: "Telemedicina B2B",
        title: "Canale istituzionale per reti ceche",
        maker: "Fornitore con sede in Cechia",
        cert: "GDPR · nessuna cura diretta al paziente",
        summary:
          "Collegamento B2B ospedale / laboratorio / rete ambulatoriale. Nessuna cura a distanza al paziente finale sul mercato.",
      },
    },
  },
  es: {
    metaTitle: "Mercado B2B — fabricantes y laboratorios en Chequia y la UE",
    metaDescription:
      "Demandas gratuitas para hospitales y laboratorios. Los contactos los ven anunciantes de pago. Chequia y UE, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Mercado para fabricantes, hospitales y laboratorios",
    leadBefore: `Los compradores en Chequia y la UE publican gratis. Solo los anunciantes de pago ven contactos — sin comisión. ${MAGAZINE.name} no pertenece aquí: la publicidad para lectores está en`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Registrar empresa",
    adsCta: "Publicidad en la revista",
    regions: "Regiones: Chequia · UE. Certificación: CE / IVDR / ISO.",
    heroAlt: "Estación de laboratorio — mercado de fabricantes MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Chequia + UE",
        category: "Diagnóstico · POC",
        title: "Analizador de inmunoensayo CE-IVDR para consulta",
        maker: "Fabricante UE, distribución CZ/SK",
        cert: "CE / IVDR",
        summary:
          "Inmunoensayo en el punto de atención para consultas y laboratorios en Chequia y Eslovaquia. Contactos tras verificación — sin comisión.",
      },
      "lab-panels-eu": {
        region: "UE",
        category: "Laboratorio",
        title: "Paneles de inmunología para laboratorios de la UE",
        maker: "Fabricante UE, almacenes DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Paneles especializados para laboratorios hospitalarios y de contrato en la UE. Stock DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Chequia",
        category: "Telemedicina B2B",
        title: "Canal institución–institución para redes checas",
        maker: "Proveedor con sede en Chequia",
        cert: "RGPD · sin atención directa al paciente",
        summary:
          "Enlace B2B hospital / laboratorio / red de consultas. Sin atención a distancia al paciente final en el mercado.",
      },
    },
  },
  "pt-BR": {
    metaTitle: "Mercado B2B — fabricantes e laboratórios na Chéquia e na UE",
    metaDescription:
      "Demandas grátis para hospitais e laboratórios. Contatos visíveis a anunciantes pagantes. Chéquia e UE, CE / IVDR / ISO.",
    kicker: "MedScopeGlobal.com · B2B",
    title: "Mercado para fabricantes, hospitais e laboratórios",
    leadBefore: `Compradores na Chéquia e na UE publicam de graça. Só anunciantes pagantes veem contatos — sem comissão. ${MAGAZINE.name} não entra aqui: a publicidade para leitores fica em`,
    firmyLinkLabel: "/firmy",
    leadAfter: ".",
    registerCta: "Registrar empresa",
    adsCta: "Publicidade na revista",
    regions: "Regiões: Chéquia · UE. Certificação: CE / IVDR / ISO.",
    heroAlt: "Estação de laboratório — mercado de fabricantes MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Chéquia + UE",
        category: "Diagnóstico · POC",
        title: "Analisador de imunoensaio CE-IVDR para o consultório",
        maker: "Fabricante UE, distribuição CZ/SK",
        cert: "CE / IVDR",
        summary:
          "Imunoensaio no ponto de atendimento para consultórios e laboratórios na Chéquia e na Eslováquia. Contatos após verificação — sem comissão.",
      },
      "lab-panels-eu": {
        region: "UE",
        category: "Laboratório",
        title: "Painéis de imunologia para laboratórios da UE",
        maker: "Fabricante UE, armazéns DE/CZ",
        cert: "CE / ISO 13485",
        summary:
          "Painéis especializados para laboratórios hospitalares e de contrato na UE. Estoque DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Chéquia",
        category: "Telemedicina B2B",
        title: "Canal instituição–instituição para redes tchecas",
        maker: "Fornecedor sediado na Chéquia",
        cert: "LGPD/GDPR · sem cuidado direto ao paciente",
        summary:
          "Ligação B2B hospital / laboratório / rede de consultórios. Sem atendimento remoto ao paciente final pelo mercado.",
      },
    },
  },
};

function applyEdition(pack: ExchangeCopy, edition?: ExchangeEdition): ExchangeCopy {
  if (!edition) return pack;
  const listings = { ...pack.listings };
  if (edition.listings) {
    for (const [id, overlay] of Object.entries(edition.listings)) {
      const key = id as ExchangeListingId;
      if (listings[key] && overlay) listings[key] = { ...listings[key], ...overlay };
    }
  }
  return { ...pack, ...edition, listings };
}

export function getExchangeCopy(locale?: string | null): ExchangeCopy {
  const packKey = chromePack(locale);
  const pack = PACK[packKey] ?? PACK.en;
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  const edition =
    (packKey === "en" && primary !== "en") || primary === "pt" ? exchangeEdition(primary) : undefined;
  return applyEdition(pack, edition);
}
