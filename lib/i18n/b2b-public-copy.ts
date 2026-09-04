/**
 * Public B2B chrome for /b2b and /firmy/cenik plus the shared pricing table.
 * List prices stay CZK internally; display goes through localizeListedCzkIn.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";

export type B2bPublicTier = {
  id: "banner" | "sponsored" | "enterprise";
  name: string;
  priceLabel: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
};

export type B2bPublicCopy = {
  metaTitleB2b: string;
  metaDescriptionB2b: string;
  metaTitleCenik: string;
  metaDescriptionCenik: string;
  home: string;
  contactSales: string;
  requestQuote: string;
  b2bEyebrow: string;
  b2bTitle: string;
  b2bLead: string;
  bannerMonth: string;
  bannerDesc: string;
  sponsoredLabel: string;
  sponsoredDesc: string;
  replyLabel: string;
  replyValue: string;
  replyDesc: string;
  fullPriceList: string;
  questions: string;
  contact: string;
  pricingTitle: string;
  pricingLead: string;
  pricingNote: string;
  cenikEyebrow: string;
  cenikTitle: string;
  cenikLead: string;
  whyTitle: string;
  whyItems: string[];
  tiers: B2bPublicTier[];
};

const PACK: Record<ChromePack, B2bPublicCopy> = {
  cs: {
    metaTitleB2b: "B2B a pharma partnerství",
    metaDescriptionB2b:
      "Měřitelné B2B kampaně, reklama a lead generation pro medicínské partnery — transparentní ceník od 5 000 Kč/měs.",
    metaTitleCenik: "B2B ceník pro firmy",
    metaDescriptionCenik:
      "Transparentní ceník pro pharma, kliniky a univerzity — banner od 5 000 Kč/měs., sponzorovaný článek 15 000 Kč, enterprise na míru.",
    home: "Domů",
    contactSales: "Kontaktovat obchod",
    requestQuote: "Poptat nabídku",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma a odborní partneři",
    b2bLead: "Bannery, sponzorované články a enterprise kampaně pro pharma, kliniky a univerzity.",
    bannerMonth: "Banner / měsíc",
    bannerDesc: "Cílená viditelnost u lékařů a studentů",
    sponsoredLabel: "Sponzorovaný článek",
    sponsoredDesc: "Editoriálně zpracovaný odborný obsah",
    replyLabel: "Odpověď na poptávku",
    replyValue: "2 dny",
    replyDesc: "Individuální nabídka pro enterprise",
    fullPriceList: "Kompletní ceník pro firmy →",
    questions: "Dotazy:",
    contact: "kontakt",
    pricingTitle: "Transparentní B2B ceník",
    pricingLead: "Orientační ceny pro pharma, kliniky, laboratoře a univerzity. Bez skrytých poplatků.",
    pricingNote: "Uvedené ceny jsou orientační bez DPH. Finální nabídku připravíme do 2 pracovních dnů.",
    cenikEyebrow: "B2B ceník",
    cenikTitle: "Ceník pro firmy a partnery",
    cenikLead:
      "Bez skrytých poplatků — orientační ceny pro bannery, sponzorované články a enterprise kampaně na MedScopeGlobal.",
    whyTitle: "Proč inzerovat u nás?",
    whyItems: [
      "Cílená audience: lékaři, studenti medicíny a informovaná veřejnost",
      "Editoriální standardy a etické označení sponzorovaného obsahu",
      "Měřitelné reporty zobrazení a kliknutí",
      "Odpověď na poptávku do 2 pracovních dnů",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "měsíčně",
        description: "Viditelnost u cílené lékařské a studentské audience.",
        features: [
          "Rotace banneru v magazínu a odborné sekci",
          "Segmentace: lékaři / studenti / veřejnost",
          "Měsíční report zobrazení a kliknutí",
        ],
        ctaLabel: "Objednat banner",
      },
      {
        id: "sponsored",
        name: "Sponzorovaný článek",
        priceLabel: "15 000 Kč",
        priceNote: "za publikaci",
        description: "Editoriálně zpracovaný odborný obsah s jasným označením partnera.",
        features: [
          "Redakční zpracování a fact-check",
          "Označení „Sponzorováno“ dle etických standardů",
          "Distribuce v newsletteru a sociálních kanálech",
          "DOI/PMID odkazy na primární zdroje",
        ],
        highlighted: true,
        ctaLabel: "Poptat článek",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "Individuálně",
        priceNote: "roční smlouva",
        description: "Pharma, nemocnice a univerzity — white-label, API a kampaně na míru.",
        features: [
          "Multi-kanálové kampaně (banner + články + newsletter)",
          "White-label Academy moduly",
          "Dedikovaný account manager",
          "SLA a compliance reporting (SÚKL, ČLK)",
        ],
        ctaLabel: "Kontaktovat obchod",
      },
    ],
  },
  de: {
    metaTitleB2b: "B2B- und Pharma-Partnerschaften",
    metaDescriptionB2b:
      "Messbare B2B-Kampagnen und Werbung für medizinische Partner — transparente Preise ab 5 000 Kč/Monat.",
    metaTitleCenik: "B2B-Preise für Unternehmen",
    metaDescriptionCenik:
      "Transparente Preise für Pharma, Kliniken und Universitäten — Banner ab 5 000 Kč/Monat, Partnerartikel 15 000 Kč, Enterprise auf Anfrage.",
    home: "Start",
    contactSales: "Vertrieb kontaktieren",
    requestQuote: "Angebot anfragen",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma und Fachpartner",
    b2bLead: "Banner, Partnerartikel und Enterprise-Kampagnen für Pharma, Kliniken und Universitäten.",
    bannerMonth: "Banner / Monat",
    bannerDesc: "Sichtbarkeit bei Ärztinnen, Ärzten und Studierenden",
    sponsoredLabel: "Partnerartikel",
    sponsoredDesc: "Redaktionell aufbereiteter Fachinhalt",
    replyLabel: "Antwort auf die Anfrage",
    replyValue: "2 Tage",
    replyDesc: "Individuelles Angebot für Enterprise",
    fullPriceList: "Vollständige Firmenpreise →",
    questions: "Fragen:",
    contact: "Kontakt",
    pricingTitle: "Transparente B2B-Preise",
    pricingLead: "Richtpreise für Pharma, Kliniken, Labore und Universitäten. Keine versteckten Gebühren.",
    pricingNote: "Die Preise sind Richtwerte ohne MwSt. Ein verbindliches Angebot kommt innerhalb von 2 Arbeitstagen.",
    cenikEyebrow: "B2B-Preise",
    cenikTitle: "Preise für Unternehmen und Partner",
    cenikLead:
      "Keine versteckten Gebühren — Richtpreise für Banner, Partnerartikel und Enterprise-Kampagnen auf MedScopeGlobal.",
    whyTitle: "Warum bei uns werben?",
    whyItems: [
      "Gezielte Leser: Ärztinnen und Ärzte, Medizinstudierende und informierte Öffentlichkeit",
      "Redaktionelle Standards und klare Kennzeichnung von Partnerinhalten",
      "Messbare Berichte zu Impressionen und Klicks",
      "Antwort auf die Anfrage innerhalb von 2 Arbeitstagen",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "monatlich",
        description: "Sichtbarkeit bei einer gezielten ärztlichen und studentischen Leserschaft.",
        features: [
          "Bannerrotation im Magazin und im Fachbereich",
          "Segmente: Ärzte / Studierende / Öffentlichkeit",
          "Monatlicher Bericht zu Impressionen und Klicks",
        ],
        ctaLabel: "Banner bestellen",
      },
      {
        id: "sponsored",
        name: "Partnerartikel",
        priceLabel: "15 000 Kč",
        priceNote: "pro Veröffentlichung",
        description: "Redaktionell aufbereiteter Fachinhalt mit klarer Partnerkennzeichnung.",
        features: [
          "Redaktionelle Bearbeitung und Fact-Check",
          "Kennzeichnung als Partnerinhalt nach ethischen Standards",
          "Verteilung im Newsletter und in sozialen Kanälen",
          "DOI/PMID-Links zu Primärquellen",
        ],
        highlighted: true,
        ctaLabel: "Artikel anfragen",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "Individuell",
        priceNote: "Jahresvertrag",
        description: "Pharma, Kliniken und Universitäten — White-Label, API und Kampagnen nach Maß.",
        features: [
          "Mehrkanal-Kampagnen (Banner + Artikel + Newsletter)",
          "White-Label-Academy-Module",
          "Dedizierter Account Manager",
          "SLA und Compliance-Reporting (lokale Aufsicht, Ärztekammer)",
        ],
        ctaLabel: "Vertrieb kontaktieren",
      },
    ],
  },
  fr: {
    metaTitleB2b: "Partenariats B2B et pharma",
    metaDescriptionB2b:
      "Campagnes B2B mesurables et publicité pour partenaires médicaux — tarifs transparents dès 5 000 Kč/mois.",
    metaTitleCenik: "Tarifs B2B pour les entreprises",
    metaDescriptionCenik:
      "Tarifs transparents pour la pharma, les cliniques et les universités — bannière dès 5 000 Kč/mois, article partenaire 15 000 Kč, entreprise sur devis.",
    home: "Accueil",
    contactSales: "Contacter le commercial",
    requestQuote: "Demander un devis",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma et partenaires professionnels",
    b2bLead: "Bannières, articles partenaires et campagnes entreprise pour la pharma, les cliniques et les universités.",
    bannerMonth: "Bannière / mois",
    bannerDesc: "Visibilité ciblée auprès des médecins et des étudiants",
    sponsoredLabel: "Article partenaire",
    sponsoredDesc: "Contenu professionnel préparé par la rédaction",
    replyLabel: "Réponse à la demande",
    replyValue: "2 jours",
    replyDesc: "Offre individuelle pour l’entreprise",
    fullPriceList: "Tarifs complets pour les entreprises →",
    questions: "Questions :",
    contact: "contact",
    pricingTitle: "Tarifs B2B transparents",
    pricingLead: "Prix indicatifs pour la pharma, les cliniques, les laboratoires et les universités. Sans frais cachés.",
    pricingNote: "Les prix sont indicatifs hors TVA. Une offre ferme arrive sous 2 jours ouvrés.",
    cenikEyebrow: "Tarifs B2B",
    cenikTitle: "Tarifs pour les entreprises et partenaires",
    cenikLead:
      "Sans frais cachés — prix indicatifs pour bannières, articles partenaires et campagnes entreprise sur MedScopeGlobal.",
    whyTitle: "Pourquoi annoncer chez nous ?",
    whyItems: [
      "Audience ciblée : médecins, étudiants en médecine et grand public informé",
      "Standards éditoriaux et marquage éthique des contenus partenaires",
      "Rapports mesurables d’impressions et de clics",
      "Réponse à la demande sous 2 jours ouvrés",
    ],
    tiers: [
      {
        id: "banner",
        name: "Bannière",
        priceLabel: "5 000 Kč",
        priceNote: "par mois",
        description: "Visibilité auprès d’une audience médicale et étudiante ciblée.",
        features: [
          "Rotation de bannière dans le magazine et l’espace pro",
          "Segments : médecins / étudiants / grand public",
          "Rapport mensuel d’impressions et de clics",
        ],
        ctaLabel: "Commander une bannière",
      },
      {
        id: "sponsored",
        name: "Article partenaire",
        priceLabel: "15 000 Kč",
        priceNote: "par publication",
        description: "Contenu professionnel préparé par la rédaction, clairement signalé.",
        features: [
          "Traitement éditorial et vérification des faits",
          "Marquage partenaire selon les standards éthiques",
          "Diffusion dans la newsletter et les canaux sociaux",
          "Liens DOI/PMID vers les sources primaires",
        ],
        highlighted: true,
        ctaLabel: "Demander un article",
      },
      {
        id: "enterprise",
        name: "Entreprise",
        priceLabel: "Sur devis",
        priceNote: "contrat annuel",
        description: "Pharma, hôpitaux et universités — marque blanche, API et campagnes sur mesure.",
        features: [
          "Campagnes multi-canaux (bannière + articles + newsletter)",
          "Modules Academy en marque blanche",
          "Account manager dédié",
          "SLA et reporting de conformité (autorité locale, ordre des médecins)",
        ],
        ctaLabel: "Contacter le commercial",
      },
    ],
  },
  it: {
    metaTitleB2b: "Partnership B2B e pharma",
    metaDescriptionB2b:
      "Campagne B2B misurabili e pubblicità per partner medici — listino trasparente da 5 000 Kč/mese.",
    metaTitleCenik: "Listino B2B per le aziende",
    metaDescriptionCenik:
      "Listino trasparente per pharma, cliniche e università — banner da 5 000 Kč/mese, articolo partner 15 000 Kč, enterprise su richiesta.",
    home: "Home",
    contactSales: "Contatta il commerciale",
    requestQuote: "Chiedi un preventivo",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma e partner professionali",
    b2bLead: "Banner, articoli partner e campagne enterprise per pharma, cliniche e università.",
    bannerMonth: "Banner / mese",
    bannerDesc: "Visibilità mirata presso medici e studenti",
    sponsoredLabel: "Articolo partner",
    sponsoredDesc: "Contenuto professionale curato dalla redazione",
    replyLabel: "Risposta alla richiesta",
    replyValue: "2 giorni",
    replyDesc: "Offerta individuale per l’enterprise",
    fullPriceList: "Listino completo per le aziende →",
    questions: "Domande:",
    contact: "contatto",
    pricingTitle: "Listino B2B trasparente",
    pricingLead: "Prezzi indicativi per pharma, cliniche, laboratori e università. Senza costi nascosti.",
    pricingNote: "I prezzi sono indicativi IVA esclusa. Un’offerta ferma arriva entro 2 giorni lavorativi.",
    cenikEyebrow: "Listino B2B",
    cenikTitle: "Listino per aziende e partner",
    cenikLead:
      "Senza costi nascosti — prezzi indicativi per banner, articoli partner e campagne enterprise su MedScopeGlobal.",
    whyTitle: "Perché pubblicare da noi?",
    whyItems: [
      "Pubblico mirato: medici, studenti di medicina e pubblico informato",
      "Standard editoriali e marcatura etica dei contenuti partner",
      "Report misurabili di impression e clic",
      "Risposta alla richiesta entro 2 giorni lavorativi",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "al mese",
        description: "Visibilità presso un pubblico medico e studentesco mirato.",
        features: [
          "Rotazione del banner in rivista e nell’area professionale",
          "Segmenti: medici / studenti / pubblico",
          "Report mensile di impression e clic",
        ],
        ctaLabel: "Ordina un banner",
      },
      {
        id: "sponsored",
        name: "Articolo partner",
        priceLabel: "15 000 Kč",
        priceNote: "per pubblicazione",
        description: "Contenuto professionale curato dalla redazione, chiaramente segnalato.",
        features: [
          "Lavorazione editoriale e fact-check",
          "Marcatura partner secondo gli standard etici",
          "Distribuzione in newsletter e canali social",
          "Link DOI/PMID alle fonti primarie",
        ],
        highlighted: true,
        ctaLabel: "Chiedi un articolo",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "Su richiesta",
        priceNote: "contratto annuale",
        description: "Pharma, ospedali e università — white-label, API e campagne su misura.",
        features: [
          "Campagne multi-canale (banner + articoli + newsletter)",
          "Moduli Academy in white-label",
          "Account manager dedicato",
          "SLA e reporting di conformità (autorità locale, ordine dei medici)",
        ],
        ctaLabel: "Contatta il commerciale",
      },
    ],
  },
  es: {
    metaTitleB2b: "Alianzas B2B y pharma",
    metaDescriptionB2b:
      "Campañas B2B medibles y publicidad para socios médicos — tarifas transparentes desde 5 000 Kč/mes.",
    metaTitleCenik: "Tarifas B2B para empresas",
    metaDescriptionCenik:
      "Tarifas transparentes para pharma, clínicas y universidades — banner desde 5 000 Kč/mes, artículo partner 15 000 Kč, enterprise a medida.",
    home: "Inicio",
    contactSales: "Contactar comercial",
    requestQuote: "Pedir presupuesto",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma y socios profesionales",
    b2bLead: "Banners, artículos partner y campañas enterprise para pharma, clínicas y universidades.",
    bannerMonth: "Banner / mes",
    bannerDesc: "Visibilidad dirigida a médicos y estudiantes",
    sponsoredLabel: "Artículo partner",
    sponsoredDesc: "Contenido profesional preparado por la redacción",
    replyLabel: "Respuesta a la solicitud",
    replyValue: "2 días",
    replyDesc: "Oferta individual para enterprise",
    fullPriceList: "Tarifas completas para empresas →",
    questions: "Consultas:",
    contact: "contacto",
    pricingTitle: "Tarifas B2B transparentes",
    pricingLead: "Precios orientativos para pharma, clínicas, laboratorios y universidades. Sin cargos ocultos.",
    pricingNote: "Los precios son orientativos sin IVA. Una oferta firme llega en 2 días laborables.",
    cenikEyebrow: "Tarifas B2B",
    cenikTitle: "Tarifas para empresas y socios",
    cenikLead:
      "Sin cargos ocultos — precios orientativos para banners, artículos partner y campañas enterprise en MedScopeGlobal.",
    whyTitle: "¿Por qué anunciarse con nosotros?",
    whyItems: [
      "Audiencia dirigida: médicos, estudiantes de medicina y público informado",
      "Estándares editoriales y marcado ético del contenido partner",
      "Informes medibles de impresiones y clics",
      "Respuesta a la solicitud en 2 días laborables",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "al mes",
        description: "Visibilidad ante una audiencia médica y estudiantil dirigida.",
        features: [
          "Rotación de banner en la revista y el área profesional",
          "Segmentos: médicos / estudiantes / público",
          "Informe mensual de impresiones y clics",
        ],
        ctaLabel: "Pedir un banner",
      },
      {
        id: "sponsored",
        name: "Artículo partner",
        priceLabel: "15 000 Kč",
        priceNote: "por publicación",
        description: "Contenido profesional preparado por la redacción, claramente marcado.",
        features: [
          "Tratamiento editorial y comprobación de hechos",
          "Marcado partner según estándares éticos",
          "Distribución en el boletín y canales sociales",
          "Enlaces DOI/PMID a fuentes primarias",
        ],
        highlighted: true,
        ctaLabel: "Pedir un artículo",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "A medida",
        priceNote: "contrato anual",
        description: "Pharma, hospitales y universidades — marca blanca, API y campañas a medida.",
        features: [
          "Campañas multicanal (banner + artículos + boletín)",
          "Módulos Academy en marca blanca",
          "Account manager dedicado",
          "SLA e informes de cumplimiento (autoridad local, colegio médico)",
        ],
        ctaLabel: "Contactar comercial",
      },
    ],
  },
  "pt-BR": {
    metaTitleB2b: "Parcerias B2B e pharma",
    metaDescriptionB2b:
      "Campanhas B2B mensuráveis e publicidade para parceiros médicos — preços transparentes a partir de 5 000 Kč/mês.",
    metaTitleCenik: "Preços B2B para empresas",
    metaDescriptionCenik:
      "Preços transparentes para pharma, clínicas e universidades — banner a partir de 5 000 Kč/mês, artigo parceiro 15 000 Kč, enterprise sob consulta.",
    home: "Início",
    contactSales: "Falar com o comercial",
    requestQuote: "Pedir uma proposta",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma e parceiros profissionais",
    b2bLead: "Banners, artigos parceiros e campanhas enterprise para pharma, clínicas e universidades.",
    bannerMonth: "Banner / mês",
    bannerDesc: "Visibilidade dirigida a médicos e estudantes",
    sponsoredLabel: "Artigo parceiro",
    sponsoredDesc: "Conteúdo profissional preparado pela redação",
    replyLabel: "Resposta ao pedido",
    replyValue: "2 dias",
    replyDesc: "Proposta individual para enterprise",
    fullPriceList: "Preços completos para empresas →",
    questions: "Dúvidas:",
    contact: "contato",
    pricingTitle: "Preços B2B transparentes",
    pricingLead: "Preços indicativos para pharma, clínicas, laboratórios e universidades. Sem taxas ocultas.",
    pricingNote: "Os preços são indicativos sem IVA. Uma proposta firme chega em 2 dias úteis.",
    cenikEyebrow: "Preços B2B",
    cenikTitle: "Preços para empresas e parceiros",
    cenikLead:
      "Sem taxas ocultas — preços indicativos para banners, artigos parceiros e campanhas enterprise no MedScopeGlobal.",
    whyTitle: "Por que anunciar conosco?",
    whyItems: [
      "Audiência dirigida: médicos, estudantes de medicina e público informado",
      "Padrões editoriais e marcação ética de conteúdo parceiro",
      "Relatórios mensuráveis de impressões e cliques",
      "Resposta ao pedido em 2 dias úteis",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "por mês",
        description: "Visibilidade junto de uma audiência médica e estudantil dirigida.",
        features: [
          "Rotação de banner na revista e na área profissional",
          "Segmentos: médicos / estudantes / público",
          "Relatório mensal de impressões e cliques",
        ],
        ctaLabel: "Encomendar um banner",
      },
      {
        id: "sponsored",
        name: "Artigo parceiro",
        priceLabel: "15 000 Kč",
        priceNote: "por publicação",
        description: "Conteúdo profissional preparado pela redação, claramente marcado.",
        features: [
          "Tratamento editorial e verificação de factos",
          "Marcação de parceiro segundo padrões éticos",
          "Distribuição na newsletter e canais sociais",
          "Ligações DOI/PMID às fontes primárias",
        ],
        highlighted: true,
        ctaLabel: "Pedir um artigo",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "Sob consulta",
        priceNote: "contrato anual",
        description: "Pharma, hospitais e universidades — white-label, API e campanhas sob medida.",
        features: [
          "Campanhas multi-canal (banner + artigos + newsletter)",
          "Módulos Academy em white-label",
          "Account manager dedicado",
          "SLA e relatórios de conformidade (autoridade local, ordem dos médicos)",
        ],
        ctaLabel: "Falar com o comercial",
      },
    ],
  },
  en: {
    metaTitleB2b: "B2B and pharma partnerships",
    metaDescriptionB2b:
      "Measurable B2B campaigns and advertising for medical partners — transparent rates from 5 000 Kč/month.",
    metaTitleCenik: "B2B pricing for companies",
    metaDescriptionCenik:
      "Transparent rates for pharma, clinics and universities — banner from 5 000 Kč/month, partner article 15 000 Kč, enterprise on request.",
    home: "Home",
    contactSales: "Contact sales",
    requestQuote: "Request a quote",
    b2bEyebrow: "B2B",
    b2bTitle: "Pharma and professional partners",
    b2bLead: "Banners, partner articles and enterprise campaigns for pharma, clinics and universities.",
    bannerMonth: "Banner / month",
    bannerDesc: "Targeted visibility with physicians and students",
    sponsoredLabel: "Partner article",
    sponsoredDesc: "Professionally edited specialist content",
    replyLabel: "Reply to an enquiry",
    replyValue: "2 days",
    replyDesc: "A tailored enterprise offer",
    fullPriceList: "Full company price list →",
    questions: "Questions:",
    contact: "contact",
    pricingTitle: "Transparent B2B pricing",
    pricingLead: "Guide prices for pharma, clinics, labs and universities. No hidden fees.",
    pricingNote: "Prices are indicative excluding VAT. A firm offer arrives within 2 working days.",
    cenikEyebrow: "B2B pricing",
    cenikTitle: "Pricing for companies and partners",
    cenikLead:
      "No hidden fees — guide prices for banners, partner articles and enterprise campaigns on MedScopeGlobal.",
    whyTitle: "Why advertise with us?",
    whyItems: [
      "A targeted audience: physicians, medical students and an informed public",
      "Editorial standards and ethical labelling of partner content",
      "Measurable impression and click reports",
      "A reply to the enquiry within 2 working days",
    ],
    tiers: [
      {
        id: "banner",
        name: "Banner",
        priceLabel: "5 000 Kč",
        priceNote: "per month",
        description: "Visibility with a targeted physician and student audience.",
        features: [
          "Banner rotation in the magazine and the professional desk",
          "Segments: physicians / students / public",
          "Monthly impression and click report",
        ],
        ctaLabel: "Order a banner",
      },
      {
        id: "sponsored",
        name: "Partner article",
        priceLabel: "15 000 Kč",
        priceNote: "per publication",
        description: "Professionally edited specialist content, clearly labelled.",
        features: [
          "Editorial handling and fact-check",
          "Partner labelling to ethical standards",
          "Distribution in the newsletter and social channels",
          "DOI/PMID links to primary sources",
        ],
        highlighted: true,
        ctaLabel: "Request an article",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceLabel: "On request",
        priceNote: "annual contract",
        description: "Pharma, hospitals and universities — white-label, API and campaigns to spec.",
        features: [
          "Multi-channel campaigns (banner + articles + newsletter)",
          "White-label Academy modules",
          "Dedicated account manager",
          "SLA and compliance reporting (local regulator, medical chamber)",
        ],
        ctaLabel: "Contact sales",
      },
    ],
  },
};

export function getB2bPublicCopy(locale?: string | null): B2bPublicCopy {
  return localizeListedCzkIn(PACK[chromePack(locale)], locale);
}
