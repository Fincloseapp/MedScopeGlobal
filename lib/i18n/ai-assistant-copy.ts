import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { isCzechSurface } from "@/lib/i18n/surface-copy";

export type AiAssistantCard = {
  href: string;
  label: string;
  desc: string;
  color: string;
};

export type AiAssistantCopy = {
  hubMetaTitle: string;
  hubMetaDescription: string;
  hubTitle: string;
  hubLead: string;
  cards: AiAssistantCard[];
  publicMetaTitle: string;
  publicMetaDescription: string;
  publicEyebrow: string;
  publicTitle: string;
  publicLead: string;
  publicCta: string;
  publicBack: string;
  publicExamplesTitle: string;
  publicExamples: string[];
  publicConsoleTitle: string;
  physicianMetaTitle: string;
  physicianMetaDescription: string;
  physicianEyebrow: string;
  physicianTitle: string;
  physicianLead: string;
  physicianConsoleTitle: string;
  allAssistants: string;
  queryLabel: string;
  publicPlaceholder: string;
  clinicalPlaceholder: string;
  ask: string;
  run: string;
  loading: string;
  answer: string;
  summary: string;
  recommendations: string;
  conclusions: string;
  graphic: string;
  sources: string;
  outputProfessional: string;
  outputPatient: string;
  phDiagnosis: string;
  phStudy: string;
  phDrug: string;
  phLaw: string;
  publicHint: string;
  languageLabel: string;
  assistantLabel: string;
  specialtyLabel: string;
  outputLabel: string;
  langCs: string;
  langSk: string;
  langEn: string;
};

type AiAssistantPageCopy = Omit<
  AiAssistantCopy,
  | "publicHint"
  | "languageLabel"
  | "assistantLabel"
  | "specialtyLabel"
  | "outputLabel"
  | "langCs"
  | "langSk"
  | "langEn"
>;

const PUBLIC_COLOR = "from-emerald-600 to-teal-700";
const PHYSICIAN_COLOR = "from-[#021d33] to-[#005B96]";
const STUDENT_COLOR = "from-blue-600 to-indigo-700";

const CONSOLE: Record<
  ChromePack,
  Pick<
    AiAssistantCopy,
    | "publicHint"
    | "languageLabel"
    | "assistantLabel"
    | "specialtyLabel"
    | "outputLabel"
    | "langCs"
    | "langSk"
    | "langEn"
  >
> = {
  cs: {
    publicHint: "Napište dotaz jednoduchou češtinou. Odpověď bude srozumitelná pro laiky — bez výběru lékařského oboru.",
    languageLabel: "Jazyk",
    assistantLabel: "Asistent",
    specialtyLabel: "Obor",
    outputLabel: "Typ výstupu",
    langCs: "Čeština",
    langSk: "Slovenština",
    langEn: "Angličtina",
  },
  de: {
    publicHint: "Schreiben Sie die Frage in Alltagssprache. Die Antwort bleibt verständlich — ohne Fachauswahl.",
    languageLabel: "Sprache",
    assistantLabel: "Assistent",
    specialtyLabel: "Fach",
    outputLabel: "Ausgabe",
    langCs: "Tschechisch",
    langSk: "Slowakisch",
    langEn: "Englisch",
  },
  fr: {
    publicHint: "Écrivez la question en langage courant. La réponse reste claire — sans choix de spécialité.",
    languageLabel: "Langue",
    assistantLabel: "Assistant",
    specialtyLabel: "Spécialité",
    outputLabel: "Type de sortie",
    langCs: "Tchèque",
    langSk: "Slovaque",
    langEn: "Anglais",
  },
  en: {
    publicHint: "Write the question in plain language. The answer stays readable — without picking a specialty.",
    languageLabel: "Language",
    assistantLabel: "Assistant",
    specialtyLabel: "Specialty",
    outputLabel: "Output type",
    langCs: "Czech",
    langSk: "Slovak",
    langEn: "English",
  },
  it: {
    publicHint: "Scrivete la domanda in linguaggio semplice. La risposta resta chiara — senza scegliere la specialità.",
    languageLabel: "Lingua",
    assistantLabel: "Assistente",
    specialtyLabel: "Specialità",
    outputLabel: "Tipo di output",
    langCs: "Ceco",
    langSk: "Slovacco",
    langEn: "Inglese",
  },
  es: {
    publicHint: "Escriba la pregunta en lenguaje claro. La respuesta sigue siendo legible — sin elegir especialidad.",
    languageLabel: "Idioma",
    assistantLabel: "Asistente",
    specialtyLabel: "Especialidad",
    outputLabel: "Tipo de salida",
    langCs: "Checo",
    langSk: "Eslovaco",
    langEn: "Inglés",
  },
  "pt-BR": {
    publicHint: "Escreva a pergunta em linguagem simples. A resposta permanece clara — sem escolher especialidade.",
    languageLabel: "Idioma",
    assistantLabel: "Assistente",
    specialtyLabel: "Especialidade",
    outputLabel: "Tipo de saída",
    langCs: "Checo",
    langSk: "Eslovaco",
    langEn: "Inglês",
  },
};

