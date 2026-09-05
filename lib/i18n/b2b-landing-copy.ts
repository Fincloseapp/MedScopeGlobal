import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";

type Pack = ChromePack;

export function b2bLandingLocale(locale?: string | null): Pack {
  return chromePack(locale);
}

export type B2BLandingCopy = {
  audienceTitle: string;
  formatsTitle: string;
  packagesTitle: string;
  individualPrice: string;
  customCampaign: string;
  formCta: string;
  partnershipCta: string;
  orderCta: string;
  orWord: string;
  packageCopy: Record<string, { name: string; desc: string }>;
  audience: { title: string; body: string }[];
  formats: { name: string; reach: string; price: string }[];
};

const COPY: Record<Pack, B2BLandingCopy> = {
  cs: {
    audienceTitle: "Publikum",
    formatsTitle: "Reklamní formáty",
    packagesTitle: "Balíčky",
    individualPrice: "Individuálně",
    customCampaign: "Vlastní kampaň?",
    formCta: "Vyplňte formulář inzerce",
    partnershipCta: "univerzitní partnerství",
    orderCta: "Objednat balíček",
    orWord: "nebo",
    packageCopy: {
      banner: { name: "Banner", desc: "Měsíční rotace banneru — segmentace lékaři / studenti" },
      "sponsored-article": { name: "Sponzorovaný článek", desc: "Editoriální článek s označením partnera" },
      enterprise: { name: "Enterprise", desc: "White-label, API a kampaně na míru — individuální cena" },
    },
    audience: [
      { title: "Čtenáři dlouhověkosti", body: "Prevence, spánek, pohyb a výživa." },
      { title: "Lékaři a studenti", body: "Samostatné odborné plochy, bez affiliate." },
      { title: "Týdenní brief", body: "Stejná redakce ViaLongeVita ve schránce." },
      { title: "Označený obsah", body: "Sponzorované texty mají vždy jasné označení." },
    ],
    formats: [
      { name: "Banner homepage", reach: "Homepage a články", price: "od 8 000 Kč" },
      { name: "Sponzorovaný článek", reach: "Newsletter + SEO", price: "od 15 000 Kč" },
      { name: "Newsletter slot", reach: "Týdenní brief", price: "od 5 000 Kč" },
      { name: "Segmentace publika", reach: "Lékaři / studenti / veřejnost", price: "v balíčku" },
    ],
  },
  de: {
    audienceTitle: "Publikum",
    formatsTitle: "Werbeformate",
    packagesTitle: "Pakete",
    individualPrice: "Individuell",
    customCampaign: "Eigene Kampagne?",
    formCta: "Werbeformular ausfüllen",
    partnershipCta: "Universitätspartnerschaft",
    orderCta: "Paket bestellen",
    orWord: "oder",
    packageCopy: {
      banner: { name: "Banner", desc: "Monatliche Bannerrotation — Segmente Ärzte / Studierende" },
      "sponsored-article": { name: "Gesponserter Artikel", desc: "Redaktioneller Artikel mit Partnerkennzeichnung" },
      enterprise: { name: "Enterprise", desc: "White-label, API und Kampagnen nach Maß — individueller Preis" },
    },
    audience: [
      { title: "Longevity-Leser", body: "Prävention, Schlaf, Bewegung und Ernährung." },
      { title: "Ärztinnen und Studierende", body: "Eigene Fachflächen, ohne Affiliate." },
      { title: "Wochenbrief", body: "Dieselbe ViaLongeVita-Redaktion im Postfach." },
      { title: "Gekennzeichneter Inhalt", body: "Partnertexte sind immer klar markiert." },
    ],
    formats: [
      { name: "Homepage-Banner", reach: "Startseite und Artikel", price: "ab 8 000 Kč" },
      { name: "Gesponserter Artikel", reach: "Newsletter + SEO", price: "ab 15 000 Kč" },
      { name: "Newsletter-Slot", reach: "Wochenbrief", price: "ab 5 000 Kč" },
      { name: "Publikumssegmente", reach: "Ärzte / Studierende / Öffentlichkeit", price: "im Paket" },
    ],
  },
  fr: {
    audienceTitle: "Audience",
    formatsTitle: "Formats publicitaires",
    packagesTitle: "Offres",
    individualPrice: "Sur devis",
    customCampaign: "Campagne sur mesure ?",
    formCta: "Remplir le formulaire",
    partnershipCta: "partenariat universitaire",
    orderCta: "Commander l’offre",
    orWord: "ou",
    packageCopy: {
      banner: { name: "Bannière", desc: "Rotation mensuelle — segments médecins / étudiants" },
      "sponsored-article": { name: "Article sponsorisé", desc: "Article éditorial clairement marqué partenaire" },
      enterprise: { name: "Enterprise", desc: "White-label, API et campagnes sur mesure — tarif sur devis" },
    },
    audience: [
      { title: "Lecteurs longévité", body: "Prévention, sommeil, mouvement et alimentation." },
      { title: "Médecins et étudiants", body: "Espaces professionnels séparés, sans affiliation." },
      { title: "Brief hebdomadaire", body: "La même rédaction ViaLongeVita dans la boîte mail." },
      { title: "Contenu signalé", body: "Les textes partenaires sont toujours clairement marqués." },
    ],
    formats: [
      { name: "Bannière accueil", reach: "Accueil et articles", price: "dès 8 000 Kč" },
      { name: "Article sponsorisé", reach: "Newsletter + SEO", price: "dès 15 000 Kč" },
      { name: "Emplacement newsletter", reach: "Brief hebdomadaire", price: "dès 5 000 Kč" },
      { name: "Segmentation", reach: "Médecins / étudiants / public", price: "dans l’offre" },
    ],
  },
  en: {
    audienceTitle: "Audience",
    formatsTitle: "Ad formats",
    packagesTitle: "Packages",
    individualPrice: "On request",
    customCampaign: "A custom campaign?",
    formCta: "Fill in the advertising form",
    partnershipCta: "university partnership",
    orderCta: "Order package",
    orWord: "or",
    packageCopy: {
      banner: { name: "Banner", desc: "Monthly banner rotation — physician / student segments" },
      "sponsored-article": { name: "Sponsored article", desc: "Editorial article with a partner label" },
      enterprise: { name: "Enterprise", desc: "White-label, API and custom campaigns — priced on request" },
    },
    audience: [
      { title: "Longevity readers", body: "Prevention, sleep, movement and nutrition." },
      { title: "Physicians and students", body: "Separate professional surfaces, no affiliates." },
      { title: "Weekly brief", body: "The same ViaLongeVita newsroom in the inbox." },
      { title: "Labelled content", body: "Partner pieces are always clearly marked." },
    ],
    formats: [
      { name: "Homepage banner", reach: "Homepage and articles", price: "from 8 000 Kč" },
      { name: "Sponsored article", reach: "Newsletter + SEO", price: "from 15 000 Kč" },
      { name: "Newsletter slot", reach: "Weekly brief", price: "from 5 000 Kč" },
      { name: "Audience segments", reach: "Physicians / students / public", price: "in the package" },
    ],
  },
  it: {
    audienceTitle: "Pubblico",
    formatsTitle: "Formati pubblicitari",
    packagesTitle: "Pacchetti",
    individualPrice: "Su richiesta",
    customCampaign: "Una campagna su misura?",
    formCta: "Compila il modulo pubblicitario",
    partnershipCta: "partnership universitaria",
    orderCta: "Ordina il pacchetto",
    orWord: "oppure",
    packageCopy: {
      banner: { name: "Banner", desc: "Rotazione mensile — segmenti medici / studenti" },
      "sponsored-article": { name: "Articolo sponsorizzato", desc: "Articolo editoriale con etichetta partner" },
      enterprise: { name: "Enterprise", desc: "White-label, API e campagne su misura — prezzo su richiesta" },
    },
    audience: [
      { title: "Lettori di longevità", body: "Prevenzione, sonno, movimento e alimentazione." },
      { title: "Medici e studenti", body: "Spazi professionali separati, senza affiliate." },
      { title: "Brief settimanale", body: "La stessa redazione ViaLongeVita in casella." },
      { title: "Contenuto segnalato", body: "I testi partner sono sempre chiaramente marcati." },
    ],
    formats: [
      { name: "Banner homepage", reach: "Home e articoli", price: "da 8 000 Kč" },
      { name: "Articolo sponsorizzato", reach: "Newsletter + SEO", price: "da 15 000 Kč" },
      { name: "Slot newsletter", reach: "Brief settimanale", price: "da 5 000 Kč" },
      { name: "Segmenti di pubblico", reach: "Medici / studenti / pubblico", price: "nel pacchetto" },
    ],
  },
  es: {
    audienceTitle: "Audiencia",
    formatsTitle: "Formatos publicitarios",
    packagesTitle: "Paquetes",
    individualPrice: "Bajo petición",
    customCampaign: "¿Una campaña a medida?",
    formCta: "Rellenar el formulario",
    partnershipCta: "alianza universitaria",
    orderCta: "Pedir el paquete",
    orWord: "o",
    packageCopy: {
      banner: { name: "Banner", desc: "Rotación mensual — segmentos médicos / estudiantes" },
      "sponsored-article": { name: "Artículo patrocinado", desc: "Artículo editorial con marca de partner" },
      enterprise: { name: "Enterprise", desc: "White-label, API y campañas a medida — precio bajo petición" },
    },
    audience: [
      { title: "Lectores de longevidad", body: "Prevención, sueño, movimiento y alimentación." },
      { title: "Médicos y estudiantes", body: "Espacios profesionales separados, sin afiliados." },
      { title: "Brief semanal", body: "La misma redacción ViaLongeVita en la bandeja." },
      { title: "Contenido señalado", body: "Los textos de partner van siempre marcados." },
    ],
    formats: [
      { name: "Banner de portada", reach: "Portada y artículos", price: "desde 8 000 Kč" },
      { name: "Artículo patrocinado", reach: "Newsletter + SEO", price: "desde 15 000 Kč" },
      { name: "Espacio newsletter", reach: "Brief semanal", price: "desde 5 000 Kč" },
      { name: "Segmentos de audiencia", reach: "Médicos / estudiantes / público", price: "en el paquete" },
    ],
  },
  "pt-BR": {
    audienceTitle: "Público",
    formatsTitle: "Formatos publicitários",
    packagesTitle: "Pacotes",
    individualPrice: "Sob consulta",
    customCampaign: "Uma campanha sob medida?",
    formCta: "Preencher o formulário",
    partnershipCta: "parceria universitária",
    orderCta: "Encomendar o pacote",
    orWord: "ou",
    packageCopy: {
      banner: { name: "Banner", desc: "Rotação mensal — segmentos médicos / estudantes" },
      "sponsored-article": { name: "Artigo patrocinado", desc: "Artigo editorial com marca de parceiro" },
      enterprise: { name: "Enterprise", desc: "White-label, API e campanhas à medida — preço sob consulta" },
    },
    audience: [
      { title: "Leitores de longevidade", body: "Prevenção, sono, movimento e alimentação." },
      { title: "Médicos e estudantes", body: "Espaços profissionais separados, sem afiliados." },
      { title: "Brief semanal", body: "A mesma redação ViaLongeVita na caixa de entrada." },
      { title: "Conteúdo sinalizado", body: "Textos de parceiro vêm sempre marcados." },
    ],
    formats: [
      { name: "Banner da home", reach: "Home e artigos", price: "a partir de 8 000 Kč" },
      { name: "Artigo patrocinado", reach: "Newsletter + SEO", price: "a partir de 15 000 Kč" },
      { name: "Espaço na newsletter", reach: "Brief semanal", price: "a partir de 5 000 Kč" },
      { name: "Segmentos de público", reach: "Médicos / estudantes / público", price: "no pacote" },
    ],
  },
};

export function getB2BLandingCopy(locale?: string | null): B2BLandingCopy {
  return localizeListedCzkIn(COPY[b2bLandingLocale(locale)], locale);
}
