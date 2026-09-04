import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { rewriteCzechInstitutions } from "@/lib/i18n/local-regulator";
import { buildLocalePath, isLocaleRoutingExcluded } from "@/lib/i18n/locale-path";
import { localizeListedCzk } from "@/lib/i18n/payment-currency";

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
    "/verejnost/temata": { label: "Topics", description: "Prevention, nutrition, sleep, stress" },
    "/ai-asistent/verejnost": { label: "Ask AI", description: "Health answers — not a substitute for a physician" },
    "/verejnost/clanky": { label: "Editorial articles", description: "Short pieces without jargon" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longevity",
      description: "Healthspan, sleep, movement and food — read free",
    },
    "/verejnost/osveta": { label: "Today’s tip", description: "One practical step for today" },
    "/verejnost/rozhovory": { label: "Interviews", description: "Clinicians in plain language" },
    "/verejnost/zebricek": { label: "Leaderboard", description: "XP for watching and quizzes" },
    "/predplatne": { label: "Subscribe", description: "14 days free · cancel anytime" },
    "/predplatne#public": { label: "Public plan", description: "Articles, prevention, MeDipacient" },
    "/predplatne#dokumentace": { label: "OrdiZapis", description: "AI notes for the clinic" },
    "/predplatne#physician": { label: "Physician plan", description: "CME and Research Hub" },
    "/studenti": { label: "Students", description: "Map for applicants, faculties and parents" },
    "/studenti/chci-studovat": { label: "I want to study medicine", description: "Admissions and prep courses" },
    "/studenti/materialy": { label: "Study materials", description: "Library by year and specialty" },
    "/studenti/testy": { label: "Tests", description: "Self-test and model questions" },
    "/studenti/hry": { label: "Quizzes and games", description: "Study games and quizzes" },
    "/studenti/ai-tutor": { label: "AI tutor", description: "Student AI assistant" },
    "/predplatne#student": { label: "Student plan", description: "1 free test · intro then 149 CZK / €10" },
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
    "/firmy/cenik": { label: "Pricing", description: "Banner and partner article rates" },
    "/firmy/reklama": { label: "Advertising", description: "Banners and newsletter slots" },
    "/firmy/partnerstvi": { label: "Partnership", description: "University collaboration" },
    "/firmy/kampane": { label: "Campaigns", description: "Segmented campaigns" },
    "/b2b": { label: "B2B", description: "Pharma and professional partners" },
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
    "/verejnost/temata": { label: "Themen", description: "Prävention, Ernährung, Schlaf, Stress" },
    "/ai-asistent/verejnost": { label: "KI fragen", description: "Gesundheitsantworten — kein Ersatz für den Arzt" },
    "/verejnost/clanky": { label: "Redaktionsartikel", description: "Kurze Texte ohne Fachjargon" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Langlebigkeit",
      description: "Healthspan, Schlaf, Bewegung und Essen — frei lesbar",
    },
    "/verejnost/osveta": { label: "Tipp des Tages", description: "Ein praktischer Schritt für heute" },
    "/verejnost/rozhovory": { label: "Gespräche", description: "Kliniker in verständlicher Sprache" },
    "/verejnost/zebricek": { label: "Rangliste", description: "XP für Videos und Quiz" },
    "/studenti": { label: "Studierende", description: "Karte für Bewerber, Fakultäten und Eltern" },
    "/studenti/chci-studovat": { label: "Ich will Medizin studieren", description: "Aufnahme und Vorbereitung" },
    "/studenti/materialy": { label: "Lernmaterial", description: "Bibliothek nach Jahr und Fach" },
    "/studenti/testy": { label: "Tests", description: "Selbsttest und Modellfragen" },
    "/studenti/hry": { label: "Quiz und Spiele", description: "Lernspiele" },
    "/studenti/ai-tutor": { label: "KI-Tutor", description: "Studenten-KI" },
    "/predplatne": { label: "Abo", description: "14 Tage kostenlos · jederzeit kündbar" },
    "/predplatne#student": { label: "Studententarif", description: "149 CZK/Monat · kostenlos testen" },
    "/predplatne#public": { label: "Öffentlichkeit", description: "Artikel, Prävention, MeDipacient" },
    "/predplatne#dokumentace": { label: "OrdiZapis", description: "KI-Notizen für die Praxis" },
    "/predplatne#physician": { label: "Arzt in der Praxis", description: "CME und Research Hub" },
    "/studenti#pro-rodice": { label: "Für Eltern", description: "Vorbereitung unterstützen" },
    "/studenti/zkousky": { label: "Prüfungen", description: "Orientierung zu Fakultätsprüfungen" },
    "/studenti/leky": { label: "Arzneimittel", description: "SÚKL — kein Pharmakologiekurs" },
    "/studium/univerzity": { label: "Medizinische Fakultäten", description: "8 tschechische Fakultäten" },
    "/academy": { label: "Academy", description: "Bildung und CME" },
    "/academy/lekari": { label: "CME Rheumatologie", description: "Akkreditierte Tests nur für Rheumatologen" },
    "/academy/quizzes": { label: "Quiz", description: "Wissenstests" },
    "/academy/ai-simulations": { label: "Simulationen", description: "Klinische KI-Szenarien" },
    "/academy/mentoring": { label: "Mentoring", description: "Mentoring-Sitzungen" },
    "/academy/marketplace": { label: "Marketplace", description: "Premium-Kurse" },
    "/academy/textbooks": { label: "Lehrbücher", description: "Digitale Lehrbücher" },
    "/academy/certificates": { label: "Zertifikate", description: "Zertifikatsgalerie" },
    "/academy/leaderboard": { label: "Rangliste", description: "XP-Rangliste" },
    "/academy/games": { label: "Spiele", description: "Lernspiele" },
    "/lekari": { label: "Ärzte", description: "Leitlinien, CME, Research Hub" },
    "/academy/lekari/overeni": { label: "ČLK-Prüfung (Academy)", description: "Zugang zur Ärztezone" },
    "/lekari/guidelines": { label: "Leitlinien", description: "Klinische Empfehlungen" },
    "/lekari/prehledy": { label: "Briefs", description: "Medizinische Kurzüberblicke" },
    "/lekari/studie": { label: "Studien", description: "RCTs, Metaanalysen" },
    "/lekari/research-hub": { label: "Research Hub", description: "KI-Studienanalyse" },
    "/lekari/ai-asistent": { label: "KI-Assistent", description: "Klinische KI" },
    "/odborna": { label: "Fachredaktion (ČLK)", description: "Geprüfte Inhalte für Ärzte" },
    "/leky": { label: "Arzneimittel", description: "SÚKL, EMA, zugelassene Präparate" },
    "/articles": { label: "Artikel", description: "Redaktionelle Texte für Praxis und Studium" },
    "/articles?med_track=priprava": { label: "Aufnahmevorbereitung", description: "Vorbereitung auf die Fakultät" },
    "/articles?med_track=studium": { label: "Medizinstudium", description: "Jahre 1–6 und klinische Fächer" },
    "/pro-koho": { label: "Für wen" },
    "/o-nas": { label: "Über uns" },
    "/kontakt": { label: "Kontakt" },
    "/firmy": { label: "B2B-Hub", description: "Pharma, Kliniken, Universitäten" },
    "/firmy/cenik": { label: "Preise", description: "Banner und Partnerartikel" },
    "/firmy/reklama": { label: "Werbung", description: "Banner und Newsletter-Slots" },
    "/firmy/partnerstvi": { label: "Partnerschaft", description: "Universitätspartnerschaft" },
    "/b2b": { label: "B2B", description: "Pharma und Fachpartner" },
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
    "/verejnost/temata": { label: "Sujets", description: "Prévention, nutrition, sommeil, stress" },
    "/ai-asistent/verejnost": { label: "Demander à l’IA", description: "Réponses santé — ne remplace pas un médecin" },
    "/verejnost/clanky": { label: "Articles de la rédaction", description: "Textes courts, sans jargon" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longévité",
      description: "Healthspan, sommeil, mouvement et alimentation — lecture libre",
    },
    "/verejnost/osveta": { label: "Conseil du jour", description: "Un geste concret pour aujourd’hui" },
    "/verejnost/rozhovory": { label: "Entretiens", description: "Des cliniciens en langage clair" },
    "/verejnost/zebricek": { label: "Classement", description: "XP pour vidéos et quiz" },
    "/studenti": { label: "Étudiants", description: "Carte pour candidats, facultés et parents" },
    "/studenti/chci-studovat": { label: "Je veux étudier la médecine", description: "Concours et prépa" },
    "/studenti/materialy": { label: "Supports d’étude", description: "Bibliothèque par année et discipline" },
    "/studenti/testy": { label: "Tests", description: "Auto-test et questions types" },
    "/studenti/hry": { label: "Quiz et jeux", description: "Jeux d’étude" },
    "/studenti/ai-tutor": { label: "Tuteur IA", description: "Assistant IA étudiant" },
    "/predplatne": { label: "Abonnement", description: "14 jours gratuits · résiliation à tout moment" },
    "/predplatne#student": { label: "Formule étudiant", description: "149 CZK/mois · essai gratuit" },
    "/predplatne#public": { label: "Grand public", description: "Articles, prévention, MeDipacient" },
    "/predplatne#dokumentace": { label: "OrdiZapis", description: "Notes IA pour le cabinet" },
    "/predplatne#physician": { label: "Médecin en exercice", description: "FMC et Research Hub" },
    "/studenti#pro-rodice": { label: "Pour les parents", description: "Soutenir la préparation" },
    "/studenti/zkousky": { label: "Examens", description: "Repères pour les examens de faculté" },
    "/studenti/leky": { label: "Médicaments", description: "SÚKL — pas un cours de pharmacologie" },
    "/studium/univerzity": { label: "Facultés de médecine", description: "8 facultés tchèques" },
    "/academy": { label: "Academy", description: "Formation et FMC" },
    "/academy/lekari": { label: "FMC rhumatologie", description: "Tests accrédités pour rhumatologues uniquement" },
    "/academy/quizzes": { label: "Quiz", description: "Tests de connaissances" },
    "/academy/ai-simulations": { label: "Simulations", description: "Scénarios cliniques IA" },
    "/academy/mentoring": { label: "Mentorat", description: "Séances de mentorat" },
    "/academy/marketplace": { label: "Marketplace", description: "Cours premium" },
    "/academy/textbooks": { label: "Manuels", description: "Manuels numériques" },
    "/academy/certificates": { label: "Certificats", description: "Galerie de certificats" },
    "/academy/leaderboard": { label: "Classement", description: "Classement XP" },
    "/academy/games": { label: "Jeux", description: "Jeux d’étude" },
    "/lekari": { label: "Médecins", description: "Guidelines, FMC, Research Hub" },
    "/academy/lekari/overeni": { label: "Vérification ČLK (Academy)", description: "Entrer dans l’espace médecins" },
    "/lekari/guidelines": { label: "Guidelines", description: "Recommandations cliniques" },
    "/lekari/prehledy": { label: "Brèves", description: "Brèves médicales" },
    "/lekari/studie": { label: "Études", description: "ECR, méta-analyses" },
    "/lekari/research-hub": { label: "Research Hub", description: "Analyse IA des études" },
    "/lekari/ai-asistent": { label: "Assistant IA", description: "IA clinique" },
    "/odborna": { label: "Bureau professionnel (ČLK)", description: "Contenus vérifiés pour médecins" },
    "/leky": { label: "Médicaments", description: "SÚKL, EMA, produits autorisés" },
    "/articles": { label: "Articles", description: "Contenus éditoriaux pour la pratique et les études" },
    "/articles?med_track=priprava": { label: "Prépa concours", description: "Préparation aux facultés" },
    "/articles?med_track=studium": { label: "Études de médecine", description: "Années 1–6 et spécialités" },
    "/pro-koho": { label: "Pour qui" },
    "/o-nas": { label: "À propos" },
    "/kontakt": { label: "Contact" },
    "/firmy": { label: "Hub B2B", description: "Pharma, cliniques, universités" },
    "/firmy/cenik": { label: "Tarifs", description: "Bannière et article partenaire" },
    "/firmy/reklama": { label: "Publicité", description: "Bannières et emplacements newsletter" },
    "/firmy/partnerstvi": { label: "Partenariat", description: "Collaboration universitaire" },
    "/b2b": { label: "B2B", description: "Pharma et partenaires professionnels" },
    "/sections": { label: "Rubriques" },
    "/studie": { label: "Études" },
    "/novinky": { label: "Actualités" },
  },
  pt: {
    "/aplikace": { label: "Aplicações", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/mediflow": { label: "MediFlow", description: "Diário de bem-estar e longevidade" },
    "/app/mediflow": { label: "Abrir o MediFlow", description: "Instalar no ecrã inicial" },
    "/medipacient": { label: "MeDipacient", description: "Relatórios médicos no telemóvel" },
    "/verejnost": { label: "Público", description: "Tudo para toda a gente num só sítio" },
    "/verejnost/temata": { label: "Temas", description: "Prevenção, alimentação, sono, stresse" },
    "/ai-asistent/verejnost": { label: "Perguntar à IA", description: "Respostas de saúde — não substitui o médico" },
    "/verejnost/clanky": { label: "Artigos da redação", description: "Textos curtos, sem jargão" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longevidade",
      description: "Healthspan, sono, movimento e comida — leitura livre",
    },
    "/verejnost/osveta": { label: "Dica de hoje", description: "Um gesto prático para hoje" },
    "/verejnost/rozhovory": { label: "Conversas", description: "Clínicos em linguagem clara" },
    "/predplatne": { label: "Subscrever", description: "14 dias grátis · cancele quando quiser" },
    "/predplatne#public": { label: "Plano público", description: "Artigos, prevenção, MeDipacient" },
    "/articles": { label: "Artigos", description: "Textos da redação para ler e praticar" },
    "/pro-koho": { label: "Para quem" },
    "/o-nas": { label: "Sobre nós" },
    "/kontakt": { label: "Contacto" },
    "/newsletter": { label: "Brief", description: "Uma vez por semana no seu idioma" },
  },
  "pt-BR": {
    "/aplikace": { label: "Apps", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/mediflow": { label: "MediFlow", description: "Diário de bem-estar e longevidade" },
    "/app/mediflow": { label: "Abrir o MediFlow", description: "Instalar na tela inicial" },
    "/medipacient": { label: "MeDipacient", description: "Relatórios médicos no celular" },
    "/verejnost": { label: "Público", description: "Tudo para todo mundo num só lugar" },
    "/verejnost/temata": { label: "Temas", description: "Prevenção, alimentação, sono, estresse" },
    "/ai-asistent/verejnost": { label: "Perguntar à IA", description: "Respostas de saúde — não substitui o médico" },
    "/verejnost/clanky": { label: "Artigos da redação", description: "Textos curtos, sem jargão" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longevidade",
      description: "Healthspan, sono, movimento e comida — leitura livre",
    },
    "/verejnost/osveta": { label: "Dica de hoje", description: "Um gesto prático para hoje" },
    "/verejnost/rozhovory": { label: "Conversas", description: "Clínicos em linguagem clara" },
    "/predplatne": { label: "Assinar", description: "14 dias grátis · cancele quando quiser" },
    "/predplatne#public": { label: "Plano público", description: "Artigos, prevenção, MeDipacient" },
    "/articles": { label: "Artigos", description: "Textos da redação para ler e praticar" },
    "/pro-koho": { label: "Para quem" },
    "/o-nas": { label: "Sobre nós" },
    "/kontakt": { label: "Contato" },
    "/newsletter": { label: "Brief", description: "Uma vez por semana no seu idioma" },
  },
  it: {
    "/aplikace": { label: "App", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/verejnost": { label: "Pubblico", description: "Tutto per tutti in un solo posto" },
    "/verejnost/clanky": { label: "Articoli della redazione", description: "Testi brevi, senza gergo" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longevità",
      description: "Healthspan, sonno, movimento e cibo — lettura libera",
    },
    "/predplatne": { label: "Abbonamento", description: "14 giorni gratis · disdici quando vuoi" },
    "/articles": { label: "Articoli", description: "Testi della redazione" },
    "/lekari": { label: "Medici", description: "Guidelines, FMC, Research Hub" },
    "/inzerce": { label: "Pubblicità", description: "Opzioni pubblicitarie" },
    "/inzerce/cenik": { label: "Listino", description: "Banner e pacchetti" },
    "/firmy": { label: "Hub B2B", description: "Pharma, cliniche, università" },
    "/pro-koho": { label: "Per chi" },
    "/o-nas": { label: "Chi siamo" },
    "/kontakt": { label: "Contatti" },
    "/newsletter": { label: "Brief", description: "Una volta a settimana nella tua lingua" },
  },
  es: {
    "/aplikace": { label: "Apps", description: "MediFlow, MeDipacient, OrdiZapis" },
    "/verejnost": { label: "Público", description: "Todo para todos en un solo sitio" },
    "/verejnost/clanky": { label: "Artículos de la redacción", description: "Textos cortos, sin jerga" },
    "/verejnost/clanky?topic=dlouhovekost": {
      label: "Longevidad",
      description: "Healthspan, sueño, movimiento y comida — lectura libre",
    },
    "/predplatne": { label: "Suscripción", description: "14 días gratis · cancela cuando quieras" },
    "/articles": { label: "Artículos", description: "Textos de la redacción" },
    "/lekari": { label: "Médicos", description: "Guidelines, FMC, Research Hub" },
    "/inzerce": { label: "Publicidad", description: "Opciones publicitarias" },
    "/inzerce/cenik": { label: "Tarifas", description: "Banners y packs" },
    "/firmy": { label: "Hub B2B", description: "Pharma, clínicas, universidades" },
    "/pro-koho": { label: "Para quién" },
    "/o-nas": { label: "Quiénes somos" },
    "/kontakt": { label: "Contacto" },
    "/newsletter": { label: "Brief", description: "Una vez por semana en tu idioma" },
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
    label: rewriteCzechInstitutions(localizeListedCzk(hit?.label ?? fallback.label, locale), locale),
    description:
      hit?.description || fallback.description
        ? rewriteCzechInstitutions(
            localizeListedCzk(hit?.description ?? fallback.description ?? "", locale),
            locale
          )
        : fallback.description,
  };
}

export function localizeNavTree<T extends NavNode>(items: T[], locale: string): T[] {
  const strings = stringsFor(locale);
  return items.map((item) => {
    const hit = strings[item.href];
    const children = item.children ? localizeNavTree(item.children, locale) : undefined;
    return {
      ...item,
      label: rewriteCzechInstitutions(localizeListedCzk(hit?.label ?? item.label, locale), locale),
      href: localizePublicHref(item.href, locale),
      children: children?.map((child, index) => {
        const raw = item.children?.[index];
        const rawHit = raw ? strings[raw.href] : undefined;
        const description = rawHit?.description ?? child.description;
        return {
          ...child,
          description: description
            ? rewriteCzechInstitutions(localizeListedCzk(description, locale), locale)
            : description,
        };
      }),
    };
  });
}