const PACK: Record<ChromePack, AiAssistantPageCopy> = {
  cs: {
    hubMetaTitle: "AI asistenti | MedScopeGlobal",
    hubMetaDescription: "Veřejný a klinický AI asistent — vzdělávací nástroje, ne diagnóza.",
    hubTitle: "AI asistenti MedScope",
    hubLead: "Specializované asistenty napojené na AI Medical engine. Neposkytují diagnózu — slouží ke vzdělávání.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "AI pro veřejnost", desc: "Prevence, symptomy, životní styl — srozumitelné odpovědi", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "Klinický AI pro lékaře", desc: "Guidelines, diferenciální diagnostika, studie", color: PHYSICIAN_COLOR },
      { href: "/ai-asistent/student", label: "AI tutor pro studenty", desc: "Anatomie, farmakologie, příprava na zkoušky", color: STUDENT_COLOR },
    ],
    publicMetaTitle: "AI asistent pro veřejnost | MedScopeGlobal",
    publicMetaDescription: "Zeptejte se AI o prevenci, výživě, spánku a životním stylu — srozumitelně, bez odborného žargonu.",
    publicEyebrow: "Veřejné zdraví",
    publicTitle: "Zeptej se AI — srozumitelné odpovědi o zdraví",
    publicLead: "Napište dotaz o prevenci, symptomech nebo životním stylu. Odpovědi jsou vzdělávací a nenahrazují návštěvu lékaře.",
    publicCta: "Najdi svůj problém",
    publicBack: "← Zpět na veřejnou sekci",
    publicExamplesTitle: "Příklady dotazů",
    publicExamples: ["Jak zlepšit kvalitu spánku?", "Co znamenají běžné příznaky chřipky?", "Jaké jsou základy zdravé výživy?"],
    publicConsoleTitle: "Veřejný AI asistent",
    physicianMetaTitle: "Klinický AI pro lékaře | MedScopeGlobal",
    physicianMetaDescription: "Guidelines, diferenciální diagnostika a studie pro lékaře v praxi.",
    physicianEyebrow: "Lékaři",
    physicianTitle: "Klinický AI asistent",
    physicianLead: "Evidence-based odpovědi pro lékaře — guidelines, studie, léčebné algoritmy.",
    physicianConsoleTitle: "Klinický AI asistent",
    allAssistants: "← Všechny asistenti",
    queryLabel: "Váš dotaz",
    publicPlaceholder: "Např.: Co dělat při bolesti hlavy? Jak zlepšit spánek?",
    clinicalPlaceholder: "Zadejte klinický dotaz, požadavek na shrnutí, přehled studií…",
    ask: "Zeptat se",
    run: "Spustit asistenta",
    loading: "Připravuji odpověď…",
    answer: "Odpověď",
    summary: "Shrnutí",
    recommendations: "Doporučení",
    conclusions: "Klinické závěry",
    graphic: "Grafické shrnutí (text)",
    sources: "Zdroje z databáze",
    outputProfessional: "Odborný",
    outputPatient: "Pacientský",
    phDiagnosis: "Diagnóza (ra, psa, as…)",
    phStudy: "Typ studie (rct, meta-analysis…)",
    phDrug: "Název léku",
    phLaw: "Kategorie legislativy",
  },
  de: {
    hubMetaTitle: "KI-Assistenten | MedScopeGlobal",
    hubMetaDescription: "Öffentlicher und klinischer KI-Assistent — Lernwerkzeuge, keine Diagnose.",
    hubTitle: "KI-Assistenten von MedScope",
    hubLead: "Spezialisierte Assistenten am AI-Medical-Engine. Sie stellen keine Diagnose — sie dienen der Orientierung.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "KI für die Öffentlichkeit", desc: "Prävention, Symptome, Lebensstil — verständliche Antworten", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "Klinische KI für Ärzte", desc: "Leitlinien, Differenzialdiagnose, Studien", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "KI-Assistent für die Öffentlichkeit | MedScopeGlobal",
    publicMetaDescription: "Fragen Sie die KI zu Prävention, Ernährung, Schlaf und Lebensstil — verständlich, ohne Fachjargon.",
    publicEyebrow: "Öffentliche Gesundheit",
    publicTitle: "KI fragen — klare Antworten zur Gesundheit",
    publicLead: "Schreiben Sie eine Frage zu Prävention, Symptomen oder Lebensstil. Die Antworten sind Bildung — kein Ersatz für den Arztbesuch.",
    publicCta: "Thema finden",
    publicBack: "← Zurück zur Öffentlichkeit",
    publicExamplesTitle: "Beispielfragen",
    publicExamples: ["Wie verbessere ich den Schlaf?", "Was bedeuten häufige Grippesymptome?", "Was sind die Grundlagen gesunder Ernährung?"],
    publicConsoleTitle: "Öffentlicher KI-Assistent",
    physicianMetaTitle: "Klinische KI für Ärzte | MedScopeGlobal",
    physicianMetaDescription: "Leitlinien, Differenzialdiagnose und Studien für die Praxis.",
    physicianEyebrow: "Ärzte",
    physicianTitle: "Klinischer KI-Assistent",
    physicianLead: "Evidenzbasierte Antworten für die Praxis — Leitlinien, Studien, Algorithmen.",
    physicianConsoleTitle: "Klinischer KI-Assistent",
    allAssistants: "← Alle Assistenten",
    queryLabel: "Ihre Frage",
    publicPlaceholder: "z. B.: Was tun bei Kopfschmerz? Wie besser schlafen?",
    clinicalPlaceholder: "Klinische Frage, Zusammenfassung oder Studienüberblick…",
    ask: "Fragen",
    run: "Assistent starten",
    loading: "Antwort wird vorbereitet…",
    answer: "Antwort",
    summary: "Kurzfassung",
    recommendations: "Empfehlungen",
    conclusions: "Klinische Schlüsse",
    graphic: "Grafische Kurzfassung (Text)",
    sources: "Quellen aus der Datenbank",
    outputProfessional: "Fachlich",
    outputPatient: "Für Patientinnen",
    phDiagnosis: "Diagnose (ra, psa, as…)",
    phStudy: "Studientyp (rct, meta-analysis…)",
    phDrug: "Arzneimittelname",
    phLaw: "Rechtskategorie",
  },
  fr: {
    hubMetaTitle: "Assistants IA | MedScopeGlobal",
    hubMetaDescription: "Assistant IA grand public et clinique — outils éducatifs, pas un diagnostic.",
    hubTitle: "Assistants IA MedScope",
    hubLead: "Assistants spécialisés branchés sur le moteur AI Medical. Ils ne posent pas de diagnostic — ils servent à s’orienter.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "IA pour le grand public", desc: "Prévention, symptômes, mode de vie — réponses claires", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "IA clinique pour les médecins", desc: "Guidelines, diagnostic différentiel, études", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "Assistant IA pour le grand public | MedScopeGlobal",
    publicMetaDescription: "Posez une question sur la prévention, l’alimentation, le sommeil et le mode de vie — sans jargon.",
    publicEyebrow: "Santé publique",
    publicTitle: "Demander à l’IA — des réponses claires sur la santé",
    publicLead: "Écrivez une question sur la prévention, les symptômes ou le mode de vie. Les réponses sont éducatives et ne remplacent pas une consultation.",
    publicCta: "Trouver un sujet",
    publicBack: "← Retour au grand public",
    publicExamplesTitle: "Exemples de questions",
    publicExamples: ["Comment mieux dormir ?", "Que signifient les symptômes courants de grippe ?", "Quelles sont les bases d’une alimentation saine ?"],
    publicConsoleTitle: "Assistant IA grand public",
    physicianMetaTitle: "IA clinique pour les médecins | MedScopeGlobal",
    physicianMetaDescription: "Guidelines, diagnostic différentiel et études pour la pratique.",
    physicianEyebrow: "Médecins",
    physicianTitle: "Assistant IA clinique",
    physicianLead: "Réponses fondées sur les preuves — guidelines, études, algorithmes.",
    physicianConsoleTitle: "Assistant IA clinique",
    allAssistants: "← Tous les assistants",
    queryLabel: "Votre question",
    publicPlaceholder: "Ex. : Que faire en cas de mal de tête ? Comment mieux dormir ?",
    clinicalPlaceholder: "Question clinique, demande de synthèse, aperçu d’études…",
    ask: "Demander",
    run: "Lancer l’assistant",
    loading: "Préparation de la réponse…",
    answer: "Réponse",
    summary: "Synthèse",
    recommendations: "Recommandations",
    conclusions: "Conclusions cliniques",
    graphic: "Synthèse graphique (texte)",
    sources: "Sources de la base",
    outputProfessional: "Professionnel",
    outputPatient: "Patient",
    phDiagnosis: "Diagnostic (ra, psa, as…)",
    phStudy: "Type d’étude (rct, meta-analysis…)",
    phDrug: "Nom du médicament",
    phLaw: "Catégorie juridique",
  },
  en: {
    hubMetaTitle: "AI assistants | MedScopeGlobal",
    hubMetaDescription: "Public and clinical AI assistants — educational tools, not a diagnosis.",
    hubTitle: "MedScope AI assistants",
    hubLead: "Specialised assistants on the AI Medical engine. They do not diagnose — they help you get oriented.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "AI for the public", desc: "Prevention, symptoms, lifestyle — plain answers", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "Clinical AI for physicians", desc: "Guidelines, differential diagnosis, studies", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "AI assistant for the public | MedScopeGlobal",
    publicMetaDescription: "Ask AI about prevention, food, sleep and lifestyle — in plain language, without jargon.",
    publicEyebrow: "Public health",
    publicTitle: "Ask AI — plain answers about health",
    publicLead: "Write a question about prevention, symptoms or lifestyle. Answers are educational and do not replace a physician visit.",
    publicCta: "Find your topic",
    publicBack: "← Back to the public desk",
    publicExamplesTitle: "Example questions",
    publicExamples: ["How can I sleep better?", "What do common flu symptoms mean?", "What are the basics of healthy eating?"],
    publicConsoleTitle: "Public AI assistant",
    physicianMetaTitle: "Clinical AI for physicians | MedScopeGlobal",
    physicianMetaDescription: "Guidelines, differential diagnosis and studies for clinic work.",
    physicianEyebrow: "Physicians",
    physicianTitle: "Clinical AI assistant",
    physicianLead: "Evidence-based answers for clinic work — guidelines, studies, algorithms.",
    physicianConsoleTitle: "Clinical AI assistant",
    allAssistants: "← All assistants",
    queryLabel: "Your question",
    publicPlaceholder: "e.g. What to do for a headache? How to sleep better?",
    clinicalPlaceholder: "Clinical question, summary request, study overview…",
    ask: "Ask",
    run: "Run assistant",
    loading: "Preparing the answer…",
    answer: "Answer",
    summary: "Summary",
    recommendations: "Recommendations",
    conclusions: "Clinical conclusions",
    graphic: "Graphic summary (text)",
    sources: "Sources from the database",
    outputProfessional: "Professional",
    outputPatient: "Patient",
    phDiagnosis: "Diagnosis (ra, psa, as…)",
    phStudy: "Study type (rct, meta-analysis…)",
    phDrug: "Drug name",
    phLaw: "Legislation category",
  },
  it: {
    hubMetaTitle: "Assistenti IA | MedScopeGlobal",
    hubMetaDescription: "Assistente IA per il pubblico e clinico — strumenti educativi, non una diagnosi.",
    hubTitle: "Assistenti IA MedScope",
    hubLead: "Assistenti specializzati sul motore AI Medical. Non diagnosticano — servono per orientarsi.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "IA per il pubblico", desc: "Prevenzione, sintomi, stile di vita — risposte chiare", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "IA clinica per i medici", desc: "Linee guida, diagnosi differenziale, studi", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "Assistente IA per il pubblico | MedScopeGlobal",
    publicMetaDescription: "Chiedi all’IA su prevenzione, alimentazione, sonno e stile di vita — senza gergo.",
    publicEyebrow: "Salute pubblica",
    publicTitle: "Chiedi all’IA — risposte chiare sulla salute",
    publicLead: "Scrivi una domanda su prevenzione, sintomi o stile di vita. Le risposte sono educative e non sostituiscono una visita.",
    publicCta: "Trova un tema",
    publicBack: "← Torna al pubblico",
    publicExamplesTitle: "Esempi di domande",
    publicExamples: ["Come dormire meglio?", "Cosa significano i sintomi comuni dell’influenza?", "Quali sono le basi di un’alimentazione sana?"],
    publicConsoleTitle: "Assistente IA per il pubblico",
    physicianMetaTitle: "IA clinica per i medici | MedScopeGlobal",
    physicianMetaDescription: "Linee guida, diagnosi differenziale e studi per la pratica.",
    physicianEyebrow: "Medici",
    physicianTitle: "Assistente IA clinico",
    physicianLead: "Risposte basate sulle evidenze — linee guida, studi, algoritmi.",
    physicianConsoleTitle: "Assistente IA clinico",
    allAssistants: "← Tutti gli assistenti",
    queryLabel: "La tua domanda",
    publicPlaceholder: "es.: Cosa fare per il mal di testa? Come dormire meglio?",
    clinicalPlaceholder: "Domanda clinica, richiesta di sintesi, panoramica di studi…",
    ask: "Chiedi",
    run: "Avvia l’assistente",
    loading: "Preparazione della risposta…",
    answer: "Risposta",
    summary: "Sintesi",
    recommendations: "Raccomandazioni",
    conclusions: "Conclusioni cliniche",
    graphic: "Sintesi grafica (testo)",
    sources: "Fonti dal database",
    outputProfessional: "Professionale",
    outputPatient: "Paziente",
    phDiagnosis: "Diagnosi (ra, psa, as…)",
    phStudy: "Tipo di studio (rct, meta-analysis…)",
    phDrug: "Nome del farmaco",
    phLaw: "Categoria normativa",
  },
  es: {
    hubMetaTitle: "Asistentes de IA | MedScopeGlobal",
    hubMetaDescription: "Asistente de IA para el público y clínico — herramientas educativas, no un diagnóstico.",
    hubTitle: "Asistentes de IA de MedScope",
    hubLead: "Asistentes especializados en el motor AI Medical. No diagnostican — sirven para orientarse.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "IA para el público", desc: "Prevención, síntomas, estilo de vida — respuestas claras", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "IA clínica para médicos", desc: "Guías, diagnóstico diferencial, estudios", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "Asistente de IA para el público | MedScopeGlobal",
    publicMetaDescription: "Pregunta a la IA sobre prevención, alimentación, sueño y estilo de vida — sin jerga.",
    publicEyebrow: "Salud pública",
    publicTitle: "Pregunta a la IA — respuestas claras sobre salud",
    publicLead: "Escribe una pregunta sobre prevención, síntomas o estilo de vida. Las respuestas son educativas y no sustituyen una consulta.",
    publicCta: "Encontrar un tema",
    publicBack: "← Volver al público",
    publicExamplesTitle: "Ejemplos de preguntas",
    publicExamples: ["¿Cómo dormir mejor?", "¿Qué significan los síntomas habituales de gripe?", "¿Cuáles son las bases de una alimentación sana?"],
    publicConsoleTitle: "Asistente de IA para el público",
    physicianMetaTitle: "IA clínica para médicos | MedScopeGlobal",
    physicianMetaDescription: "Guías, diagnóstico diferencial y estudios para la consulta.",
    physicianEyebrow: "Médicos",
    physicianTitle: "Asistente de IA clínica",
    physicianLead: "Respuestas basadas en evidencia — guías, estudios, algoritmos.",
    physicianConsoleTitle: "Asistente de IA clínica",
    allAssistants: "← Todos los asistentes",
    queryLabel: "Tu pregunta",
    publicPlaceholder: "p. ej. ¿Qué hacer ante un dolor de cabeza? ¿Cómo dormir mejor?",
    clinicalPlaceholder: "Pregunta clínica, petición de síntesis, panorama de estudios…",
    ask: "Preguntar",
    run: "Iniciar el asistente",
    loading: "Preparando la respuesta…",
    answer: "Respuesta",
    summary: "Resumen",
    recommendations: "Recomendaciones",
    conclusions: "Conclusiones clínicas",
    graphic: "Resumen gráfico (texto)",
    sources: "Fuentes de la base",
    outputProfessional: "Profesional",
    outputPatient: "Paciente",
    phDiagnosis: "Diagnóstico (ra, psa, as…)",
    phStudy: "Tipo de estudio (rct, meta-analysis…)",
    phDrug: "Nombre del medicamento",
    phLaw: "Categoría normativa",
  },
  "pt-BR": {
    hubMetaTitle: "Assistentes de IA | MedScopeGlobal",
    hubMetaDescription: "Assistente de IA para o público e clínico — ferramentas educativas, não um diagnóstico.",
    hubTitle: "Assistentes de IA da MedScope",
    hubLead: "Assistentes especializados no motor AI Medical. Não diagnosticam — servem para se orientar.",
    cards: [
      { href: "/ai-asistent/verejnost", label: "IA para o público", desc: "Prevenção, sintomas, estilo de vida — respostas claras", color: PUBLIC_COLOR },
      { href: "/ai-asistent/lekar", label: "IA clínica para médicos", desc: "Guidelines, diagnóstico diferencial, estudos", color: PHYSICIAN_COLOR },
    ],
    publicMetaTitle: "Assistente de IA para o público | MedScopeGlobal",
    publicMetaDescription: "Pergunte à IA sobre prevenção, alimentação, sono e estilo de vida — sem jargão.",
    publicEyebrow: "Saúde pública",
    publicTitle: "Perguntar à IA — respostas claras sobre saúde",
    publicLead: "Escreva uma pergunta sobre prevenção, sintomas ou estilo de vida. As respostas são educativas e não substituem uma consulta.",
    publicCta: "Encontrar um tema",
    publicBack: "← Voltar ao público",
    publicExamplesTitle: "Exemplos de perguntas",
    publicExamples: ["Como dormir melhor?", "O que significam os sintomas comuns de gripe?", "Quais são as bases de uma alimentação saudável?"],
    publicConsoleTitle: "Assistente de IA para o público",
    physicianMetaTitle: "IA clínica para médicos | MedScopeGlobal",
    physicianMetaDescription: "Guidelines, diagnóstico diferencial e estudos para o consultório.",
    physicianEyebrow: "Médicos",
    physicianTitle: "Assistente de IA clínica",
    physicianLead: "Respostas baseadas em evidência — guidelines, estudos, algoritmos.",
    physicianConsoleTitle: "Assistente de IA clínica",
    allAssistants: "← Todos os assistentes",
    queryLabel: "A sua pergunta",
    publicPlaceholder: "ex.: O que fazer com dor de cabeça? Como dormir melhor?",
    clinicalPlaceholder: "Pergunta clínica, pedido de síntese, panorama de estudos…",
    ask: "Perguntar",
    run: "Iniciar o assistente",
    loading: "A preparar a resposta…",
    answer: "Resposta",
    summary: "Resumo",
    recommendations: "Recomendações",
    conclusions: "Conclusões clínicas",
    graphic: "Resumo gráfico (texto)",
    sources: "Fontes da base",
    outputProfessional: "Profissional",
    outputPatient: "Paciente",
    phDiagnosis: "Diagnóstico (ra, psa, as…)",
    phStudy: "Tipo de estudo (rct, meta-analysis…)",
    phDrug: "Nome do medicamento",
    phLaw: "Categoria legislativa",
  },
};

export function getAiAssistantCopy(locale?: string | null): AiAssistantCopy {
  const pack = chromePack(locale);
  const copy = { ...PACK[pack], ...CONSOLE[pack] };
  if (isCzechSurface(locale)) return copy;
  return { ...copy, cards: copy.cards.filter((card) => card.href !== "/ai-asistent/student") };
}
