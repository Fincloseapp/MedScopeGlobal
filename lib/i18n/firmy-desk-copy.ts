/**
 * Company desk chrome for /firmy and /firmy/{reklama,partnerstvi,kampane}.
 * Prices stay CZK internally; display goes through localizeListedCzkIn.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";

export type FirmyRoomId = "reklama" | "partnerstvi" | "kampane";

export type FirmyDeskCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  roomsKicker: string;
  roomsTitle: string;
  rooms: Record<
    FirmyRoomId | "cenik",
    { href: string; title: string; body: string; metaTitle: string; metaDescription: string; lead: string }
  >;
};

const PACK: Record<ChromePack, FirmyDeskCopy> = {
  cs: {
    metaTitle: "Pro firmy — inzerce na ViaLongeVita",
    metaDescription:
      "Bannery, sponzorované články a partnerství pro pharma, kliniky a univerzity. Banner od 5 000 Kč/měs.",
    eyebrow: "Firmy a partneři",
    title: "Inzerce na ViaLongeVita",
    lead: "Zdravotnické firmy inzerují v magazínu, ne v lékařské zóně. Ceník je orientační, nabídka do 2 pracovních dnů.",
    roomsKicker: "Formáty",
    roomsTitle: "Kam patří která poptávka",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Ceník",
        body: "Banner 5 000 Kč/měs., sponzorovaný článek 15 000 Kč, enterprise na míru.",
        metaTitle: "B2B ceník pro firmy",
        metaDescription: "Transparentní ceník pro pharma, kliniky a univerzity.",
        lead: "Orientační ceny bez DPH. Finální nabídku připravíme do 2 pracovních dnů.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Reklama",
        body: "Bannery a newsletter sloty v magazínu. Lékařská zóna zůstává bez reklam.",
        metaTitle: "Reklama pro zdravotnické firmy",
        metaDescription: "Bannery a newsletter sloty na ViaLongeVita — ne v lékařské zóně.",
        lead: "Bannery rotují v magazínu a ve veřejné části. OrdiZapis a /lekari reklamu neberou.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Partnerství",
        body: "Univerzitní a institucionální spolupráce — ne affiliate a ne skrytá inzerce.",
        metaTitle: "Partnerství firem a institucí",
        metaDescription: "Univerzitní a institucionální partnerství na MedScopeGlobal.",
        lead: "Partnerství je označené. Není to skrytá inzerce a není to vstup do lékařské zóny.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Kampaně",
        body: "Segmentace čtenáři magazínu / veřejnost. Lékaři a studenti mají vlastní plochy bez affiliate.",
        metaTitle: "Kampaně pro firmy",
        metaDescription: "Segmentované kampaně na ViaLongeVita pro veřejnost a magazín.",
        lead: "Kampaně cílí magazín a veřejnost. Odborné plochy lékařů zůstávají bez affiliate.",
      },
    },
  },
  de: {
    metaTitle: "Für Unternehmen — Werbung auf ViaLongeVita",
    metaDescription:
      "Banner, Partnerartikel und Partnerschaften für Pharma, Kliniken und Universitäten. Banner ab 5 000 Kč/Monat.",
    eyebrow: "Unternehmen und Partner",
    title: "Werbung auf ViaLongeVita",
    lead: "Gesundheitsfirmen werben im Magazin, nicht in der Arztzone. Preise sind Richtwerte, Angebot in 2 Arbeitstagen.",
    roomsKicker: "Formate",
    roomsTitle: "Welche Anfrage wohin gehört",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Preise",
        body: "Banner 5 000 Kč/Monat, Partnerartikel 15 000 Kč, Enterprise auf Anfrage.",
        metaTitle: "B2B-Preise für Unternehmen",
        metaDescription: "Transparente Preise für Pharma, Kliniken und Universitäten.",
        lead: "Richtpreise ohne MwSt. Ein verbindliches Angebot kommt innerhalb von 2 Arbeitstagen.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Werbung",
        body: "Banner und Newsletter-Slots im Magazin. Die Arztzone bleibt werbefrei.",
        metaTitle: "Werbung für Gesundheitsunternehmen",
        metaDescription: "Banner und Newsletter-Slots auf ViaLongeVita — nicht in der Arztzone.",
        lead: "Banner rotieren im Magazin und im öffentlichen Bereich. OrdiZapis und /lekari nehmen keine Werbung.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Partnerschaft",
        body: "Universitäre und institutionelle Zusammenarbeit — kein Affiliate, keine verdeckte Werbung.",
        metaTitle: "Partnerschaften von Firmen und Institutionen",
        metaDescription: "Universitäre und institutionelle Partnerschaften auf MedScopeGlobal.",
        lead: "Partnerschaften sind gekennzeichnet. Keine verdeckte Werbung und kein Zugang zur Arztzone.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Kampagnen",
        body: "Segmente: Magazinleser / Öffentlichkeit. Ärztinnen und Studierende haben eigene Flächen ohne Affiliate.",
        metaTitle: "Kampagnen für Unternehmen",
        metaDescription: "Segmentierte Kampagnen auf ViaLongeVita für Öffentlichkeit und Magazin.",
        lead: "Kampagnen zielen auf Magazin und Öffentlichkeit. Fachflächen bleiben ohne Affiliate.",
      },
    },
  },
  fr: {
    metaTitle: "Entreprises — publicité sur ViaLongeVita",
    metaDescription:
      "Bannières, articles partenaires et partenariats pour la pharma, les cliniques et les universités. Bannière dès 5 000 Kč/mois.",
    eyebrow: "Entreprises et partenaires",
    title: "Publicité sur ViaLongeVita",
    lead: "Les entreprises de santé annoncent dans le magazine, pas dans l’espace médecins. Tarifs indicatifs, devis sous 2 jours ouvrés.",
    roomsKicker: "Formats",
    roomsTitle: "Où adresser chaque demande",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Tarifs",
        body: "Bannière 5 000 Kč/mois, article partenaire 15 000 Kč, entreprise sur devis.",
        metaTitle: "Tarifs B2B pour les entreprises",
        metaDescription: "Tarifs transparents pour la pharma, les cliniques et les universités.",
        lead: "Tarifs indicatifs hors taxes. Devis ferme sous 2 jours ouvrés.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Publicité",
        body: "Bannières et emplacements newsletter dans le magazine. L’espace médecins reste sans pub.",
        metaTitle: "Publicité pour les entreprises de santé",
        metaDescription: "Bannières et newsletter sur ViaLongeVita — pas dans l’espace médecins.",
        lead: "Les bannières tournent dans le magazine et le grand public. OrdiZapis et /lekari n’acceptent pas la pub.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Partenariat",
        body: "Coopération universitaire et institutionnelle — pas d’affiliation ni de publicité cachée.",
        metaTitle: "Partenariats d’entreprises et d’institutions",
        metaDescription: "Partenariats universitaires et institutionnels sur MedScopeGlobal.",
        lead: "Les partenariats sont signalés. Pas de publicité cachée et pas d’accès à l’espace médecins.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Campagnes",
        body: "Segments lecteurs du magazine / grand public. Médecins et étudiants ont des espaces sans affiliation.",
        metaTitle: "Campagnes pour les entreprises",
        metaDescription: "Campagnes segmentées sur ViaLongeVita pour le public et le magazine.",
        lead: "Les campagnes ciblent le magazine et le public. Les espaces professionnels restent sans affiliation.",
      },
    },
  },
  it: {
    metaTitle: "Aziende — pubblicità su ViaLongeVita",
    metaDescription:
      "Banner, articoli partner e partnership per pharma, cliniche e università. Banner da 5 000 Kč/mese.",
    eyebrow: "Aziende e partner",
    title: "Pubblicità su ViaLongeVita",
    lead: "Le aziende sanitarie annunciano nel magazine, non nella zona medici. Prezzi orientativi, offerta in 2 giorni lavorativi.",
    roomsKicker: "Formati",
    roomsTitle: "Dove va ogni richiesta",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Listino",
        body: "Banner 5 000 Kč/mese, articolo partner 15 000 Kč, enterprise su richiesta.",
        metaTitle: "Listino B2B per le aziende",
        metaDescription: "Prezzi trasparenti per pharma, cliniche e università.",
        lead: "Prezzi orientativi IVA esclusa. Offerta vincolante entro 2 giorni lavorativi.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Pubblicità",
        body: "Banner e slot newsletter nel magazine. La zona medici resta senza pubblicità.",
        metaTitle: "Pubblicità per aziende sanitarie",
        metaDescription: "Banner e newsletter su ViaLongeVita — non nella zona medici.",
        lead: "I banner ruotano nel magazine e nel pubblico. OrdiZapis e /lekari non accettano pubblicità.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Partnership",
        body: "Cooperazione universitaria e istituzionale — niente affiliate né pubblicità occulta.",
        metaTitle: "Partnership di aziende e istituzioni",
        metaDescription: "Partnership universitarie e istituzionali su MedScopeGlobal.",
        lead: "Le partnership sono segnalate. Niente pubblicità occulta e niente accesso alla zona medici.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Campagne",
        body: "Segmenti lettori del magazine / pubblico. Medici e studenti hanno spazi senza affiliate.",
        metaTitle: "Campagne per le aziende",
        metaDescription: "Campagne segmentate su ViaLongeVita per il pubblico e il magazine.",
        lead: "Le campagne puntano al magazine e al pubblico. Gli spazi professionali restano senza affiliate.",
      },
    },
  },
  es: {
    metaTitle: "Empresas — publicidad en ViaLongeVita",
    metaDescription:
      "Banners, artículos de partner y alianzas para pharma, clínicas y universidades. Banner desde 5 000 Kč/mes.",
    eyebrow: "Empresas y partners",
    title: "Publicidad en ViaLongeVita",
    lead: "Las empresas de salud anuncian en la revista, no en la zona médica. Precios orientativos, oferta en 2 días laborables.",
    roomsKicker: "Formatos",
    roomsTitle: "Adónde va cada solicitud",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Tarifas",
        body: "Banner 5 000 Kč/mes, artículo de partner 15 000 Kč, enterprise a medida.",
        metaTitle: "Tarifas B2B para empresas",
        metaDescription: "Tarifas transparentes para pharma, clínicas y universidades.",
        lead: "Precios orientativos sin IVA. Oferta firme en 2 días laborables.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Publicidad",
        body: "Banners y espacios de newsletter en la revista. La zona médica sigue sin anuncios.",
        metaTitle: "Publicidad para empresas de salud",
        metaDescription: "Banners y newsletter en ViaLongeVita — no en la zona médica.",
        lead: "Los banners rotan en la revista y en el público. OrdiZapis y /lekari no aceptan anuncios.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Alianza",
        body: "Cooperación universitaria e institucional — sin afiliados ni publicidad encubierta.",
        metaTitle: "Alianzas de empresas e instituciones",
        metaDescription: "Alianzas universitarias e institucionales en MedScopeGlobal.",
        lead: "Las alianzas van señaladas. Sin publicidad encubierta y sin acceso a la zona médica.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Campañas",
        body: "Segmentos lectores de la revista / público. Médicos y estudiantes tienen espacios sin afiliados.",
        metaTitle: "Campañas para empresas",
        metaDescription: "Campañas segmentadas en ViaLongeVita para el público y la revista.",
        lead: "Las campañas apuntan a la revista y al público. Los espacios profesionales siguen sin afiliados.",
      },
    },
  },
  "pt-BR": {
    metaTitle: "Empresas — publicidade na ViaLongeVita",
    metaDescription:
      "Banners, artigos parceiros e parcerias para pharma, clínicas e universidades. Banner a partir de 5 000 Kč/mês.",
    eyebrow: "Empresas e parceiros",
    title: "Publicidade na ViaLongeVita",
    lead: "Empresas de saúde anunciam na revista, não na zona médica. Preços indicativos, proposta em 2 dias úteis.",
    roomsKicker: "Formatos",
    roomsTitle: "Para onde vai cada pedido",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Preços",
        body: "Banner 5 000 Kč/mês, artigo parceiro 15 000 Kč, enterprise sob consulta.",
        metaTitle: "Preços B2B para empresas",
        metaDescription: "Preços transparentes para pharma, clínicas e universidades.",
        lead: "Preços indicativos sem IVA. Proposta firme em 2 dias úteis.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Publicidade",
        body: "Banners e espaços de newsletter na revista. A zona médica continua sem anúncios.",
        metaTitle: "Publicidade para empresas de saúde",
        metaDescription: "Banners e newsletter na ViaLongeVita — não na zona médica.",
        lead: "Os banners rodiziam na revista e no público. OrdiZapis e /lekari não aceitam anúncios.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Parceria",
        body: "Cooperação universitária e institucional — sem afiliados nem publicidade oculta.",
        metaTitle: "Parcerias de empresas e instituições",
        metaDescription: "Parcerias universitárias e institucionais no MedScopeGlobal.",
        lead: "As parcerias são sinalizadas. Sem publicidade oculta e sem acesso à zona médica.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Campanhas",
        body: "Segmentos leitores da revista / público. Médicos e estudantes têm espaços sem afiliados.",
        metaTitle: "Campanhas para empresas",
        metaDescription: "Campanhas segmentadas na ViaLongeVita para o público e a revista.",
        lead: "As campanhas miram a revista e o público. Os espaços profissionais continuam sem afiliados.",
      },
    },
  },
  en: {
    metaTitle: "For companies — advertising on ViaLongeVita",
    metaDescription:
      "Banners, partner articles and partnerships for pharma, clinics and universities. Banner from 5 000 Kč/month.",
    eyebrow: "Companies and partners",
    title: "Advertising on ViaLongeVita",
    lead: "Health companies advertise in the magazine, not in the physician zone. List prices are indicative; a quote arrives within 2 working days.",
    roomsKicker: "Formats",
    roomsTitle: "Where each enquiry belongs",
    rooms: {
      cenik: {
        href: "/firmy/cenik",
        title: "Pricing",
        body: "Banner 5 000 Kč/month, partner article 15 000 Kč, enterprise on request.",
        metaTitle: "B2B pricing for companies",
        metaDescription: "Transparent pricing for pharma, clinics and universities.",
        lead: "Indicative prices excluding VAT. A firm quote arrives within 2 working days.",
      },
      reklama: {
        href: "/firmy/reklama",
        title: "Advertising",
        body: "Banners and newsletter slots in the magazine. The physician zone stays ad-free.",
        metaTitle: "Advertising for health companies",
        metaDescription: "Banners and newsletter slots on ViaLongeVita — not in the physician zone.",
        lead: "Banners rotate in the magazine and the public desk. OrdiZapis and /lekari do not take ads.",
      },
      partnerstvi: {
        href: "/firmy/partnerstvi",
        title: "Partnership",
        body: "University and institutional work — not affiliate and not hidden advertising.",
        metaTitle: "Company and institution partnerships",
        metaDescription: "University and institutional partnerships on MedScopeGlobal.",
        lead: "Partnerships are labelled. This is not hidden advertising and not a door into the physician zone.",
      },
      kampane: {
        href: "/firmy/kampane",
        title: "Campaigns",
        body: "Segments: magazine readers / the public. Physicians and students keep their own affiliate-free surfaces.",
        metaTitle: "Campaigns for companies",
        metaDescription: "Segmented campaigns on ViaLongeVita for the public and the magazine.",
        lead: "Campaigns target the magazine and the public. Professional surfaces stay affiliate-free.",
      },
    },
  },
};

export function getFirmyDeskCopy(locale?: string | null): FirmyDeskCopy {
  return localizeListedCzkIn(PACK[chromePack(locale)], locale);
}

export const FIRMY_ROOM_SLUGS: FirmyRoomId[] = ["reklama", "partnerstvi", "kampane"];

export function isFirmyRoomId(slug: string): slug is FirmyRoomId {
  return FIRMY_ROOM_SLUGS.includes(slug as FirmyRoomId);
}
