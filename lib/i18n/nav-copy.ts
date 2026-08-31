import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { buildLocalePath, isLocaleRoutingExcluded } from "@/lib/i18n/locale-path";

type NavNode = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

type NavStrings = Record<string, { label: string; description?: string }>;

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

/** Translations keyed by the Czech-structure href (same IA as /cs). */
const NAV: Record<string, NavStrings> = {
  en: {
    "/aplikace": { label: "Apps", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/mediflow": { label: "MediFlow", description: "Wellness journal and longevity" },
    "/app/mediflow": { label: "Open MediFlow", description: "Install on the home screen" },
    "/medipacient": { label: "MeDipacient", description: "Medical reports on your phone" },
    "/app/pacient": { label: "Open MeDipacient", description: "Dashboard with sample reports" },
    "/lekari/dokumentace": { label: "OrdiZapis", description: "AI notes for verified physicians" },
    "/app/dokumentace": { label: "Open OrdiZapis", description: "Record on mobile" },
    "/mediprep": { label: "MeDiprep (legacy)", description: "Czech medical-school admissions — secondary" },
    "/app/priprava": { label: "Open MeDiprep", description: "B/C/F tests and faculty mocks" },
    "/dashboard": { label: "My dashboard", description: "Reports, journal and notes" },
    "/verejnost": { label: "Public", description: "Everything for everyone in one place" },
    "/verejnost/temata": { label: "Find your topic", description: "Symptoms, prevention, illness" },
    "/ai-asistent/verejnost": { label: "Ask AI", description: "Health answers — not a substitute for a physician" },
    "/verejnost/clanky": { label: "Articles", description: "Short, plain-language pieces" },
    "/verejnost/osveta": { label: "Daily videos", description: "Health tips with quizzes" },
    "/verejnost/rozhovory": { label: "Interviews", description: "Conversations with clinicians" },
    "/verejnost/zebricek": { label: "Leaderboard", description: "XP for watching and quizzes" },
    "/studenti": { label: "Students", description: "Map for applicants, faculties and parents" },
    "/studenti/chci-studovat": { label: "I want to study medicine", description: "Admissions and prep courses" },
    "/studenti/materialy": { label: "Study materials", description: "Library by year and specialty" },
    "/studenti/testy": { label: "Tests", description: "Self-test and model questions" },
    "/studenti/hry": { label: "Quizzes and games", description: "Study games and quizzes" },
    "/studenti/ai-tutor": { label: "AI tutor", description: "Student AI assistant" },
    "/predplatne": { label: "Subscribe" },
    "/predplatne#student": { label: "Student plan", description: "149 CZK/month · free trial" },
    "/studenti#pro-rodice": { label: "For parents", description: "How to support preparation" },
    "/studenti/zkousky": { label: "Exams", description: "Orientation for faculty exams" },
    "/studenti/leky": { label: "Medicines", description: "SÚKL — not a pharmacology course" },
    "/studium/univerzity": { label: "Medical faculties", description: "8 Czech faculties" },
    "/academy": { label: "Academy", description: "Learning and CME" },
    "/academy/lekari": { label: "Rheumatology CME", description: "Accredited tests for rheumatologists only" },
    "/academy/quizzes": { label: "Quizzes", description: "Knowledge tests" },
    "/academy/ai-simulations": { label: "Simulations", description: "Clinical AI scenarios" },
    "/academy/mentoring": { label: "Mentoring", description: "Mentoring sessions" },
    "/academy/marketplace": { label: "Marketplace", description: "Premium courses" },
    "/academy/textbooks": { label: "Textbooks", description: "Digital textbooks" },
    "/academy/certificates": { label: "Certificates", description: "Certificate gallery" },
    "/academy/leaderboard": { label: "Leaderboard", description: "XP leaderboard" },
    "/academy/games": { label: "Games", description: "Study games" },
    "/lekari": { label: "Physicians", description: "Guidelines, CME, Research Hub" },
    "/academy/lekari/overeni": { label: "ČLK verification (Academy)", description: "Enter the physician zone" },
    "/lekari/guidelines": { label: "Guidelines", description: "Clinical recommendations" },
    "/lekari/prehledy": { label: "Briefs", description: "Medical briefs" },
    "/lekari/studie": { label: "Studies", description: "RCTs, meta-analyses" },
    "/lekari/research-hub": { label: "Research Hub", description: "AI study analysis" },
    "/lekari/ai-asistent": { label: "AI assistant", description: "Clinical AI" },
    "/odborna": { label: "Professional desk (ČLK)", description: "Verified content for physicians" },
    "/leky": { label: "Medicines", description: "SÚKL, EMA, approved products" },
    "/articles": { label: "Articles", description: "Editorial content for practice and study" },
    "/articles?med_track=priprava": { label: "Admissions prep", description: "Faculty admissions preparation" },
    "/articles?med_track=studium": { label: "Medical studies", description: "Years 1–6 and clinical specialties" },
    "/pro-koho": { label: "Who it's for" },
    "/pro-koho/laik-student": { label: "Public and students", description: "Prevention, admissions and plain explanations" },
    "/pro-koho/lekar": { label: "Practicing physician", description: "Clinical practice, guidelines, cases" },
    "/pro-koho/vedec": { label: "Researcher", description: "Studies, evidence and research briefs" },
    "/sections": { label: "Sections" },
    "/studie": { label: "Studies", description: "CZ, EU, SÚKL" },
    "/legislativa": { label: "Legislation" },
    "/digital-health": { label: "Digital health" },
    "/novinky": { label: "News" },
    "/newsletter": { label: "Newsletter" },
    "/odborne": { label: "Professional AI texts" },
    "/ai-medical": { label: "AI Medical" },
    "/ai-medical/doctor": { label: "Physician" },
    "/ai-medical/patient": { label: "Patient" },
    "/ai-medical/research": { label: "Research" },
    "/ai-medical/legislativa": { label: "Legislation" },
    "/ai-medical/leky": { label: "Medicines" },
    "/ai-medical/studie": { label: "Studies" },
    "/ai-medical/univerzity": { label: "Universities" },
    "/o-nas": { label: "About" },
    "/kontakt": { label: "Contact" },
    "/kongresy": { label: "Congresses" },
    "/kariera": { label: "Careers" },
    "/organizace": { label: "For companies", description: "Licences and organisation access" },
    "/organizace/partnerstvi": { label: "Partnership", description: "B2B partnership" },
    "/organizace/licence": { label: "Licences", description: "Licence types and integrations" },
    "/inzerce": { label: "Advertising", description: "Ad options" },
    "/inzerce/cenik": { label: "Ad pricing", description: "Banners and packages" },
    "/inzerce/formular": { label: "Ad order", description: "Form for companies" },
    "/ai/reklamy": { label: "AI ads", description: "Advertising assistant" },
    "/studijni-spoluprace": { label: "Study collaboration", description: "Study offers" },
    "/firmy": { label: "B2B hub", description: "Pharma, clinics, universities" },
    "/firmy/kampane": { label: "Campaigns", description: "Segmented campaigns" },
  },
  de: {
    "/aplikace": { label: "Apps", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/mediflow": { label: "MediFlow", description: "Wellness-Tagebuch und Langlebigkeit" },
    "/app/mediflow": { label: "MediFlow öffnen", description: "Auf den Homescreen legen" },
    "/medipacient": { label: "MeDipacient", description: "Arztberichte am Handy" },
    "/app/pacient": { label: "MeDipacient öffnen", description: "Dashboard mit Beispielberichten" },
    "/lekari/dokumentace": { label: "OrdiZapis", description: "KI-Notizen für geprüfte Ärzte" },
    "/app/dokumentace": { label: "OrdiZapis öffnen", description: "Am Handy aufnehmen" },
    "/mediprep": { label: "MeDiprep (Legacy)", description: "Tschechische Medizineraufnahme — sekundär" },
    "/app/priprava": { label: "MeDiprep öffnen", description: "B/C/F-Tests und Fakultätssimulationen" },
    "/dashboard": { label: "Mein Dashboard", description: "Berichte, Tagebuch und Notizen" },
    "/verejnost": { label: "Öffentlichkeit", description: "Alles für alle an einem Ort" },
    "/verejnost/temata": { label: "Thema finden", description: "Symptome, Prävention, Erkrankungen" },
    "/ai-asistent/verejnost": { label: "KI fragen", description: "Gesundheitsantworten — kein Ersatz für den Arzt" },
    "/verejnost/clanky": { label: "Artikel", description: "Kurze, verständliche Texte" },
    "/verejnost/osveta": { label: "Tägliche Videos", description: "Gesundheitstipps mit Quiz" },
    "/verejnost/rozhovory": { label: "Gespräche", description: "Interviews mit Klinikern" },
    "/verejnost/zebricek": { label: "Rangliste", description: "XP für Videos und Quiz" },
    "/studenti": { label: "Studierende", description: "Karte für Bewerber, Fakultäten und Eltern" },
    "/studenti/chci-studovat": { label: "Ich will Medizin studieren", description: "Aufnahme und Vorbereitung" },
    "/studenti/materialy": { label: "Lernmaterial", description: "Bibliothek nach Jahr und Fach" },
    "/studenti/testy": { label: "Tests", description: "Selbsttest und Modellfragen" },
    "/studenti/hry": { label: "Quiz und Spiele", description: "Lernspiele" },
    "/studenti/ai-tutor": { label: "KI-Tutor", description: "Studenten-KI" },
    "/predplatne": { label: "Abo" },
    "/predplatne#student": { label: "Studententarif", description: "149 CZK/Monat · kostenlos testen" },
    "/studenti#pro-rodice": { label: "Für Eltern", description: "Vorbereitung unterstützen" },
    "/academy": { label: "Academy", description: "Bildung und CME" },
    "/lekari": { label: "Ärzte", description: "Leitlinien, CME, Research Hub" },
    "/articles": { label: "Artikel", description: "Redaktionelle Texte für Praxis und Studium" },
    "/pro-koho": { label: "Für wen" },
    "/o-nas": { label: "Über uns" },
    "/kontakt": { label: "Kontakt" },
    "/firmy": { label: "B2B-Hub", description: "Pharma, Kliniken, Universitäten" },
    "/sections": { label: "Rubriken" },
    "/studie": { label: "Studien" },
    "/novinky": { label: "News" },
  },
  fr: {
    "/aplikace": { label: "Applis", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/mediflow": { label: "MediFlow", description: "Journal wellness et longévité" },
    "/app/mediflow": { label: "Ouvrir MediFlow", description: "Installer sur l’écran d’accueil" },
    "/medipacient": { label: "MeDipacient", description: "Comptes rendus sur mobile" },
    "/app/pacient": { label: "Ouvrir MeDipacient", description: "Tableau avec exemples" },
    "/lekari/dokumentace": { label: "OrdiZapis", description: "Notes IA pour médecins vérifiés" },
    "/app/dokumentace": { label: "Ouvrir OrdiZapis", description: "Enregistrer sur mobile" },
    "/mediprep": { label: "MeDiprep (legacy)", description: "Concours des facultés tchèques — secondaire" },
    "/app/priprava": { label: "Ouvrir MeDiprep", description: "Tests B/C/F et simulations" },
    "/dashboard": { label: "Mon tableau de bord", description: "Comptes rendus, journal et notes" },
    "/verejnost": { label: "Grand public", description: "Tout pour tous au même endroit" },
    "/verejnost/temata": { label: "Trouver un sujet", description: "Symptômes, prévention, maladies" },
    "/ai-asistent/verejnost": { label: "Demander à l’IA", description: "Réponses santé — ne remplace pas un médecin" },
    "/verejnost/clanky": { label: "Articles", description: "Textes courts et clairs" },
    "/verejnost/osveta": { label: "Vidéos du jour", description: "Conseils santé avec quiz" },
    "/verejnost/rozhovory": { label: "Entretiens", description: "Échanges avec des cliniciens" },
    "/verejnost/zebricek": { label: "Classement", description: "XP pour vidéos et quiz" },
    "/studenti": { label: "Étudiants", description: "Carte pour candidats, facultés et parents" },
    "/studenti/chci-studovat": { label: "Je veux étudier la médecine", description: "Concours et prépa" },
    "/studenti/materialy": { label: "Supports d’étude", description: "Bibliothèque par année et discipline" },
    "/studenti/testy": { label: "Tests", description: "Auto-test et questions types" },
    "/studenti/hry": { label: "Quiz et jeux", description: "Jeux d’étude" },
    "/studenti/ai-tutor": { label: "Tuteur IA", description: "Assistant IA étudiant" },
    "/predplatne": { label: "Abonnement" },
    "/predplatne#student": { label: "Formule étudiant", description: "149 CZK/mois · essai gratuit" },
    "/studenti#pro-rodice": { label: "Pour les parents", description: "Soutenir la préparation" },
    "/academy": { label: "Academy", description: "Formation et FMC" },
    "/lekari": { label: "Médecins", description: "Guidelines, FMC, Research Hub" },
    "/articles": { label: "Articles", description: "Contenus éditoriaux pour la pratique et les études" },
    "/pro-koho": { label: "Pour qui" },
    "/o-nas": { label: "À propos" },
    "/kontakt": { label: "Contact" },
    "/firmy": { label: "Hub B2B", description: "Pharma, cliniques, universités" },
    "/sections": { label: "Rubriques" },
    "/studie": { label: "Études" },
    "/novinky": { label: "Actualités" },
  },
};

export function localizePublicHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const hashIdx = href.indexOf("#");
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
  const noHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = noHash.indexOf("?");
  const query = qIdx >= 0 ? noHash.slice(qIdx) : "";
  const path = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
  if (isLocaleRoutingExcluded(path)) return href;
  return `${buildLocalePath(locale, path)}${query}${hash}`;
}

function stringsFor(locale: string): NavStrings {
  const key = pack(locale);
  if (key === "cs") return {};
  return { ...NAV.en, ...(NAV[key] ?? {}) };
}

export function translateNavHref(
  href: string,
  locale: string,
  fallback: { label: string; description?: string }
): { label: string; description?: string } {
  if (pack(locale) === "cs") return fallback;
  const strings = stringsFor(locale);
  const hit = strings[href];
  return {
    label: hit?.label ?? fallback.label,
    description: hit?.description ?? fallback.description,
  };
}

export function localizeNavTree<T extends NavNode>(items: T[], locale: string): T[] {
  const strings = stringsFor(locale);
  return items.map((item) => {
    const hit = strings[item.href];
    const children = item.children ? localizeNavTree(item.children, locale) : undefined;
    return {
      ...item,
      label: hit?.label ?? item.label,
      href: localizePublicHref(item.href, locale),
      children: children?.map((child, index) => {
        const raw = item.children?.[index];
        const rawHit = raw ? strings[raw.href] : undefined;
        return {
          ...child,
          description: rawHit?.description ?? child.description,
        };
      }),
    };
  });
}
