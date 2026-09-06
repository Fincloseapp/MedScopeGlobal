import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type InzerceCenikCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  starterTitle: string;
  starterLead: string;
  native: string;
  sponsored: string;
  mention: string;
  perMonth: string;
  banners: string;
  newsletter: string;
  packages: string;
  from: string;
  form: string;
};

const PACK: Record<ChromePack, InzerceCenikCopy> = {
  cs: {
    metaTitle: "Ceník inzerce",
    metaDescription: "Ceny bannerů, newsletteru a kombinovaných balíčků.",
    eyebrow: "Ceník",
    title: "Ceník reklamy",
    lead: "Orientační ceny za 30 dní. Finální cena se potvrdí ve formuláři s automatickým naceněním.",
    cta: "Spočítat a odeslat",
    starterTitle: "ViaLongeVita — startovací sazby",
    starterLead: "Orientační sazby pro čtenáře dlouhověkosti. Níže je širší sazebník.",
    native: "Native banner",
    sponsored: "Sponzorovaný článek",
    mention: "Mention v newsletteru",
    perMonth: "/ měsíc",
    banners: "Bannery",
    newsletter: "Newsletter",
    packages: "Kombinované balíčky",
    from: "od",
    form: "Přejít na formulář →",
  },
  de: {
    metaTitle: "Anzeigenpreise",
    metaDescription: "Preise für Banner, Newsletter und Pakete.",
    eyebrow: "Preise",
    title: "Anzeigenpreisliste",
    lead: "Richtpreise für 30 Tage. Der Endpreis steht im Formular mit automatischer Kalkulation.",
    cta: "Berechnen und senden",
    starterTitle: "ViaLongeVita — Einstiegssätze",
    starterLead: "Richtsätze für Longevity-Leser. Darunter der breitere Tarif.",
    native: "Native Banner",
    sponsored: "Gesponserter Artikel",
    mention: "Erwähnung im Newsletter",
    perMonth: "/ Monat",
    banners: "Banner",
    newsletter: "Newsletter",
    packages: "Kombinationspakete",
    from: "ab",
    form: "Zum Formular →",
  },
  fr: {
    metaTitle: "Tarifs publicitaires",
    metaDescription: "Prix des bannières, de la newsletter et des packs.",
    eyebrow: "Tarifs",
    title: "Grille publicitaire",
    lead: "Prix indicatifs pour 30 jours. Le prix final se confirme dans le formulaire avec devis automatique.",
    cta: "Calculer et envoyer",
    starterTitle: "ViaLongeVita — tarifs de démarrage",
    starterLead: "Tarifs indicatifs pour les lecteurs longévité. Ci-dessous la grille élargie.",
    native: "Bannière native",
    sponsored: "Article sponsorisé",
    mention: "Mention dans la newsletter",
    perMonth: "/ mois",
    banners: "Bannières",
    newsletter: "Newsletter",
    packages: "Packs combinés",
    from: "à partir de",
    form: "Aller au formulaire →",
  },
  en: {
    metaTitle: "Ad pricing",
    metaDescription: "Prices for banners, newsletter and combined packs.",
    eyebrow: "Pricing",
    title: "Advertising rate card",
    lead: "Guide prices for 30 days. The final price is confirmed in the form with automatic quoting.",
    cta: "Calculate and send",
    starterTitle: "ViaLongeVita — starter rates",
    starterLead: "Guide rates for longevity readers. The wider card is below.",
    native: "Native banner",
    sponsored: "Sponsored article",
    mention: "Newsletter mention",
    perMonth: "/ month",
    banners: "Banners",
    newsletter: "Newsletter",
    packages: "Combined packs",
    from: "from",
    form: "Go to the form →",
  },
  it: {
    metaTitle: "Listino pubblicità",
    metaDescription: "Prezzi di banner, newsletter e pacchetti.",
    eyebrow: "Listino",
    title: "Listino pubblicitario",
    lead: "Prezzi orientativi per 30 giorni. Il prezzo finale si conferma nel modulo con preventivo automatico.",
    cta: "Calcola e invia",
    starterTitle: "ViaLongeVita — tariffe di partenza",
    starterLead: "Tariffe orientative per i lettori di longevità. Sotto il listino più ampio.",
    native: "Banner nativo",
    sponsored: "Articolo sponsorizzato",
    mention: "Menzione in newsletter",
    perMonth: "/ mese",
    banners: "Banner",
    newsletter: "Newsletter",
    packages: "Pacchetti combinati",
    from: "da",
    form: "Vai al modulo →",
  },
  es: {
    metaTitle: "Tarifas publicitarias",
    metaDescription: "Precios de banners, boletín y packs.",
    eyebrow: "Tarifas",
    title: "Tarifa publicitaria",
    lead: "Precios orientativos a 30 días. El precio final se confirma en el formulario con presupuesto automático.",
    cta: "Calcular y enviar",
    starterTitle: "ViaLongeVita — tarifas de arranque",
    starterLead: "Tarifas orientativas para lectores de longevidad. Abajo la tarifa amplia.",
    native: "Banner nativo",
    sponsored: "Artículo patrocinado",
    mention: "Mención en el boletín",
    perMonth: "/ mes",
    banners: "Banners",
    newsletter: "Boletín",
    packages: "Packs combinados",
    from: "desde",
    form: "Ir al formulario →",
  },
  "pt-BR": {
    metaTitle: "Preçário de publicidade",
    metaDescription: "Preços de banners, newsletter e packs.",
    eyebrow: "Preçário",
    title: "Tabela de publicidade",
    lead: "Preços indicativos a 30 dias. O preço final confirma-se no formulário com orçamento automático.",
    cta: "Calcular e enviar",
    starterTitle: "ViaLongeVita — tarifas iniciais",
    starterLead: "Tarifas indicativas para leitores de longevidade. Abaixo a tabela alargada.",
    native: "Banner nativo",
    sponsored: "Artigo patrocinado",
    mention: "Menção na newsletter",
    perMonth: "/ mês",
    banners: "Banners",
    newsletter: "Newsletter",
    packages: "Packs combinados",
    from: "desde",
    form: "Ir ao formulário →",
  },
};

export function getInzerceCenikCopy(locale?: string | null): InzerceCenikCopy {
  return PACK[chromePack(locale)];
}
