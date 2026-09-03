import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref, translateNavHref } from "@/lib/i18n/nav-copy";
import { localizeListedCzk, localizeListedCzkIn } from "@/lib/i18n/payment-currency";
import type { V271HubPage } from "@/lib/v271/routes";

export type HubSection = "studenti" | "lekari" | "firmy";

type PageStr = { title: string; description: string; ctaLabel?: string };

type HubPack = {
  home: string;
  section: Record<HubSection, string>;
  pages: Record<string, PageStr>;
};

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

function pageKey(section: HubSection, slug: string): string {
  return slug ? `/${section}/${slug}` : `/${section}`;
}

const EN: HubPack = {
  home: "Home",
  section: { studenti: "Students", lekari: "Physicians", firmy: "Companies" },
  pages: {
    "/studenti": {
      title: "For students and medicine applicants",
      description:
        "Two paths: medical-school admissions prep, or materials and tests for faculty students. Start free.",
      ctaLabel: "Student plan 149 CZK",
    },
    "/studenti/testy": {
      title: "Tests and practice",
      description:
        "Admissions self-test, Academy quizzes and study games — with instant feedback. Not an official faculty exam.",
      ctaLabel: "Start the self-test",
    },
    "/studenti/chci-studovat": {
      title: "I want to study medicine",
      description: "Admissions, dates, requirements and prep tips — MeDiprep and the MedScope desk.",
    },
    "/studenti/zkousky": {
      title: "Exams and the semester",
      description: "Orientation for faculty exam periods and revision — not a substitute for official syllabi.",
    },
    "/studenti/ai-tutor": {
      title: "AI tutor",
      description: "A student AI assistant for explaining course material — a complement, not a lecture replacement.",
      ctaLabel: "Ask AI",
    },
    "/lekari": {
      title: "For physicians and researchers",
      description:
        "Evidence-based guidelines, curated studies with DOI/PMID, CME briefs, Research Hub and clinical AI — verified via ČLK.",
      ctaLabel: "Rheumatology CME",
    },
    "/lekari/guidelines": {
      title: "Guidelines",
      description: "Summaries of clinical recommendations and practice pathways.",
    },
    "/lekari/prehledy": {
      title: "Briefs",
      description: "Structured medical briefs and clinical overviews.",
    },
    "/lekari/studie": {
      title: "Studies",
      description: "RCTs, meta-analyses and Czech summaries with clinical impact.",
    },
    "/lekari/research-hub": {
      title: "Research Hub",
      description: "AI study analysis, PubMed and research briefs.",
    },
    "/lekari/ai-asistent": {
      title: "AI assistant for physicians",
      description: "Clinical AI — guidelines, differential diagnosis and studies.",
      ctaLabel: "Launch the assistant",
    },
    "/firmy": {
      title: "For companies",
      description:
        "Pharma, clinics, labs and universities — banners from CZK 5,000/month, sponsored article CZK 15,000, enterprise on request.",
      ctaLabel: "Contact sales",
    },
    "/firmy/cenik": {
      title: "B2B pricing",
      description:
        "Transparent guide prices: banner CZK 5,000/month, sponsored article CZK 15,000, enterprise individually.",
      ctaLabel: "Request a quote",
    },
    "/firmy/reklama": {
      title: "Advertising",
      description: "Banners, sponsored articles and newsletter slots.",
    },
    "/firmy/partnerstvi": {
      title: "Partnership",
      description: "University collaboration and institutional partnerships.",
    },
    "/firmy/kampane": {
      title: "Campaigns",
      description: "Segmented campaigns for physicians, students and the public.",
    },
  },
};

