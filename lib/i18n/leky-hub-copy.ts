import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type LekyHubCopy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  lastSync: string;
  allNews: string;
  approved: string;
  latestTitle: string;
  seeAll: string;
  empty: string;
  emptyHint: string;
  links: { href: string; label: string; desc: string }[];
};

const PACK: Record<ChromePack, LekyHubCopy> = {
  cs: {
    metaTitle: "Léky a farmakoterapie | MedScopeGlobal",
    metaDescription: "Lékové novinky z SÚKL, EMA a FDA — schválení, bezpečnostní upozornění a pipeline.",
    kicker: "medscopeglobal.com · Léky",
    title: "Léky a farmakoterapie",
    lead: "Schválení, bezpečnostní upozornění a pipeline z oficiálních registrů SÚKL, EMA a FDA.",
    lastSync: "Poslední synchronizace:",
    allNews: "Všechny novinky",
    approved: "Schválené přípravky",
    latestTitle: "Nejnovější lékové novinky",
    seeAll: "Zobrazit vše →",
    empty: "První synchronizace z oficiálních zdrojů proběhne automaticky během dne.",
    emptyHint: "SÚKL, EMA a FDA — monitoring přes denní CRON medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Novinky o lécích", desc: "Registrace, SPC, bezpečnost, úhrady" },
      { href: "/leky/schvalene", label: "Schválené léky", desc: "Nová registrace a indikace" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Připravované přípravky ve vývoji" },
      { href: "/ai/leky", label: "AI léky", desc: "Odborný AI přehled" },
    ],
  },
  de: {
    metaTitle: "Arzneimittel | MedScopeGlobal",
    metaDescription: "Arzneimittelmeldungen von EMA, FDA und SÚKL — Zulassung, Sicherheit, Pipeline.",
    kicker: "medscopeglobal.com · Arzneimittel",
    title: "Arzneimittel und Pharmakotherapie",
    lead: "Zulassungen, Sicherheitshinweise und Pipeline aus den amtlichen Registern von EMA, FDA und SÚKL.",
    lastSync: "Letzte Synchronisierung:",
    allNews: "Alle Meldungen",
    approved: "Zugelassene Präparate",
    latestTitle: "Neueste Arzneimittelmeldungen",
    seeAll: "Alle anzeigen →",
    empty: "Die erste Synchronisierung aus den amtlichen Quellen läuft automatisch im Tageslauf.",
    emptyHint: "EMA, FDA und SÚKL — täglicher CRON auf medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Arzneimittelmeldungen", desc: "Zulassung, Fachinformation, Sicherheit" },
      { href: "/leky/schvalene", label: "Zugelassene Präparate", desc: "Neue Zulassung und Indikationen" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Präparate in der Entwicklung" },
      { href: "/ai/leky", label: "KI Arzneimittel", desc: "Fachlicher KI-Überblick" },
    ],
  },
  fr: {
    metaTitle: "Médicaments | MedScopeGlobal",
    metaDescription: "Actualités médicaments EMA, FDA et SÚKL — autorisation, sécurité, pipeline.",
    kicker: "medscopeglobal.com · Médicaments",
    title: "Médicaments et pharmacothérapie",
    lead: "Autorisations, alertes de sécurité et pipeline issus des registres officiels EMA, FDA et SÚKL.",
    lastSync: "Dernière synchronisation :",
    allNews: "Toutes les actualités",
    approved: "Produits autorisés",
    latestTitle: "Dernières actualités médicaments",
    seeAll: "Tout voir →",
    empty: "La première synchronisation des sources officielles tourne automatiquement dans la journée.",
    emptyHint: "EMA, FDA et SÚKL — CRON quotidien sur medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Actualités médicaments", desc: "Autorisation, RCP, sécurité" },
      { href: "/leky/schvalene", label: "Produits autorisés", desc: "Nouvelles autorisations et indications" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Produits en développement" },
      { href: "/ai/leky", label: "IA médicaments", desc: "Aperçu IA professionnel" },
    ],
  },
  en: {
    metaTitle: "Medicines | MedScopeGlobal",
    metaDescription: "Medicine news from EMA, FDA and SÚKL — authorisation, safety alerts and pipeline.",
    kicker: "medscopeglobal.com · Medicines",
    title: "Medicines and pharmacotherapy",
    lead: "Authorisations, safety alerts and pipeline from the official EMA, FDA and SÚKL registers.",
    lastSync: "Last sync:",
    allNews: "All news",
    approved: "Approved products",
    latestTitle: "Latest medicine news",
    seeAll: "See all →",
    empty: "The first official-source sync will run automatically during the day.",
    emptyHint: "EMA, FDA and SÚKL — daily CRON on medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Medicine news", desc: "Authorisation, SmPC, safety" },
      { href: "/leky/schvalene", label: "Approved medicines", desc: "New authorisation and indications" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Products in development" },
      { href: "/ai/leky", label: "AI medicines", desc: "Professional AI overview" },
    ],
  },
  it: {
    metaTitle: "Farmaci | MedScopeGlobal",
    metaDescription: "Novità sui farmaci da EMA, FDA e SÚKL — autorizzazione, sicurezza, pipeline.",
    kicker: "medscopeglobal.com · Farmaci",
    title: "Farmaci e farmacoterapia",
    lead: "Autorizzazioni, avvisi di sicurezza e pipeline dai registri ufficiali EMA, FDA e SÚKL.",
    lastSync: "Ultima sincronizzazione:",
    allNews: "Tutte le novità",
    approved: "Prodotti autorizzati",
    latestTitle: "Ultime novità sui farmaci",
    seeAll: "Vedi tutto →",
    empty: "La prima sincronizzazione dalle fonti ufficiali parte automaticamente nella giornata.",
    emptyHint: "EMA, FDA e SÚKL — CRON quotidiano su medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Novità sui farmaci", desc: "Autorizzazione, RCP, sicurezza" },
      { href: "/leky/schvalene", label: "Farmaci autorizzati", desc: "Nuove autorizzazioni e indicazioni" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Prodotti in sviluppo" },
      { href: "/ai/leky", label: "IA farmaci", desc: "Panoramica IA professionale" },
    ],
  },
  es: {
    metaTitle: "Medicamentos | MedScopeGlobal",
    metaDescription: "Novedades de medicamentos de EMA, FDA y SÚKL — autorización, seguridad, pipeline.",
    kicker: "medscopeglobal.com · Medicamentos",
    title: "Medicamentos y farmacoterapia",
    lead: "Autorizaciones, alertas de seguridad y pipeline de los registros oficiales EMA, FDA y SÚKL.",
    lastSync: "Última sincronización:",
    allNews: "Todas las novedades",
    approved: "Productos autorizados",
    latestTitle: "Últimas novedades de medicamentos",
    seeAll: "Ver todo →",
    empty: "La primera sincronización de fuentes oficiales se ejecuta automáticamente durante el día.",
    emptyHint: "EMA, FDA y SÚKL — CRON diario en medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Novedades de medicamentos", desc: "Autorización, ficha técnica, seguridad" },
      { href: "/leky/schvalene", label: "Medicamentos autorizados", desc: "Nuevas autorizaciones e indicaciones" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Productos en desarrollo" },
      { href: "/ai/leky", label: "IA medicamentos", desc: "Resumen profesional de IA" },
    ],
  },
  "pt-BR": {
    metaTitle: "Medicamentos | MedScopeGlobal",
    metaDescription: "Novidades de medicamentos da EMA, FDA e SÚKL — autorização, segurança, pipeline.",
    kicker: "medscopeglobal.com · Medicamentos",
    title: "Medicamentos e farmacoterapia",
    lead: "Autorizações, alertas de segurança e pipeline dos registos oficiais EMA, FDA e SÚKL.",
    lastSync: "Última sincronização:",
    allNews: "Todas as novidades",
    approved: "Produtos autorizados",
    latestTitle: "Últimas novidades de medicamentos",
    seeAll: "Ver tudo →",
    empty: "A primeira sincronização das fontes oficiais corre automaticamente durante o dia.",
    emptyHint: "EMA, FDA e SÚKL — CRON diário em medscopeglobal.com.",
    links: [
      { href: "/leky/novinky", label: "Novidades de medicamentos", desc: "Autorização, RCM, segurança" },
      { href: "/leky/schvalene", label: "Medicamentos autorizados", desc: "Novas autorizações e indicações" },
      { href: "/leky/pipeline", label: "Pipeline", desc: "Produtos em desenvolvimento" },
      { href: "/ai/leky", label: "IA medicamentos", desc: "Visão profissional de IA" },
    ],
  },
};

export function getLekyHubCopy(locale?: string | null): LekyHubCopy {
  return PACK[chromePack(locale)];
}
