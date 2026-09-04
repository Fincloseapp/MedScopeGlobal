/**
 * /lekari/dokumentace marketing chrome + tutorial / QR panel.
 * Product name is OrdiZapis on every edition (catalog lockup).
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type DokumentaceValueProp = { title: string; text: string };
export type DokumentaceTutorialStep = {
  id: "nahrat" | "zpracovat" | "zkontrolovat";
  label: string;
  title: string;
  benefit: string;
};

export type DokumentaceCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  tagline: string;
  pitch: string;
  heroPrice: (clinic: string) => string;
  downloadQr: string;
  howItWorks: string;
  monthlyCta: (clinic: string) => string;
  verifiedOnly: string;
  offerEyebrow: string;
  offerTitle: (clinic: string) => string;
  offerBody: (physician: string, year: string) => string;
  offerItems: string[];
  startTrial: (clinic: string) => string;
  orPhysician: (physician: string) => string;
  stepsTitle: string;
  stepsLead: string;
  valueProps: DokumentaceValueProp[];
  barNote: (clinic: string) => string;
  showSubscribe: string;
  workspaceTitle: string;
  workspaceLead: string;
  workspaceCta: string;
  legalTitle: string;
  legal: string[];
  tutorialKicker: string;
  tutorialTitle: string;
  tutorialLead: string;
  tutorialBadge: string;
  tutorialSteps: DokumentaceTutorialStep[];
  recording: string;
  recordingHint: string;
  preparing: string;
  preparingItems: string[];
  preparingFoot: string;
  draftLabel: string;
  preview: string;
  teaser: { label: string; text: string; blur: boolean }[];
  teaserFoot: string;
  edit: string;
  approve: string;
  forPractice: string;
  forPracticeBody: string;
  protectKnowHow: string;
  protectKnowHowBody: string;
  tryInApp: string;
  accessNote: string;
  demoBadge: string;
  downloadKicker: string;
  downloadTitle: string;
  downloadPitch: string;
  checkingAccess: string;
  unlocked: string;
  openApp: string;
  downloadGate: string;
  signIn: string;
  verifyAccount: string;
  moreAbout: string;
  qrAlt: string;
  qrLinked: string;
  qrLogin: string;
  installHint: string;
  trialLine: string;
  facilitiesLabel: string;
};

type Pack = Omit<
  DokumentaceCopy,
  "heroPrice" | "monthlyCta" | "offerTitle" | "offerBody" | "startTrial" | "orPhysician" | "barNote"
> & {
  heroPrice: string;
  monthlyCta: string;
  offerTitle: string;
  offerBody: string;
  startTrial: string;
  orPhysician: string;
  barNote: string;
};

const PACK: Record<ChromePack, Pack> = {
  cs: {
    metaTitle: "OrdiZapis — AI zápisy a anamnéza pro lékaře | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: nahrávání v mobilu — diktát nebo konzultace → strukturovaný odborný zápis. 390 Kč/měsíc, 14 dní zdarma.",
    eyebrow: "Pro lékaře",
    tagline: "Nahrajte v mobilu — zápis píše OrdiZapis",
    pitch:
      "Nahrajte v telefonu diktát, nebo konzultaci s pacientem či pacientkou → odborná anamnéza a klinický zápis. Mikrofon má každý mobil.",
    heroPrice: "Samostatně {clinic}/měsíc včetně práv balíčku Lékař v praxi · 14 dní zdarma.",
    downloadQr: "Stáhnout přes QR",
    howItWorks: "Jak to funguje",
    monthlyCta: "{clinic} / měsíc",
    verifiedOnly: "Stažení jen pro ověřené lékaře — účet MedScopeGlobal",
    offerEyebrow: "Nejvýhodnější vstup pro ordinaci",
    offerTitle: "OrdiZapis standalone — {clinic}/měsíc",
    offerBody:
      "Levnější než Lékař v praxi ({physician}), se stejnými právy lékaře: guidelines, CME, klinický AI i historie zápisů (sync mobil ↔ web). Ročně {year} · 14 dní zdarma.",
    offerItems: [
      "Nahrávání v mobilu: diktát i konzultace",
      "Šablony ambulantní, SOAP, anamnéza…",
      "Celý balíček Lékař v praxi v ceně",
      "Historie v účtu — mobil i PC",
    ],
    startTrial: "Začít 14 dní zdarma — {clinic}",
    orPhysician: "Lékař v praxi za {physician}",
    stepsTitle: "Nahrajte · AI zpracuje · Hotovo",
    stepsLead:
      "V mobilu nahrajete diktát i konzultaci — šablony pro praxi a ephemeral audio, přizpůsobeno české dokumentaci.",
    valueProps: [
      {
        title: "Nahrávejte v mobilu",
        text: "Diktát po vyšetření, nebo přímo konzultaci — mikrofon má každý telefon.",
      },
      {
        title: "AI zpracuje",
        text: "Návrh odborné anamnézy a strukturovaného zápisu pro českou ordinaci.",
      },
      {
        title: "Hotovo ke kontrole",
        text: "Upravitelný zápis ke kopírování do NIS. Lékař vždy schvaluje finální znění.",
      },
      {
        title: "Souhlas a GDPR",
        text: "Při nahrávce rozhovoru informujte pacienta. Audio se po zpracování neukládá.",
      },
    ],
    barNote: "{clinic}/měsíc včetně celého balíčku Lékař · 14 dní trial · demo 3 zápisy/den po přihlášení",
    showSubscribe: "Zobrazit předplatné",
    workspaceTitle: "Pracovní prostor",
    workspaceLead: "Nahrajte diktát nebo konzultaci — návrh zápisu ke kontrole.",
    workspaceCta: "Otevřít OrdiZapis",
    legalTitle: "Právní rámec",
    legal: [
      "OrdiZapis od MedScopeGlobal je asistent pro lékaře — není zdravotnický prostředek ani diagnóza.",
      "Lékař odpovídá za kontrolu a schválení zápisu před uložením do zdravotnické dokumentace.",
      "Před nahráváním konzultace informujte pacienta. Režim diktátu probíhá bez pacienta.",
      "Audio se po zpracování neukládá (ephemeral). Textové zápisy jdou do vašeho účtu MedScopeGlobal.",
    ],
    tutorialKicker: "Jak to funguje · 60 sekund",
    tutorialTitle: "Od hlasu k zápisu — bez večerního přepisování",
    tutorialLead:
      "Tři kroky, které šetří čas v ordinaci. Ukázka je záměrně zjednodušená — plné šablony jsou až uvnitř aplikace pro ověřené lékaře.",
    tutorialBadge: "Méně administrativy · více času na pacienta",
    tutorialSteps: [
      {
        id: "nahrat",
        label: "1 · Nahrát",
        title: "Nahrajte v mobilu",
        benefit: "Diktát po vyšetření, nebo konzultaci — přímo v telefonu.",
      },
      {
        id: "zpracovat",
        label: "2 · Zpracovat",
        title: "AI připraví strukturu zápisu",
        benefit: "Místo přepisování dostanete návrh připravený pro českou ordinaci.",
      },
      {
        id: "zkontrolovat",
        label: "3 · Schválit",
        title: "Vy rozhodnete o finálním znění",
        benefit: "Upravíte, zkopírujete do NIS — odpovědnost zůstává u lékaře.",
      },
    ],
    recording: "Nahrávám v mobilu…",
    recordingHint: "Diktát i konzultace — bez ručního přepisu věty po větě.",
    preparing: "Připravuji zápis…",
    preparingItems: [
      "✓ Rozpoznání klinického kontextu",
      "✓ Návrh struktury pro ordinaci",
      "· detaily šablon jen v aplikaci",
    ],
    preparingFoot: "Interní zpracování nezveřejňujeme — chráníme kvalitu i praxi.",
    draftLabel: "Návrh zápisu",
    preview: "náhled",
    teaser: [
      { label: "Subj.", text: "Pacient popisuje únavu trvající …", blur: false },
      { label: "Obj.", text: "TK ·····  · TF ·····  · SpO₂ ·····", blur: true },
      { label: "Hodn.", text: "Pracovní diagnóza upravena dle …", blur: false },
      { label: "Plán", text: "Kontrola · medikace · poučení …", blur: true },
    ],
    teaserFoot: "Plné šablony a export — po přihlášení ověřeného lékaře.",
    edit: "Upravit",
    approve: "Schválit",
    forPractice: "Pro praxi",
    forPracticeBody: "Méně psaní po ambulanci, rychlejší uzavření dokumentace.",
    protectKnowHow: "Chráníme know-how",
    protectKnowHowBody: "Veřejná ukázka neobsahuje kompletní šablony ani nastavení AI.",
    tryInApp: "Vyzkoušet v aplikaci",
    accessNote:
      "Přístup a stažení jen pro ověřené lékaře · účet MedScopeGlobal synchronizuje historii",
    demoBadge: "Ukázka",
    downloadKicker: "Aplikace pro ověřené lékaře",
    downloadTitle: "Stáhnout OrdiZapis",
    downloadPitch: "Instalovatelná aplikace propojená s účtem MedScopeGlobal.",
    checkingAccess: "Ověřuji přístup…",
    unlocked: "stažení odemčeno",
    openApp: "Otevřít aplikaci",
    downloadGate: "Stažení je dostupné jen ověřeným lékařům. Přihlaste se a dokončete ověření.",
    signIn: "Přihlásit se",
    verifyAccount: "Ověřit lékařský účet",
    moreAbout: "Více o OrdiZapisu",
    qrAlt: "QR kód pro stažení OrdiZapis",
    qrLinked: "Naskenujte telefonem — odkaz je vázaný na váš účet",
    qrLogin: "Naskenujte a přihlaste se ověřeným lékařským účtem",
    installHint: "Android: Instalovat · iOS Safari: Sdílet → Na plochu",
    trialLine: "14 dní zdarma.",
    facilitiesLabel: "Zařízení",
  },
  de: {
    metaTitle: "OrdiZapis — KI-Notizen für die Praxis | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: Diktat oder Gespräch aufnehmen — strukturierte Anamnese und klinische Notiz. 14 Tage testen.",
    eyebrow: "Für Ärztinnen und Ärzte",
    tagline: "Am Handy aufnehmen — OrdiZapis schreibt die Notiz",
    pitch:
      "Diktat oder Gespräch aufnehmen → Anamnese und klinische Notiz. Jedes Telefon hat ein Mikrofon.",
    heroPrice: "Eigenständig {clinic}/Monat inkl. Rechte des Praxis-Tarifs · 14 Tage kostenlos.",
    downloadQr: "Per QR laden",
    howItWorks: "So funktioniert es",
    monthlyCta: "{clinic} / Monat",
    verifiedOnly: "Download nur für verifizierte Ärztinnen und Ärzte — MedScopeGlobal-Konto",
    offerEyebrow: "Günstigster Einstieg für die Praxis",
    offerTitle: "OrdiZapis standalone — {clinic}/Monat",
    offerBody:
      "Günstiger als der Praxis-Tarif ({physician}), mit denselben Rechten: Leitlinien, CME, klinische KI und Notizhistorie (Handy ↔ Web). Jährlich {year} · 14 Tage kostenlos.",
    offerItems: [
      "Aufnahme am Handy: Diktat und Gespräch",
      "Vorlagen ambulant, SOAP, Anamnese…",
      "Der ganze Praxis-Tarif ist enthalten",
      "Historie im Konto — Handy und PC",
    ],
    startTrial: "14 Tage kostenlos starten — {clinic}",
    orPhysician: "Praxis-Tarif für {physician}",
    stepsTitle: "Aufnehmen · KI arbeitet · Fertig",
    stepsLead: "Diktat oder Gespräch am Handy — Vorlagen für die Praxis, Audio bleibt ephemeral.",
    valueProps: [
      { title: "Am Handy aufnehmen", text: "Diktat nach der Untersuchung oder das Gespräch selbst — jedes Telefon reicht." },
      { title: "KI strukturiert", text: "Entwurf von Anamnese und klinischer Notiz für die Praxis — nicht für tschechische Kassenregeln." },
      { title: "Bereit zur Prüfung", text: "Bearbeiten und ins EHR kopieren. Die Ärztin oder der Arzt gibt die Fassung frei." },
      { title: "Einwilligung und DSGVO", text: "Beim Mitschnitt das Gegenüber informieren. Audio wird nach der Verarbeitung nicht gespeichert." },
    ],
    barNote: "{clinic}/Monat inkl. Praxis-Paket · 14 Tage Test · Demo 3 Notizen/Tag nach Login",
    showSubscribe: "Abo anzeigen",
    workspaceTitle: "Arbeitsbereich",
    workspaceLead:
      "Diktieren oder Gespräch aufnehmen — der Notizentwurf erscheint hier zur Prüfung.",
    workspaceCta: "OrdiZapis öffnen",
    legalTitle: "Rechtlicher Rahmen",
    legal: [
      "OrdiZapis von MedScopeGlobal ist ein Assistent — kein Medizinprodukt und keine Diagnose.",
      "Die Ärztin oder der Arzt prüft und gibt die Notiz frei, bevor sie in die Dokumentation geht.",
      "Vor der Aufnahme eines Gesprächs informieren. Diktat läuft ohne Patientin oder Patient.",
      "Audio bleibt ephemeral. Textnotizen liegen in Ihrem MedScopeGlobal-Konto.",
    ],
    tutorialKicker: "So funktioniert es · 60 Sekunden",
    tutorialTitle: "Von der Stimme zur Notiz — ohne Abtippen am Abend",
    tutorialLead:
      "Drei Schritte, die Zeit in der Praxis sparen. Die Demo ist bewusst knapp — volle Vorlagen erst in der App für verifizierte Konten.",
    tutorialBadge: "Weniger Verwaltung · mehr Zeit für Patientinnen und Patienten",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Aufnehmen", title: "Am Handy aufnehmen", benefit: "Diktat oder Gespräch — direkt im Telefon." },
      { id: "zpracovat", label: "2 · Struktur", title: "KI legt die Notiz an", benefit: "Statt Abtippen ein Entwurf für die Praxis." },
      { id: "zkontrolovat", label: "3 · Freigeben", title: "Sie entscheiden die Fassung", benefit: "Bearbeiten, ins EHR kopieren — die Verantwortung bleibt bei Ihnen." },
    ],
    recording: "Aufnahme läuft…",
    recordingHint: "Diktat und Gespräch — ohne Satz-für-Satz-Tipperei.",
    preparing: "Notiz wird vorbereitet…",
    preparingItems: ["✓ Klinischer Kontext", "✓ Struktur für die Praxis", "· Vorlagendetails nur in der App"],
    preparingFoot: "Interne Verarbeitung bleibt intern — Qualität und Praxis bleiben geschützt.",
    draftLabel: "Entwurf",
    preview: "Vorschau",
    teaser: [
      { label: "Subj.", text: "Die Person beschreibt anhaltende Müdigkeit …", blur: false },
      { label: "Obj.", text: "BP ·····  · HR ·····  · SpO₂ ·····", blur: true },
      { label: "Ass.", text: "Arbeitsdiagnose angepasst nach …", blur: false },
      { label: "Plan", text: "Kontrolle · Medikation · Aufklärung …", blur: true },
    ],
    teaserFoot: "Volle Vorlagen und Export — nach Login eines verifizierten Kontos.",
    edit: "Bearbeiten",
    approve: "Freigeben",
    forPractice: "Für die Praxis",
    forPracticeBody: "Weniger Schreiben nach der Sprechstunde, schnellere Dokumentation.",
    protectKnowHow: "Know-how bleibt intern",
    protectKnowHowBody: "Die öffentliche Demo zeigt keine kompletten Vorlagen und kein KI-Setup.",
    tryInApp: "In der App testen",
    accessNote: "Zugang und Download nur für verifizierte Ärztinnen und Ärzte · MedScopeGlobal synchronisiert die Historie",
    demoBadge: "Demo",
    downloadKicker: "App für verifizierte Ärztinnen und Ärzte",
    downloadTitle: "OrdiZapis laden",
    downloadPitch: "Installierbare App, verbunden mit dem MedScopeGlobal-Konto.",
    checkingAccess: "Zugang wird geprüft…",
    unlocked: "Download freigeschaltet",
    openApp: "App öffnen",
    downloadGate: "Der Download ist nur für verifizierte Konten. Bitte anmelden und die Prüfung abschließen.",
    signIn: "Anmelden",
    verifyAccount: "Arztkonto prüfen",
    moreAbout: "Mehr zu OrdiZapis",
    qrAlt: "QR-Code zum Laden von OrdiZapis",
    qrLinked: "Mit dem Telefon scannen — der Link gehört zu Ihrem Konto",
    qrLogin: "Scannen und mit einem verifizierten Konto anmelden",
    installHint: "Android: Installieren · iOS Safari: Teilen → Zum Home-Bildschirm",
    trialLine: "14 Tage kostenlos.",
    facilitiesLabel: "Einrichtung",
  },
  fr: {
    metaTitle: "OrdiZapis — Notes IA pour le cabinet | MedScopeGlobal",
    metaDescription:
      "OrdiZapis : dictez ou enregistrez une consultation — anamnèse et note clinique. 14 jours d’essai.",
    eyebrow: "Pour les médecins",
    tagline: "Enregistrez sur mobile — OrdiZapis rédige la note",
    pitch:
      "Dictez ou enregistrez une consultation → anamnèse et note clinique. Chaque téléphone a un micro.",
    heroPrice: "Autonome {clinic}/mois, avec les droits de l’offre médecin en exercice · 14 jours gratuits.",
    downloadQr: "Télécharger via QR",
    howItWorks: "Comment ça marche",
    monthlyCta: "{clinic} / mois",
    verifiedOnly: "Téléchargement réservé aux médecins vérifiés — compte MedScopeGlobal",
    offerEyebrow: "L’entrée la plus avantageuse pour le cabinet",
    offerTitle: "OrdiZapis standalone — {clinic}/mois",
    offerBody:
      "Moins cher que l’offre médecin en exercice ({physician}), avec les mêmes droits : recommandations, FMC, IA clinique et historique (mobile ↔ web). {year} / an · 14 jours gratuits.",
    offerItems: [
      "Enregistrement mobile : dictée et consultation",
      "Modèles ambulatoires, SOAP, anamnèse…",
      "Toute l’offre médecin en exercice incluse",
      "Historique dans le compte — mobile et PC",
    ],
    startTrial: "Commencer 14 jours gratuits — {clinic}",
    orPhysician: "Offre médecin en exercice à {physician}",
    stepsTitle: "Enregistrez · l’IA structure · c’est prêt",
    stepsLead: "Dictée ou consultation sur mobile — modèles pour le cabinet, audio éphémère.",
    valueProps: [
      { title: "Enregistrez sur mobile", text: "Dictée après la consultation, ou la consultation elle-même — un téléphone suffit." },
      { title: "L’IA structure", text: "Brouillon d’anamnèse et de note clinique pour le cabinet — pas les règles tchèques." },
      { title: "Prêt à relire", text: "Modifiez et copiez dans le DPI. Le médecin valide la version finale." },
      { title: "Consentement et RGPD", text: "Informez la personne enregistrée. L’audio n’est pas conservé après traitement." },
    ],
    barNote: "{clinic}/mois avec l’offre médecin · 14 jours d’essai · démo 3 notes/jour après connexion",
    showSubscribe: "Voir l’abonnement",
    workspaceTitle: "Espace de travail",
    workspaceLead:
      "Dictez ou enregistrez une consultation — le brouillon de note s’affiche ici pour relecture.",
    workspaceCta: "Ouvrir OrdiZapis",
    legalTitle: "Cadre juridique",
    legal: [
      "OrdiZapis (MedScopeGlobal) est un assistant — pas un dispositif médical ni un diagnostic.",
      "Le médecin relit et valide la note avant de l’intégrer au dossier.",
      "Informez la personne avant d’enregistrer une consultation. La dictée se fait sans elle.",
      "L’audio reste éphémère. Les notes texte vont dans votre compte MedScopeGlobal.",
    ],
    tutorialKicker: "Comment ça marche · 60 secondes",
    tutorialTitle: "De la voix à la note — sans retaper le soir",
    tutorialLead:
      "Trois étapes qui gagnent du temps au cabinet. La démo est volontairement courte — les modèles complets sont dans l’app, pour les comptes vérifiés.",
    tutorialBadge: "Moins d’administratif · plus de temps pour les patients",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Enregistrer", title: "Enregistrez sur mobile", benefit: "Dictée ou consultation — directement sur le téléphone." },
      { id: "zpracovat", label: "2 · Structurer", title: "L’IA prépare la note", benefit: "Un brouillon pour le cabinet, pas une saisie ligne à ligne." },
      { id: "zkontrolovat", label: "3 · Valider", title: "Vous tranchez la version", benefit: "Modifiez, copiez dans le DPI — la responsabilité reste la vôtre." },
    ],
    recording: "Enregistrement en cours…",
    recordingHint: "Dictée et consultation — sans retaper phrase par phrase.",
    preparing: "Préparation de la note…",
    preparingItems: ["✓ Contexte clinique", "✓ Structure pour le cabinet", "· détails des modèles dans l’app"],
    preparingFoot: "Le traitement interne reste interne — qualité et cabinet restent protégés.",
    draftLabel: "Brouillon",
    preview: "aperçu",
    teaser: [
      { label: "Subj.", text: "La personne décrit une fatigue persistante …", blur: false },
      { label: "Obj.", text: "TA ·····  · FC ·····  · SpO₂ ·····", blur: true },
      { label: "Hyp.", text: "Hypothèse de travail ajustée selon …", blur: false },
      { label: "Plan", text: "Contrôle · traitement · conseils …", blur: true },
    ],
    teaserFoot: "Modèles complets et export — après connexion d’un compte vérifié.",
    edit: "Modifier",
    approve: "Valider",
    forPractice: "Pour le cabinet",
    forPracticeBody: "Moins d’écriture après la vacation, clôture plus rapide du dossier.",
    protectKnowHow: "Le savoir-faire reste interne",
    protectKnowHowBody: "La démo publique n’expose ni les modèles complets ni le réglage de l’IA.",
    tryInApp: "Essayer dans l’app",
    accessNote: "Accès et téléchargement réservés aux médecins vérifiés · MedScopeGlobal synchronise l’historique",
    demoBadge: "Démo",
    downloadKicker: "App pour médecins vérifiés",
    downloadTitle: "Télécharger OrdiZapis",
    downloadPitch: "Application installable, liée au compte MedScopeGlobal.",
    checkingAccess: "Vérification de l’accès…",
    unlocked: "téléchargement débloqué",
    openApp: "Ouvrir l’application",
    downloadGate: "Le téléchargement est réservé aux comptes vérifiés. Connectez-vous et terminez la vérification.",
    signIn: "Se connecter",
    verifyAccount: "Vérifier le compte médecin",
    moreAbout: "En savoir plus sur OrdiZapis",
    qrAlt: "QR code pour télécharger OrdiZapis",
    qrLinked: "Scannez avec le téléphone — le lien est lié à votre compte",
    qrLogin: "Scannez et connectez-vous avec un compte médecin vérifié",
    installHint: "Android : Installer · iOS Safari : Partager → Sur l’écran d’accueil",
    trialLine: "14 jours gratuits.",
    facilitiesLabel: "Établissement",
  },
  it: {
    metaTitle: "OrdiZapis — Note IA per lo studio | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dettate o registrate una visita — anamnesi e nota clinica. 14 giorni di prova.",
    eyebrow: "Per i medici",
    tagline: "Registrate sul telefono — OrdiZapis scrive la nota",
    pitch:
      "Dettate o registrate una visita → anamnesi e nota clinica. Ogni telefono ha un microfono.",
    heroPrice: "Standalone {clinic}/mese, con i diritti del piano medico in pratica · 14 giorni gratis.",
    downloadQr: "Scarica con QR",
    howItWorks: "Come funziona",
    monthlyCta: "{clinic} / mese",
    verifiedOnly: "Download solo per medici verificati — account MedScopeGlobal",
    offerEyebrow: "L’ingresso più conveniente per lo studio",
    offerTitle: "OrdiZapis standalone — {clinic}/mese",
    offerBody:
      "Meno del piano medico in pratica ({physician}), con gli stessi diritti: linee guida, ECM, IA clinica e storico (mobile ↔ web). {year} / anno · 14 giorni gratis.",
    offerItems: [
      "Registrazione sul telefono: detta e visita",
      "Modelli ambulatoriali, SOAP, anamnesi…",
      "Tutto il piano medico in pratica incluso",
      "Storico nell’account — telefono e PC",
    ],
    startTrial: "Inizia 14 giorni gratis — {clinic}",
    orPhysician: "Piano medico in pratica a {physician}",
    stepsTitle: "Registra · l’IA struttura · fatto",
    stepsLead: "Detta o visita sul telefono — modelli per lo studio, audio effimero.",
    valueProps: [
      { title: "Registrate sul telefono", text: "Detta dopo la visita, o la visita stessa — basta un telefono." },
      { title: "L’IA struttura", text: "Bozza di anamnesi e nota clinica per lo studio — non le regole ceche." },
      { title: "Pronta da rileggere", text: "Modificate e copiate nel cartella clinica. Il medico approva la versione finale." },
      { title: "Consenso e GDPR", text: "Informate la persona registrata. L’audio non resta dopo l’elaborazione." },
    ],
    barNote: "{clinic}/mese con il piano medico · 14 giorni di prova · demo 3 note/giorno dopo l’accesso",
    showSubscribe: "Vedi l’abbonamento",
    workspaceTitle: "Area di lavoro",
    workspaceLead:
      "Detta o registra una visita — la bozza della nota compare qui per il controllo.",
    workspaceCta: "Apri OrdiZapis",
    legalTitle: "Quadro giuridico",
    legal: [
      "OrdiZapis (MedScopeGlobal) è un assistente — non un dispositivo medico né una diagnosi.",
      "Il medico rilegge e approva la nota prima di inserirla in documentazione.",
      "Informate la persona prima di registrare una visita. La detta avviene senza di lei.",
      "L’audio resta effimero. Le note testo vanno nel vostro account MedScopeGlobal.",
    ],
    tutorialKicker: "Come funziona · 60 secondi",
    tutorialTitle: "Dalla voce alla nota — senza ribattere la sera",
    tutorialLead:
      "Tre passi che fanno risparmiare tempo in ambulatorio. La demo è volutamente breve — i modelli completi sono nell’app, per gli account verificati.",
    tutorialBadge: "Meno burocrazia · più tempo per i pazienti",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Registra", title: "Registrate sul telefono", benefit: "Detta o visita — direttamente sul telefono." },
      { id: "zpracovat", label: "2 · Struttura", title: "L’IA prepara la nota", benefit: "Una bozza per lo studio, non una battitura riga per riga." },
      { id: "zkontrolovat", label: "3 · Approva", title: "Voi decidete la versione", benefit: "Modificate, copiate nel fascicolo — la responsabilità resta vostra." },
    ],
    recording: "Registrazione in corso…",
    recordingHint: "Detta e visita — senza ribattere frase per frase.",
    preparing: "Preparazione della nota…",
    preparingItems: ["✓ Contesto clinico", "✓ Struttura per lo studio", "· dettagli dei modelli solo nell’app"],
    preparingFoot: "L’elaborazione interna resta interna — qualità e studio restano protetti.",
    draftLabel: "Bozza",
    preview: "anteprima",
    teaser: [
      { label: "Subj.", text: "La persona descrive una stanchezza persistente …", blur: false },
      { label: "Obj.", text: "PA ·····  · FC ·····  · SpO₂ ·····", blur: true },
      { label: "Val.", text: "Ipotesi di lavoro aggiornata secondo …", blur: false },
      { label: "Piano", text: "Controllo · terapia · consigli …", blur: true },
    ],
    teaserFoot: "Modelli completi ed export — dopo l’accesso di un account verificato.",
    edit: "Modifica",
    approve: "Approva",
    forPractice: "Per lo studio",
    forPracticeBody: "Meno scrittura dopo l’ambulatorio, chiusura più rapida della documentazione.",
    protectKnowHow: "Il know-how resta interno",
    protectKnowHowBody: "La demo pubblica non mostra modelli completi né la configurazione IA.",
    tryInApp: "Prova nell’app",
    accessNote: "Accesso e download solo per medici verificati · MedScopeGlobal sincronizza lo storico",
    demoBadge: "Demo",
    downloadKicker: "App per medici verificati",
    downloadTitle: "Scarica OrdiZapis",
    downloadPitch: "App installabile, collegata all’account MedScopeGlobal.",
    checkingAccess: "Verifica dell’accesso…",
    unlocked: "download sbloccato",
    openApp: "Apri l’app",
    downloadGate: "Il download è riservato agli account verificati. Accedete e completate la verifica.",
    signIn: "Accedi",
    verifyAccount: "Verifica l’account medico",
    moreAbout: "Di più su OrdiZapis",
    qrAlt: "QR per scaricare OrdiZapis",
    qrLinked: "Inquadrate con il telefono — il link è legato al vostro account",
    qrLogin: "Inquadrate e accedete con un account medico verificato",
    installHint: "Android: Installa · iOS Safari: Condividi → Alla schermata Home",
    trialLine: "14 giorni gratis.",
    facilitiesLabel: "Struttura",
  },
  es: {
    metaTitle: "OrdiZapis — Notas con IA para la consulta | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dicte o grabe una consulta — anamnesis y nota clínica. 14 días de prueba.",
    eyebrow: "Para médicos",
    tagline: "Grabe en el móvil — OrdiZapis escribe la nota",
    pitch:
      "Dicte o grabe una consulta → anamnesis y nota clínica. Cualquier teléfono tiene micrófono.",
    heroPrice: "Independiente {clinic}/mes, con los derechos del plan de médico en ejercicio · 14 días gratis.",
    downloadQr: "Descargar con QR",
    howItWorks: "Cómo funciona",
    monthlyCta: "{clinic} / mes",
    verifiedOnly: "Descarga solo para médicos verificados — cuenta MedScopeGlobal",
    offerEyebrow: "La entrada más ventajosa para la consulta",
    offerTitle: "OrdiZapis standalone — {clinic}/mes",
    offerBody:
      "Más barato que el plan de médico en ejercicio ({physician}), con los mismos derechos: guías, FMC, IA clínica e historial (móvil ↔ web). {year} / año · 14 días gratis.",
    offerItems: [
      "Grabación en el móvil: dictado y consulta",
      "Plantillas ambulatorias, SOAP, anamnesis…",
      "Todo el plan de médico en ejercicio incluido",
      "Historial en la cuenta — móvil y PC",
    ],
    startTrial: "Empezar 14 días gratis — {clinic}",
    orPhysician: "Plan de médico en ejercicio por {physician}",
    stepsTitle: "Grabe · la IA estructura · listo",
    stepsLead: "Dictado o consulta en el móvil — plantillas para la consulta, audio efímero.",
    valueProps: [
      { title: "Grabe en el móvil", text: "Dictado tras la visita, o la visita misma — basta un teléfono." },
      { title: "La IA estructura", text: "Borrador de anamnesis y nota clínica para la consulta — no las normas checas." },
      { title: "Listo para revisar", text: "Edite y copie a la HCE. El médico aprueba la versión final." },
      { title: "Consentimiento y RGPD", text: "Informe a quien grabe. El audio no se guarda tras el procesado." },
    ],
    barNote: "{clinic}/mes con el plan médico · 14 días de prueba · demo 3 notas/día tras iniciar sesión",
    showSubscribe: "Ver la suscripción",
    workspaceTitle: "Espacio de trabajo",
    workspaceLead:
      "Dicte o grabe una consulta — el borrador de la nota aparece aquí para revisarlo.",
    workspaceCta: "Abrir OrdiZapis",
    legalTitle: "Marco legal",
    legal: [
      "OrdiZapis (MedScopeGlobal) es un asistente — no un producto sanitario ni un diagnóstico.",
      "El médico revisa y aprueba la nota antes de incorporarla a la documentación.",
      "Informe a la persona antes de grabar una consulta. El dictado se hace sin ella.",
      "El audio es efímero. Las notas de texto van a su cuenta MedScopeGlobal.",
    ],
    tutorialKicker: "Cómo funciona · 60 segundos",
    tutorialTitle: "De la voz a la nota — sin teclear por la noche",
    tutorialLead:
      "Tres pasos que ahorran tiempo en consulta. La demo es deliberadamente breve — las plantillas completas están en la app, para cuentas verificadas.",
    tutorialBadge: "Menos administración · más tiempo para los pacientes",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Grabar", title: "Grabe en el móvil", benefit: "Dictado o consulta — en el teléfono." },
      { id: "zpracovat", label: "2 · Estructurar", title: "La IA prepara la nota", benefit: "Un borrador para la consulta, no un tecleo línea a línea." },
      { id: "zkontrolovat", label: "3 · Aprobar", title: "Usted decide la versión", benefit: "Edite, copie a la HCE — la responsabilidad es suya." },
    ],
    recording: "Grabando…",
    recordingHint: "Dictado y consulta — sin teclear frase a frase.",
    preparing: "Preparando la nota…",
    preparingItems: ["✓ Contexto clínico", "✓ Estructura para la consulta", "· detalles de plantillas solo en la app"],
    preparingFoot: "El procesado interno se queda interno — calidad y consulta protegidas.",
    draftLabel: "Borrador",
    preview: "vista previa",
    teaser: [
      { label: "Subj.", text: "La persona describe un cansancio persistente …", blur: false },
      { label: "Obj.", text: "TA ·····  · FC ·····  · SpO₂ ·····", blur: true },
      { label: "Val.", text: "Hipótesis de trabajo ajustada según …", blur: false },
      { label: "Plan", text: "Control · medicación · consejos …", blur: true },
    ],
    teaserFoot: "Plantillas completas y exportación — tras iniciar sesión con una cuenta verificada.",
    edit: "Editar",
    approve: "Aprobar",
    forPractice: "Para la consulta",
    forPracticeBody: "Menos escritura tras la agenda, cierre más rápido de la documentación.",
    protectKnowHow: "El know-how se queda dentro",
    protectKnowHowBody: "La demo pública no muestra plantillas completas ni el ajuste de la IA.",
    tryInApp: "Probar en la app",
    accessNote: "Acceso y descarga solo para médicos verificados · MedScopeGlobal sincroniza el historial",
    demoBadge: "Demo",
    downloadKicker: "App para médicos verificados",
    downloadTitle: "Descargar OrdiZapis",
    downloadPitch: "App instalable, ligada a la cuenta MedScopeGlobal.",
    checkingAccess: "Comprobando el acceso…",
    unlocked: "descarga desbloqueada",
    openApp: "Abrir la app",
    downloadGate: "La descarga es solo para cuentas verificadas. Inicie sesión y termine la verificación.",
    signIn: "Iniciar sesión",
    verifyAccount: "Verificar la cuenta médica",
    moreAbout: "Más sobre OrdiZapis",
    qrAlt: "QR para descargar OrdiZapis",
    qrLinked: "Escanee con el teléfono — el enlace está ligado a su cuenta",
    qrLogin: "Escanee e inicie sesión con una cuenta médica verificada",
    installHint: "Android: Instalar · iOS Safari: Compartir → En la pantalla de inicio",
    trialLine: "14 días gratis.",
    facilitiesLabel: "Centro",
  },
  "pt-BR": {
    metaTitle: "OrdiZapis — Notas com IA para o consultório | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dite ou grave uma consulta — anamnese e nota clínica. 14 dias grátis.",
    eyebrow: "Para médicos",
    tagline: "Grave no celular — o OrdiZapis escreve a nota",
    pitch:
      "Dite ou grave uma consulta → anamnese e nota clínica. Qualquer celular tem microfone.",
    heroPrice: "Avulso {clinic}/mês, com os direitos do plano médico em prática · 14 dias grátis.",
    downloadQr: "Baixar pelo QR",
    howItWorks: "Como funciona",
    monthlyCta: "{clinic} / mês",
    verifiedOnly: "Download só para médicos verificados — conta MedScopeGlobal",
    offerEyebrow: "A entrada mais vantajosa para o consultório",
    offerTitle: "OrdiZapis standalone — {clinic}/mês",
    offerBody:
      "Mais barato que o plano médico em prática ({physician}), com os mesmos direitos: diretrizes, educação continuada, IA clínica e histórico (celular ↔ web). {year} / ano · 14 dias grátis.",
    offerItems: [
      "Gravação no celular: ditado e consulta",
      "Modelos ambulatoriais, SOAP, anamnese…",
      "Todo o plano médico em prática incluído",
      "Histórico na conta — celular e PC",
    ],
    startTrial: "Começar 14 dias grátis — {clinic}",
    orPhysician: "Plano médico em prática por {physician}",
    stepsTitle: "Grave · a IA estrutura · pronto",
    stepsLead: "Ditado ou consulta no celular — modelos para o consultório, áudio efêmero.",
    valueProps: [
      { title: "Grave no celular", text: "Ditado depois da consulta, ou a própria consulta — um telefone basta." },
      { title: "A IA estrutura", text: "Rascunho de anamnese e nota clínica para o consultório — sem regras tchecas." },
      { title: "Pronto para revisar", text: "Edite e copie para o prontuário. O médico aprova a versão final." },
      { title: "Consentimento e GDPR", text: "Informe quem for gravado. O áudio não fica guardado depois do processamento." },
    ],
    barNote: "{clinic}/mês com o plano médico · 14 dias de teste · demo 3 notas/dia após o login",
    showSubscribe: "Ver a assinatura",
    workspaceTitle: "Área de trabalho",
    workspaceLead:
      "Dite ou grave uma consulta — o rascunho da nota aparece aqui para rever.",
    workspaceCta: "Abrir o OrdiZapis",
    legalTitle: "Quadro jurídico",
    legal: [
      "O OrdiZapis (MedScopeGlobal) é um assistente — não é dispositivo médico nem diagnóstico.",
      "O médico revisa e aprova a nota antes de colocá-la na documentação.",
      "Informe a pessoa antes de gravar uma consulta. O ditado acontece sem ela.",
      "O áudio é efêmero. As notas de texto vão para a sua conta MedScopeGlobal.",
    ],
    tutorialKicker: "Como funciona · 60 segundos",
    tutorialTitle: "Da voz à nota — sem redigitar à noite",
    tutorialLead:
      "Três passos que poupam tempo no consultório. A demo é de propósito curta — os modelos completos ficam no app, para contas verificadas.",
    tutorialBadge: "Menos burocracia · mais tempo para os pacientes",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Gravar", title: "Grave no celular", benefit: "Ditado ou consulta — no telefone." },
      { id: "zpracovat", label: "2 · Estruturar", title: "A IA prepara a nota", benefit: "Um rascunho para o consultório, não uma digitação linha a linha." },
      { id: "zkontrolovat", label: "3 · Aprovar", title: "Você decide a versão", benefit: "Edite, copie para o prontuário — a responsabilidade é sua." },
    ],
    recording: "Gravando…",
    recordingHint: "Ditado e consulta — sem redigitar frase por frase.",
    preparing: "Preparando a nota…",
    preparingItems: ["✓ Contexto clínico", "✓ Estrutura para o consultório", "· detalhes dos modelos só no app"],
    preparingFoot: "O processamento interno fica interno — qualidade e consultório protegidos.",
    draftLabel: "Rascunho",
    preview: "prévia",
    teaser: [
      { label: "Subj.", text: "A pessoa descreve um cansaço persistente …", blur: false },
      { label: "Obj.", text: "PA ·····  · FC ·····  · SpO₂ ·····", blur: true },
      { label: "Aval.", text: "Hipótese de trabalho ajustada conforme …", blur: false },
      { label: "Plano", text: "Controle · medicação · orientação …", blur: true },
    ],
    teaserFoot: "Modelos completos e exportação — após o login de uma conta verificada.",
    edit: "Editar",
    approve: "Aprovar",
    forPractice: "Para o consultório",
    forPracticeBody: "Menos escrita depois do expediente, fechamento mais rápido da documentação.",
    protectKnowHow: "O know-how fica interno",
    protectKnowHowBody: "A demo pública não mostra modelos completos nem o ajuste da IA.",
    tryInApp: "Experimentar no app",
    accessNote: "Acesso e download só para médicos verificados · a MedScopeGlobal sincroniza o histórico",
    demoBadge: "Demo",
    downloadKicker: "App para médicos verificados",
    downloadTitle: "Baixar o OrdiZapis",
    downloadPitch: "App instalável, ligado à conta MedScopeGlobal.",
    checkingAccess: "Verificando o acesso…",
    unlocked: "download liberado",
    openApp: "Abrir o app",
    downloadGate: "O download é só para contas verificadas. Entre e conclua a verificação.",
    signIn: "Entrar",
    verifyAccount: "Verificar a conta médica",
    moreAbout: "Mais sobre o OrdiZapis",
    qrAlt: "QR para baixar o OrdiZapis",
    qrLinked: "Escaneie com o telefone — o link está ligado à sua conta",
    qrLogin: "Escaneie e entre com uma conta médica verificada",
    installHint: "Android: Instalar · iOS Safari: Compartilhar → Na Tela de Início",
    trialLine: "14 dias grátis.",
    facilitiesLabel: "Unidade",
  },
  en: {
    metaTitle: "OrdiZapis — AI notes for the clinic | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: record a dictation or consult — structured history and clinical note. 14-day trial.",
    eyebrow: "For physicians",
    tagline: "Record on your phone — OrdiZapis writes the note",
    pitch:
      "Record a dictation or consult → history and clinical note. Every phone has a microphone.",
    heroPrice: "Standalone {clinic}/month, with practicing-physician rights · 14 days free.",
    downloadQr: "Download via QR",
    howItWorks: "How it works",
    monthlyCta: "{clinic} / month",
    verifiedOnly: "Download for verified physicians only — MedScopeGlobal account",
    offerEyebrow: "The leanest entry for the clinic",
    offerTitle: "OrdiZapis standalone — {clinic}/month",
    offerBody:
      "Less than the practicing-physician plan ({physician}), with the same rights: guidelines, CME, clinical AI, and note history (phone ↔ web). {year} / year · 14 days free.",
    offerItems: [
      "Phone recording: dictation and consult",
      "Outpatient, SOAP, and history templates…",
      "The full practicing-physician bundle included",
      "History in the account — phone and PC",
    ],
    startTrial: "Start 14 days free — {clinic}",
    orPhysician: "Practicing-physician plan at {physician}",
    stepsTitle: "Record · AI structures · done",
    stepsLead: "Dictation or consult on the phone — clinic templates, ephemeral audio.",
    valueProps: [
      { title: "Record on your phone", text: "Dictate after the visit, or record the consult itself — any phone works." },
      { title: "AI structures it", text: "A draft history and clinical note for the clinic — not Czech insurance rules." },
      { title: "Ready to review", text: "Edit and copy into the EHR. The clinician signs off the final wording." },
      { title: "Consent and GDPR", text: "Tell the person you are recording. Audio is not stored after processing." },
    ],
    barNote: "{clinic}/month with the physician bundle · 14-day trial · demo 3 notes/day after sign-in",
    showSubscribe: "View subscription",
    workspaceTitle: "Workspace",
    workspaceLead:
      "Dictate or record a consult — the draft note appears here for review.",
    workspaceCta: "Open OrdiZapis",
    legalTitle: "Legal frame",
    legal: [
      "OrdiZapis from MedScopeGlobal is an assistant — not a medical device and not a diagnosis.",
      "The clinician reviews and approves the note before it enters the record.",
      "Inform the person before recording a consult. Dictation runs without them.",
      "Audio stays ephemeral. Text notes go to your MedScopeGlobal account.",
    ],
    tutorialKicker: "How it works · 60 seconds",
    tutorialTitle: "From voice to note — no evening retyping",
    tutorialLead:
      "Three steps that save time in clinic. The demo is deliberately short — full templates live in the app, for verified accounts.",
    tutorialBadge: "Less admin · more time with patients",
    tutorialSteps: [
      { id: "nahrat", label: "1 · Record", title: "Record on your phone", benefit: "Dictation or consult — on the phone." },
      { id: "zpracovat", label: "2 · Structure", title: "AI drafts the note", benefit: "A clinic-ready draft instead of line-by-line typing." },
      { id: "zkontrolovat", label: "3 · Approve", title: "You decide the wording", benefit: "Edit, copy into the EHR — responsibility stays with you." },
    ],
    recording: "Recording…",
    recordingHint: "Dictation and consult — no sentence-by-sentence retyping.",
    preparing: "Preparing the note…",
    preparingItems: ["✓ Clinical context", "✓ Structure for the clinic", "· template detail only in the app"],
    preparingFoot: "Internal processing stays internal — quality and the clinic stay protected.",
    draftLabel: "Draft note",
    preview: "preview",
    teaser: [
      { label: "Subj.", text: "The person describes lasting fatigue …", blur: false },
      { label: "Obj.", text: "BP ·····  · HR ·····  · SpO₂ ·····", blur: true },
      { label: "Ass.", text: "Working diagnosis updated after …", blur: false },
      { label: "Plan", text: "Follow-up · medication · advice …", blur: true },
    ],
    teaserFoot: "Full templates and export — after a verified physician signs in.",
    edit: "Edit",
    approve: "Approve",
    forPractice: "For the clinic",
    forPracticeBody: "Less writing after clinic, faster close of the note.",
    protectKnowHow: "Know-how stays inside",
    protectKnowHowBody: "The public demo does not show complete templates or the AI setup.",
    tryInApp: "Try it in the app",
    accessNote: "Access and download for verified physicians · MedScopeGlobal syncs history",
    demoBadge: "Demo",
    downloadKicker: "App for verified physicians",
    downloadTitle: "Download OrdiZapis",
    downloadPitch: "Installable app, tied to the MedScopeGlobal account.",
    checkingAccess: "Checking access…",
    unlocked: "download unlocked",
    openApp: "Open the app",
    downloadGate: "Download is for verified physician accounts. Sign in and finish verification.",
    signIn: "Sign in",
    verifyAccount: "Verify physician account",
    moreAbout: "More about OrdiZapis",
    qrAlt: "QR code to download OrdiZapis",
    qrLinked: "Scan with your phone — the link is tied to your account",
    qrLogin: "Scan and sign in with a verified physician account",
    installHint: "Android: Install · iOS Safari: Share → Add to Home Screen",
    trialLine: "14 days free.",
    facilitiesLabel: "Facility",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function getDokumentaceCopy(locale?: string | null): DokumentaceCopy {
  const raw = PACK[chromePack(locale)];
  return {
    ...raw,
    heroPrice: (clinic) => fill(raw.heroPrice, { clinic }),
    monthlyCta: (clinic) => fill(raw.monthlyCta, { clinic }),
    offerTitle: (clinic) => fill(raw.offerTitle, { clinic }),
    offerBody: (physician, year) => fill(raw.offerBody, { physician, year }),
    startTrial: (clinic) => fill(raw.startTrial, { clinic }),
    orPhysician: (physician) => fill(raw.orPhysician, { physician }),
    barNote: (clinic) => fill(raw.barNote, { clinic }),
  };
}