const DE: HubPack = {
  home: "Start",
  section: { studenti: "Studierende", lekari: "Ärzte", firmy: "Unternehmen" },
  pages: {
    "/studenti": {
      title: "Für Studierende und Medizinbewerber",
      description:
        "Zwei Wege: Vorbereitung auf die Aufnahmeprüfung oder Materialien und Tests für Fakultätsstudierende. Kostenlos starten.",
      ctaLabel: "Studententarif 149 CZK",
    },
    "/studenti/testy": {
      title: "Tests und Übung",
      description:
        "Selbsttest zur Aufnahme, Academy-Quiz und Lernspiele — mit sofortigem Feedback. Keine offizielle Fakultätsprüfung.",
      ctaLabel: "Selbsttest starten",
    },
    "/studenti/chci-studovat": {
      title: "Ich will Medizin studieren",
      description: "Aufnahme, Termine, Anforderungen und Tipps — MeDiprep und die MedScope-Redaktion.",
    },
    "/studenti/zkousky": {
      title: "Prüfungen und Semester",
      description: "Orientierung für Prüfungszeiten — kein Ersatz für offizielle Syllabi.",
    },
    "/studenti/ai-tutor": {
      title: "KI-Tutor",
      description: "Studenten-KI zur Erklärung des Stoffs — Ergänzung, kein Vorlesungsersatz.",
      ctaLabel: "KI fragen",
    },
    "/lekari": {
      title: "Für Ärztinnen, Ärzte und Forschung",
      description:
        "Evidenzbasierte Leitlinien, kuratierte Studien mit DOI/PMID, CME-Überblicke, Research Hub und klinische KI — geprüft über ČLK.",
      ctaLabel: "CME Rheumatologie",
    },
    "/lekari/guidelines": {
      title: "Leitlinien",
      description: "Zusammenfassungen klinischer Empfehlungen für die Praxis.",
    },
    "/lekari/prehledy": {
      title: "Überblicke",
      description: "Strukturierte medizinische Briefs und klinische Übersichten.",
    },
    "/lekari/studie": {
      title: "Studien",
      description: "RCTs, Metaanalysen und tschechische Kurzfassungen mit klinischem Nutzen.",
    },
    "/lekari/research-hub": {
      title: "Research Hub",
      description: "KI-Studienanalyse, PubMed und Forschungsüberblicke.",
    },
    "/lekari/ai-asistent": {
      title: "KI-Assistent für Ärztinnen und Ärzte",
      description: "Klinische KI — Leitlinien, Differenzialdiagnose und Studien.",
      ctaLabel: "Assistent starten",
    },
    "/firmy": {
      title: "Für Unternehmen",
      description:
        "Pharma, Kliniken, Labore und Universitäten — Banner ab 5 000 CZK/Monat, gesponserter Artikel 15 000 CZK, Enterprise auf Anfrage.",
      ctaLabel: "Vertrieb kontaktieren",
    },
    "/firmy/cenik": {
      title: "B2B-Preise",
      description:
        "Transparente Orientierungspreise: Banner 5 000 CZK/Monat, gesponserter Artikel 15 000 CZK, Enterprise individuell.",
      ctaLabel: "Angebot anfragen",
    },
    "/firmy/reklama": {
      title: "Werbung",
      description: "Banner, gesponserte Artikel und Newsletter-Slots.",
    },
    "/firmy/partnerstvi": {
      title: "Partnerschaft",
      description: "Universitäre Zusammenarbeit und institutionelle Partnerschaften.",
    },
    "/firmy/kampane": {
      title: "Kampagnen",
      description: "Segmentierte Kampagnen für Ärzte, Studierende und die Öffentlichkeit.",
    },
  },
};

const FR: HubPack = {
  home: "Accueil",
  section: { studenti: "Étudiants", lekari: "Médecins", firmy: "Entreprises" },
  pages: {
    "/studenti": {
      title: "Pour les étudiants et candidats en médecine",
      description:
        "Deux parcours : prépa concours des facultés, ou supports et tests pour les étudiants en faculté. Commencez gratuitement.",
      ctaLabel: "Formule étudiant 149 CZK",
    },
    "/studenti/testy": {
      title: "Tests et entraînement",
      description:
        "Auto-test d’admission, quiz Academy et jeux d’étude — avec retour immédiat. Pas un examen officiel de faculté.",
      ctaLabel: "Lancer l’auto-test",
    },
    "/studenti/chci-studovat": {
      title: "Je veux étudier la médecine",
      description: "Concours, dates, exigences et conseils — MeDiprep et la rédaction MedScope.",
    },
    "/studenti/zkousky": {
      title: "Examens et semestre",
      description: "Orientation pour les périodes d’examens — ne remplace pas les syllabi officiels.",
    },
    "/studenti/ai-tutor": {
      title: "Tuteur IA",
      description: "Assistant IA étudiant pour expliquer le cours — complément, pas un remplacement des cours.",
      ctaLabel: "Demander à l’IA",
    },
    "/lekari": {
      title: "Pour les médecins et chercheurs",
      description:
        "Guidelines fondées sur les preuves, études curatées avec DOI/PMID, brèves FMC, Research Hub et IA clinique — accès vérifié via ČLK.",
      ctaLabel: "FMC rhumatologie",
    },
    "/lekari/guidelines": {
      title: "Guidelines",
      description: "Synthèses de recommandations cliniques pour la pratique.",
    },
    "/lekari/prehledy": {
      title: "Brèves",
      description: "Brèves médicales structurées et aperçus cliniques.",
    },
    "/lekari/studie": {
      title: "Études",
      description: "ECR, méta-analyses et synthèses tchèques avec impact clinique.",
    },
    "/lekari/research-hub": {
      title: "Research Hub",
      description: "Analyse IA des études, PubMed et brèves de recherche.",
    },
    "/lekari/ai-asistent": {
      title: "Assistant IA pour médecins",
      description: "IA clinique — guidelines, diagnostic différentiel et études.",
      ctaLabel: "Lancer l’assistant",
    },
    "/firmy": {
      title: "Pour les entreprises",
      description:
        "Pharma, cliniques, laboratoires et universités — bannière dès 5 000 CZK/mois, article sponsorisé 15 000 CZK, entreprise sur devis.",
      ctaLabel: "Contacter le commercial",
    },
    "/firmy/cenik": {
      title: "Tarifs B2B",
      description:
        "Prix indicatifs : bannière 5 000 CZK/mois, article sponsorisé 15 000 CZK, entreprise au cas par cas.",
      ctaLabel: "Demander un devis",
    },
    "/firmy/reklama": {
      title: "Publicité",
      description: "Bannières, articles sponsorisés et emplacements newsletter.",
    },
    "/firmy/partnerstvi": {
      title: "Partenariat",
      description: "Collaboration universitaire et partenariats institutionnels.",
    },
    "/firmy/kampane": {
      title: "Campagnes",
      description: "Campagnes segmentées pour médecins, étudiants et grand public.",
    },
  },
};

const CS: HubPack = {
  home: "Domů",
  section: { studenti: "Studenti", lekari: "Lékaři", firmy: "Firmy" },
  pages: {},
};

const PACKS: Record<string, HubPack> = { cs: CS, en: EN, de: DE, fr: FR };

export function getHubPack(locale?: string | null): HubPack {
  const key = pack(locale);
  return localizeListedCzkIn(PACKS[key] ?? PACKS.en, locale);
}

/** Same Czech IA as V271_*: translate chrome, keep href structure, prefix locale. */
export function localizeV271Page(
  page: V271HubPage,
  section: HubSection,
  locale: string
): { page: V271HubPage; sectionLabel: string; home: string; homeHref: string } {
  const strings = getHubPack(locale);
  const key = pageKey(section, page.slug);
  const overlay = strings.pages[key] ?? (pack(locale) === "cs" ? undefined : EN.pages[key]);

  return {
    sectionLabel: strings.section[section],
    home: strings.home,
    homeHref: localizePublicHref(`/${section}`, locale),
    page: {
      ...page,
      title: overlay?.title ?? page.title,
      description: localizeListedCzk(overlay?.description ?? page.description, locale),
      ctaLabel: overlay?.ctaLabel
        ? localizeListedCzk(overlay.ctaLabel, locale)
        : page.ctaLabel
          ? localizeListedCzk(page.ctaLabel, locale)
          : page.ctaLabel,
      ctaHref: page.ctaHref ? localizePublicHref(page.ctaHref, locale) : undefined,
      links: page.links.map((link) => {
        const translated = translateNavHref(link.href, locale, {
          label: link.label,
          description: link.description,
        });
        return {
          ...link,
          href: localizePublicHref(link.href, locale),
          label: translated.label,
          description: translated.description,
        };
      }),
    },
  };
}
