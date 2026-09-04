/**
 * OrdiZapis PWA chrome (shell, gate, guide, history).
 * Clinical note language lives in lib/lekari/dokumentace/note-language.ts.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export type OrdiZapisAppCopy = {
  tabNote: string;
  tabHistory: string;
  tabGuide: string;
  tabAccount: string;
  signIn: string;
  loading: string;
  sectionsAria: string;
  gateTitle: string;
  gateLogin: string;
  gateVerify: string;
  gateMore: string;
  gateDefault: string;
  qrHint: string;
  qrHintShort: string;
  hostLabel: string;
  needLogin: string;
  networkFail: string;
  guideTitle: string;
  guideLead: string;
  guideSteps: { title: string; text: string }[];
  micHelpTitle: string;
  micHelp: string[];
  legalTitle: string;
  legal: string[];
  marketing: string;
  historyTitle: string;
  historyLogin: string;
  historyEmpty: string;
  historyError: string;
  historyNetwork: string;
  copyFail: string;
  consent: string;
  dictate: string;
  upload: string;
  myNotes: string;
  history: string;
  hide: string;
  ready: string;
  recording: string;
  processing: string;
  pause: string;
  resume: string;
  recordConsult: string;
  template: string;
  specialtyPh: string;
  noteTitle: string;
  notePh: string;
  remaining: string;
  emptyNote: string;
  remainingToday: string;
  savedSync: string;
  mode: string;
  specialty: string;
  allowMic: string;
  micOn: string;
  howTo: string;
  stopProcess: string;
  dictateStep: string;
  consultStep: string;
  consentLong: string;
  transcript: string;
  copied: string;
  saved: string;
  legalFooter: string;
  copyBtn: string;
  shareBtn: string;
  refresh: string;
  signInBtn: string;
  processingHint: string;
  paused: string;
  installGated: string;
  installApp: string;
  installed: string;
  iosShare: string;
  accessLabel: string;
  validityLabel: string;
  subscribeCta: string;
  accountAria: string;
  physicianFallback: string;
  planVip: string;
  planBasic: string;
  notSignedIn: string;
  signInLead: string;
  validityAfterLogin: string;
  verifiedLinked: string;
  signOut: string;
  verifyAccount: string;
  subscribeOrdi: string;
  installTitle: string;
  installLead: string;
  backToMarketing: string;
  loadingAccount: string;
  statusLabel: string;
  online: string;
  offline: string;
  errConsent: string;
  errEmptyRec: string;
  errTooLarge: string;
  errNeedLogin: string;
  errServerHttp: string;
  errUnexpectedHttp: string;
  errStructure: string;
  errStructureRetry: string;
  errProcessRec: string;
  errProcessFile: string;
  errCopy: string;
  errNothingToCopy: string;
  errMicBlocked: string;
  errMicMissing: string;
  errMicGeneric: string;
  errConsentMic: string;
  errFileTooBig: string;
  errUploadConn: string;
  errSegmentTooBig: string;
  errSegmentFailed: string;
  errSegmentEmpty: string;
  errEmptyFile: string;
  errTranscribe: string;
  errEmptyTranscript: string;
  noteShareTitle: string;
};

type OrdiZapisChromeCopy = Omit<
  OrdiZapisAppCopy,
  | "accessLabel"
  | "validityLabel"
  | "subscribeCta"
  | "accountAria"
  | "physicianFallback"
  | "planVip"
  | "planBasic"
  | "notSignedIn"
  | "signInLead"
  | "validityAfterLogin"
  | "verifiedLinked"
  | "signOut"
  | "verifyAccount"
  | "subscribeOrdi"
  | "installTitle"
  | "installLead"
  | "backToMarketing"
  | "loadingAccount"
  | "statusLabel"
  | "online"
  | "offline"
  | "errConsent"
  | "errEmptyRec"
  | "errTooLarge"
  | "errNeedLogin"
  | "errServerHttp"
  | "errUnexpectedHttp"
  | "errStructure"
  | "errStructureRetry"
  | "errProcessRec"
  | "errProcessFile"
  | "errCopy"
  | "errNothingToCopy"
  | "errMicBlocked"
  | "errMicMissing"
  | "errMicGeneric"
  | "errConsentMic"
  | "errFileTooBig"
  | "errUploadConn"
  | "errSegmentTooBig"
  | "errSegmentFailed"
  | "errSegmentEmpty"
  | "errEmptyFile"
  | "errTranscribe"
  | "errEmptyTranscript"
  | "noteShareTitle"
>;

const PACK: Record<ChromePack, OrdiZapisChromeCopy> = {
  cs: {
    tabNote: "Zápis",
    tabHistory: "Historie",
    tabGuide: "Návod",
    tabAccount: "Účet",
    signIn: "Přihlášení",
    loading: "Načítám aplikaci…",
    sectionsAria: "OrdiZapis sekce",
    gateTitle: "Jen pro ověřené lékaře",
    gateLogin: "Přihlásit se lékařským účtem",
    gateVerify: "Požádat o ověření lékaře",
    gateMore: "Zjistit více o Dokumentaci",
    gateDefault: "Stažení a zápisy jsou jen pro ověřené lékaře.",
    qrHint:
      "QR odkaz je vázaný na lékařský účet. Přihlaste se stejným účtem — zápisy a historie se propojí.",
    qrHintShort:
      "QR odkaz je vázaný na lékařský účet. Přihlaste se stejným účtem pro synchronizaci.",
    hostLabel: "Host · vyžaduje ověřeného lékaře",
    needLogin: "Pro aplikaci se přihlaste ověřeným lékařským účtem.",
    networkFail: "Nepodařilo se ověřit přístup. Zkontrolujte připojení.",
    guideTitle: "Návod",
    guideLead: "Po stažení: mikrofon → nahrát (diktát nebo konzultace) → hotový zápis.",
    guideSteps: [
      {
        title: "1. Povolte mikrofon",
        text: "Jednou klepněte na „Povolit mikrofon“ v telefonu. Nahráváte přímo v mobilu — diktát i konzultaci.",
      },
      {
        title: "2. Nahrajte diktát nebo konzultaci",
        text: "Režim Diktát (po vyšetření) nebo Konzultace (rozhovor). Zvolte šablonu → Stop a zpracovat.",
      },
      {
        title: "3. Zkontrolujte a zkopírujte",
        text: "Upravte návrh, zkopírujte do NIS. Historie je pod stejným účtem na mobilu i PC.",
      },
      {
        title: "4. Právní rámec",
        text: "Asistent, ne zdravotnický prostředek. Lékař schvaluje finální znění. Před nardávkou konzultace informujte pacienta.",
      },
    ],
    micHelpTitle: "Když telefon mikrofon nepovolí",
    micHelp: [
      "iPhone: Nastavení → Safari (nebo OrdiZapis) → Mikrofon → Povolit",
      "Android: Nastavení → Aplikace → Chrome / OrdiZapis → Oprávnění → Mikrofon",
      "Pak v aplikaci znovu „Povolit mikrofon“",
    ],
    legalTitle: "Právní upozornění",
    legal: [
      "OrdiZapis od MedScopeGlobal není zdravotnický prostředek ani diagnóza.",
      "Lékař odpovídá za kontrolu a schválení zápisu.",
      "Audio se po zpracování neukládá (ephemeral).",
    ],
    marketing: "Marketing a předplatné",
    historyTitle: "Historie",
    historyLogin: "Pro historii se přihlaste.",
    historyEmpty: "Zatím žádné uložené zápisy.",
    historyError: "Nepodařilo se načíst zápisy.",
    historyNetwork: "Síťová chyba.",
    copyFail: "Kopírování selhalo.",
    consent: "Souhlas s nahráváním",
    dictate: "Diktovat",
    upload: "Nahrát soubor",
    myNotes: "Moje zápisy",
    history: "Historie",
    hide: "Skrýt",
    ready: "Připraveno k nahrání",
    recording: "Nahrávání…",
    processing: "Zpracování…",
    pause: "Pauza",
    resume: "Pokračovat",
    recordConsult: "Nahrávat konzultaci",
    template: "Šablona",
    specialtyPh: "např. praktické lékařství, kardiologie",
    noteTitle: "Klinický zápis",
    notePh: "Zde se zobrazí návrh zápisu ke kontrole…",
    remaining: "Zbývající zápisy dnes",
    emptyNote: "Zápis",
    remainingToday: "Zbývající zápisy dnes",
    savedSync: "Sync mobil ↔ web pod stejným účtem.",
    mode: "Režim",
    specialty: "Specializace (volitelné)",
    allowMic: "1. Povolit mikrofon",
    micOn: "Mikrofon povolen",
    howTo:
      "Postup: povolit mikrofon → nahrát v mobilu diktát nebo konzultaci → Stop a zpracovat. Až 60 min (dělení po 2 min). Zápis se uloží do účtu.",
    stopProcess: "Stop a zpracovat",
    dictateStep: "2. Diktovat",
    consultStep: "2. Nahrávat konzultaci",
    consentLong:
      "Jde o diktát, nebo jsem informoval/a pacienta / pacientku o nahrávání konzultace",
    transcript: "Přepis",
    copied: "Zkopírováno",
    saved: "Uloženo v účtu",
    legalFooter:
      "OrdiZapis od MedScopeGlobal není zdravotnický prostředek. Výstup je návrh AI — konečnou odpovědnost za obsah nese lékař. Audio se po zpracování neukládá.",
    copyBtn: "Kopírovat",
    shareBtn: "Sdílet",
    refresh: "Obnovit",
    signInBtn: "Přihlásit se",
    processingHint: "Odesílám a přepisuji nahrávku, pak sestavím zápis… Audio se neukládá trvale.",
    paused: "Pozastaveno",
    installGated: "Stažení po ověření",
    installApp: "Stáhnout aplikaci",
    installed: "Aplikace nainstalována",
    iosShare: "iOS: Sdílet → Na plochu",
  },
  de: {
    tabNote: "Notiz",
    tabHistory: "Verlauf",
    tabGuide: "Anleitung",
    tabAccount: "Konto",
    signIn: "Anmelden",
    loading: "App wird geladen…",
    sectionsAria: "OrdiZapis-Bereiche",
    gateTitle: "Nur für verifizierte Ärztinnen und Ärzte",
    gateLogin: "Mit Arztkonto anmelden",
    gateVerify: "Arztkonto verifizieren lassen",
    gateMore: "Mehr zur Dokumentation",
    gateDefault: "Download und Notizen nur für verifizierte Ärztinnen und Ärzte.",
    qrHint:
      "Der QR-Link ist an das Arztkonto gebunden. Melden Sie sich mit demselben Konto an — Notizen und Verlauf werden verbunden.",
    qrHintShort: "QR-Link ist an das Arztkonto gebunden. Melden Sie sich mit demselben Konto an.",
    hostLabel: "Gast · verifiziertes Arztkonto nötig",
    needLogin: "Melden Sie sich mit einem verifizierten Arztkonto an.",
    networkFail: "Zugang nicht geprüft. Verbindung kontrollieren.",
    guideTitle: "Anleitung",
    guideLead: "Nach der Installation: Mikrofon → aufnehmen (Diktat oder Gespräch) → fertige Notiz.",
    guideSteps: [
      {
        title: "1. Mikrofon erlauben",
        text: "Einmal auf „Mikrofon erlauben“ tippen. Sie nehmen direkt am Handy auf — Diktat und Gespräch.",
      },
      {
        title: "2. Diktat oder Gespräch aufnehmen",
        text: "Modus Diktat (nach der Untersuchung) oder Gespräch. Vorlage wählen → Stopp und verarbeiten.",
      },
      {
        title: "3. Prüfen und kopieren",
        text: "Entwurf bearbeiten und ins EHR kopieren. Der Verlauf liegt im selben Konto auf Handy und PC.",
      },
      {
        title: "4. Rechtlicher Rahmen",
        text: "Assistent, kein Medizinprodukt. Die Ärztin oder der Arzt gibt die Fassung frei. Vor einem Gesprächsmitschnitt informieren.",
      },
    ],
    micHelpTitle: "Wenn das Telefon das Mikrofon sperrt",
    micHelp: [
      "iPhone: Einstellungen → Safari (oder OrdiZapis) → Mikrofon → Erlauben",
      "Android: Einstellungen → Apps → Chrome / OrdiZapis → Berechtigungen → Mikrofon",
      "Dann in der App erneut „Mikrofon erlauben“",
    ],
    legalTitle: "Rechtlicher Hinweis",
    legal: [
      "OrdiZapis von MedScopeGlobal ist kein Medizinprodukt und keine Diagnose.",
      "Die Ärztin oder der Arzt prüft und gibt die Notiz frei.",
      "Audio wird nach der Verarbeitung nicht gespeichert.",
    ],
    marketing: "Marketing und Abo",
    historyTitle: "Verlauf",
    historyLogin: "Für den Verlauf anmelden.",
    historyEmpty: "Noch keine gespeicherten Notizen.",
    historyError: "Notizen konnten nicht geladen werden.",
    historyNetwork: "Netzwerkfehler.",
    copyFail: "Kopieren fehlgeschlagen.",
    consent: "Einwilligung zur Aufnahme",
    dictate: "Diktieren",
    upload: "Datei hochladen",
    myNotes: "Meine Notizen",
    history: "Verlauf",
    hide: "Ausblenden",
    ready: "Bereit zur Aufnahme",
    recording: "Aufnahme…",
    processing: "Verarbeitung…",
    pause: "Pause",
    resume: "Weiter",
    recordConsult: "Gespräch aufnehmen",
    template: "Vorlage",
    specialtyPh: "z. B. Allgemeinmedizin, Kardiologie",
    noteTitle: "Klinische Notiz",
    notePh: "Hier erscheint der Entwurf zur Prüfung…",
    remaining: "Verbleibende Notizen heute",
    emptyNote: "Notiz",
    remainingToday: "Verbleibende Notizen heute",
    savedSync: "Handy ↔ Web im selben Konto.",
    mode: "Modus",
    specialty: "Fachrichtung (optional)",
    allowMic: "1. Mikrofon erlauben",
    micOn: "Mikrofon erlaubt",
    howTo:
      "Ablauf: Mikrofon erlauben → Diktat oder Gespräch aufnehmen → Stopp und verarbeiten. Bis 60 Min (Teilung nach 2 Min). Die Notiz wird im Konto gespeichert.",
    stopProcess: "Stopp und verarbeiten",
    dictateStep: "2. Diktieren",
    consultStep: "2. Gespräch aufnehmen",
    consentLong:
      "Es ist ein Diktat, oder ich habe die Patientin / den Patienten über die Aufnahme informiert",
    transcript: "Abschrift",
    copied: "Kopiert",
    saved: "Im Konto gespeichert",
    legalFooter:
      "OrdiZapis von MedScopeGlobal ist kein Medizinprodukt. Die Ausgabe ist ein KI-Entwurf — die Ärztin oder der Arzt trägt die Verantwortung. Audio wird nach der Verarbeitung nicht gespeichert.",
    copyBtn: "Kopieren",
    shareBtn: "Teilen",
    refresh: "Aktualisieren",
    signInBtn: "Anmelden",
    processingHint: "Aufnahme wird transkribiert, dann entsteht die Notiz… Audio wird nicht dauerhaft gespeichert.",
    paused: "Pausiert",
    installGated: "Download nach Prüfung",
    installApp: "App herunterladen",
    installed: "App installiert",
    iosShare: "iOS: Teilen → Zum Home-Bildschirm",
  },
  fr: {
    tabNote: "Note",
    tabHistory: "Historique",
    tabGuide: "Guide",
    tabAccount: "Compte",
    signIn: "Connexion",
    loading: "Chargement de l’appli…",
    sectionsAria: "Sections OrdiZapis",
    gateTitle: "Réservé aux médecins vérifiés",
    gateLogin: "Se connecter avec un compte médecin",
    gateVerify: "Demander la vérification médecin",
    gateMore: "En savoir plus sur la documentation",
    gateDefault: "Téléchargement et notes réservés aux médecins vérifiés.",
    qrHint:
      "Le lien QR est lié au compte médecin. Connectez-vous avec le même compte — notes et historique se synchronisent.",
    qrHintShort: "Lien QR lié au compte médecin. Connectez-vous avec le même compte.",
    hostLabel: "Invité · compte médecin vérifié requis",
    needLogin: "Connectez-vous avec un compte médecin vérifié.",
    networkFail: "Accès non vérifié. Contrôlez la connexion.",
    guideTitle: "Guide",
    guideLead: "Après installation : micro → enregistrer (dictée ou consultation) → note prête.",
    guideSteps: [
      {
        title: "1. Autoriser le micro",
        text: "Touchez une fois « Autoriser le micro ». Vous enregistrez sur le téléphone — dictée et consultation.",
      },
      {
        title: "2. Enregistrer dictée ou consultation",
        text: "Mode Dictée (après la visite) ou Consultation. Choisissez le modèle → Stop et traiter.",
      },
      {
        title: "3. Relire et copier",
        text: "Corrigez le brouillon, copiez dans le DPI. L’historique suit le même compte sur téléphone et PC.",
      },
      {
        title: "4. Cadre juridique",
        text: "Assistant, pas un dispositif médical. Le médecin valide le texte. Informez la personne avant d’enregistrer une consultation.",
      },
    ],
    micHelpTitle: "Si le téléphone bloque le micro",
    micHelp: [
      "iPhone : Réglages → Safari (ou OrdiZapis) → Micro → Autoriser",
      "Android : Réglages → Applications → Chrome / OrdiZapis → Autorisations → Micro",
      "Puis dans l’appli, « Autoriser le micro » à nouveau",
    ],
    legalTitle: "Mention juridique",
    legal: [
      "OrdiZapis de MedScopeGlobal n’est pas un dispositif médical ni un diagnostic.",
      "Le médecin relit et valide la note.",
      "L’audio n’est pas conservé après traitement.",
    ],
    marketing: "Marketing et abonnement",
    historyTitle: "Historique",
    historyLogin: "Connectez-vous pour l’historique.",
    historyEmpty: "Pas encore de notes enregistrées.",
    historyError: "Impossible de charger les notes.",
    historyNetwork: "Erreur réseau.",
    copyFail: "Copie impossible.",
    consent: "Consentement à l’enregistrement",
    dictate: "Dicter",
    upload: "Envoyer un fichier",
    myNotes: "Mes notes",
    history: "Historique",
    hide: "Masquer",
    ready: "Prêt à enregistrer",
    recording: "Enregistrement…",
    processing: "Traitement…",
    pause: "Pause",
    resume: "Reprendre",
    recordConsult: "Enregistrer la consultation",
    template: "Modèle",
    specialtyPh: "ex. médecine générale, cardiologie",
    noteTitle: "Note clinique",
    notePh: "Le brouillon à relire apparaîtra ici…",
    remaining: "Notes restantes aujourd’hui",
    emptyNote: "Note",
    remainingToday: "Notes restantes aujourd’hui",
    savedSync: "Téléphone ↔ web avec le même compte.",
    mode: "Mode",
    specialty: "Spécialité (facultatif)",
    allowMic: "1. Autoriser le micro",
    micOn: "Micro autorisé",
    howTo:
      "Marche à suivre : autoriser le micro → enregistrer une dictée ou une consultation → Stop et traiter. Jusqu’à 60 min (découpe toutes les 2 min). La note est enregistrée dans le compte.",
    stopProcess: "Stop et traiter",
    dictateStep: "2. Dicter",
    consultStep: "2. Enregistrer la consultation",
    consentLong:
      "Il s’agit d’une dictée, ou j’ai informé la personne de l’enregistrement de la consultation",
    transcript: "Transcription",
    copied: "Copié",
    saved: "Enregistré dans le compte",
    legalFooter:
      "OrdiZapis de MedScopeGlobal n’est pas un dispositif médical. Le texte est un brouillon d’IA — le médecin en reste responsable. L’audio n’est pas conservé après traitement.",
    copyBtn: "Copier",
    shareBtn: "Partager",
    refresh: "Actualiser",
    signInBtn: "Se connecter",
    processingHint: "Envoi et transcription de l’enregistrement, puis assemblage de la note… L’audio n’est pas conservé.",
    paused: "En pause",
    installGated: "Téléchargement après vérification",
    installApp: "Télécharger l’appli",
    installed: "Appli installée",
    iosShare: "iOS : Partager → Écran d’accueil",
  },
  it: {
    tabNote: "Nota",
    tabHistory: "Cronologia",
    tabGuide: "Guida",
    tabAccount: "Account",
    signIn: "Accedi",
    loading: "Caricamento dell’app…",
    sectionsAria: "Sezioni OrdiZapis",
    gateTitle: "Solo per medici verificati",
    gateLogin: "Accedi con un account medico",
    gateVerify: "Chiedi la verifica medico",
    gateMore: "Scopri di più sulla documentazione",
    gateDefault: "Download e note solo per medici verificati.",
    qrHint:
      "Il link QR è legato all’account medico. Accedi con lo stesso account — note e cronologia si sincronizzano.",
    qrHintShort: "Link QR legato all’account medico. Accedi con lo stesso account.",
    hostLabel: "Ospite · serve un account medico verificato",
    needLogin: "Accedi con un account medico verificato.",
    networkFail: "Accesso non verificato. Controlla la connessione.",
    guideTitle: "Guida",
    guideLead: "Dopo l’installazione: microfono → registra (dettato o visita) → nota pronta.",
    guideSteps: [
      {
        title: "1. Consenti il microfono",
        text: "Tocca una volta « Consenti microfono ». Registri sul telefono — dettato e visita.",
      },
      {
        title: "2. Registra dettato o visita",
        text: "Modalità Dettato (dopo la visita) o Consulto. Scegli il modello → Stop e elabora.",
      },
      {
        title: "3. Controlla e copia",
        text: "Modifica la bozza, copiala nel cartella clinica. La cronologia segue lo stesso account su telefono e PC.",
      },
      {
        title: "4. Quadro giuridico",
        text: "Assistente, non un dispositivo medico. Il medico approva il testo. Informa la persona prima di registrare una visita.",
      },
    ],
    micHelpTitle: "Se il telefono blocca il microfono",
    micHelp: [
      "iPhone: Impostazioni → Safari (o OrdiZapis) → Microfono → Consenti",
      "Android: Impostazioni → App → Chrome / OrdiZapis → Autorizzazioni → Microfono",
      "Poi nell’app di nuovo « Consenti microfono »",
    ],
    legalTitle: "Avviso legale",
    legal: [
      "OrdiZapis di MedScopeGlobal non è un dispositivo medico né una diagnosi.",
      "Il medico rivede e approva la nota.",
      "L’audio non viene conservato dopo l’elaborazione.",
    ],
    marketing: "Marketing e abbonamento",
    historyTitle: "Cronologia",
    historyLogin: "Accedi per la cronologia.",
    historyEmpty: "Ancora nessuna nota salvata.",
    historyError: "Impossibile caricare le note.",
    historyNetwork: "Errore di rete.",
    copyFail: "Copia non riuscita.",
    consent: "Consenso alla registrazione",
    dictate: "Detta",
    upload: "Carica un file",
    myNotes: "Le mie note",
    history: "Cronologia",
    hide: "Nascondi",
    ready: "Pronto a registrare",
    recording: "Registrazione…",
    processing: "Elaborazione…",
    pause: "Pausa",
    resume: "Riprendi",
    recordConsult: "Registra la visita",
    template: "Modello",
    specialtyPh: "es. medicina generale, cardiologia",
    noteTitle: "Nota clinica",
    notePh: "Qui comparirà la bozza da rivedere…",
    remaining: "Note rimaste oggi",
    emptyNote: "Nota",
    remainingToday: "Note rimaste oggi",
    savedSync: "Telefono ↔ web con lo stesso account.",
    mode: "Modalità",
    specialty: "Specialità (facoltativo)",
    allowMic: "1. Consenti il microfono",
    micOn: "Microfono consentito",
    howTo:
      "Procedura: consenti il microfono → registra un dettato o una visita → Stop e elabora. Fino a 60 min (spezzata ogni 2 min). La nota si salva nell’account.",
    stopProcess: "Stop e elabora",
    dictateStep: "2. Detta",
    consultStep: "2. Registra la visita",
    consentLong:
      "È un dettato, oppure ho informato la persona della registrazione della visita",
    transcript: "Trascrizione",
    copied: "Copiato",
    saved: "Salvato nell’account",
    legalFooter:
      "OrdiZapis di MedScopeGlobal non è un dispositivo medico. Il testo è una bozza IA — la responsabilità resta del medico. L’audio non viene conservato dopo l’elaborazione.",
    copyBtn: "Copia",
    shareBtn: "Condividi",
    refresh: "Aggiorna",
    signInBtn: "Accedi",
    processingHint: "Invio e trascrizione della registrazione, poi assemblaggio della nota… L’audio non viene conservato.",
    paused: "In pausa",
    installGated: "Download dopo verifica",
    installApp: "Scarica l’app",
    installed: "App installata",
    iosShare: "iOS: Condividi → Schermata Home",
  },
  es: {
    tabNote: "Nota",
    tabHistory: "Historial",
    tabGuide: "Guía",
    tabAccount: "Cuenta",
    signIn: "Entrar",
    loading: "Cargando la app…",
    sectionsAria: "Secciones OrdiZapis",
    gateTitle: "Solo para médicos verificados",
    gateLogin: "Entrar con una cuenta médica",
    gateVerify: "Pedir verificación médica",
    gateMore: "Más sobre la documentación",
    gateDefault: "Descarga y notas solo para médicos verificados.",
    qrHint:
      "El enlace QR está ligado a la cuenta médica. Entra con la misma cuenta — notas e historial se sincronizan.",
    qrHintShort: "Enlace QR ligado a la cuenta médica. Entra con la misma cuenta.",
    hostLabel: "Invitado · hace falta una cuenta médica verificada",
    needLogin: "Entra con una cuenta médica verificada.",
    networkFail: "No se pudo comprobar el acceso. Revisa la conexión.",
    guideTitle: "Guía",
    guideLead: "Tras instalar: micrófono → grabar (dictado o consulta) → nota lista.",
    guideSteps: [
      {
        title: "1. Permitir el micrófono",
        text: "Toca una vez « Permitir micrófono ». Grabas en el teléfono — dictado y consulta.",
      },
      {
        title: "2. Grabar dictado o consulta",
        text: "Modo Dictado (tras la visita) o Consulta. Elige la plantilla → Stop y procesar.",
      },
      {
        title: "3. Revisar y copiar",
        text: "Edita el borrador y cópialo al HCE. El historial sigue la misma cuenta en teléfono y PC.",
      },
      {
        title: "4. Marco legal",
        text: "Asistente, no un producto sanitario. El médico aprueba el texto. Informa antes de grabar una consulta.",
      },
    ],
    micHelpTitle: "Si el teléfono bloquea el micrófono",
    micHelp: [
      "iPhone: Ajustes → Safari (o OrdiZapis) → Micrófono → Permitir",
      "Android: Ajustes → Aplicaciones → Chrome / OrdiZapis → Permisos → Micrófono",
      "Luego en la app otra vez « Permitir micrófono »",
    ],
    legalTitle: "Aviso legal",
    legal: [
      "OrdiZapis de MedScopeGlobal no es un producto sanitario ni un diagnóstico.",
      "El médico revisa y aprueba la nota.",
      "El audio no se guarda después del procesado.",
    ],
    marketing: "Marketing y suscripción",
    historyTitle: "Historial",
    historyLogin: "Entra para ver el historial.",
    historyEmpty: "Aún no hay notas guardadas.",
    historyError: "No se pudieron cargar las notas.",
    historyNetwork: "Error de red.",
    copyFail: "No se pudo copiar.",
    consent: "Consentimiento para grabar",
    dictate: "Dictar",
    upload: "Subir un archivo",
    myNotes: "Mis notas",
    history: "Historial",
    hide: "Ocultar",
    ready: "Listo para grabar",
    recording: "Grabando…",
    processing: "Procesando…",
    pause: "Pausa",
    resume: "Seguir",
    recordConsult: "Grabar la consulta",
    template: "Plantilla",
    specialtyPh: "p. ej. medicina de familia, cardiología",
    noteTitle: "Nota clínica",
    notePh: "Aquí aparecerá el borrador para revisar…",
    remaining: "Notas restantes hoy",
    emptyNote: "Nota",
    remainingToday: "Notas restantes hoy",
    savedSync: "Teléfono ↔ web con la misma cuenta.",
    mode: "Modo",
    specialty: "Especialidad (opcional)",
    allowMic: "1. Permitir el micrófono",
    micOn: "Micrófono permitido",
    howTo:
      "Pasos: permitir el micrófono → grabar un dictado o una consulta → Stop y procesar. Hasta 60 min (corte cada 2 min). La nota se guarda en la cuenta.",
    stopProcess: "Stop y procesar",
    dictateStep: "2. Dictar",
    consultStep: "2. Grabar la consulta",
    consentLong:
      "Es un dictado, o he informado a la persona de la grabación de la consulta",
    transcript: "Transcripción",
    copied: "Copiado",
    saved: "Guardado en la cuenta",
    legalFooter:
      "OrdiZapis de MedScopeGlobal no es un producto sanitario. El texto es un borrador de IA — el médico responde del contenido. El audio no se guarda después del procesado.",
    copyBtn: "Copiar",
    shareBtn: "Compartir",
    refresh: "Actualizar",
    signInBtn: "Entrar",
    processingHint: "Envío y transcripción de la grabación, luego se arma la nota… El audio no se conserva.",
    paused: "En pausa",
    installGated: "Descarga tras verificación",
    installApp: "Descargar la app",
    installed: "App instalada",
    iosShare: "iOS: Compartir → Pantalla de inicio",
  },
  "pt-BR": {
    tabNote: "Nota",
    tabHistory: "Histórico",
    tabGuide: "Guia",
    tabAccount: "Conta",
    signIn: "Entrar",
    loading: "A carregar a app…",
    sectionsAria: "Secções OrdiZapis",
    gateTitle: "Só para médicos verificados",
    gateLogin: "Entrar com uma conta médica",
    gateVerify: "Pedir verificação médica",
    gateMore: "Saber mais sobre a documentação",
    gateDefault: "Transferência e notas só para médicos verificados.",
    qrHint:
      "O link QR está ligado à conta médica. Entre com a mesma conta — notas e histórico sincronizam.",
    qrHintShort: "Link QR ligado à conta médica. Entre com a mesma conta.",
    hostLabel: "Convidado · é precisa uma conta médica verificada",
    needLogin: "Entre com uma conta médica verificada.",
    networkFail: "Acesso não verificado. Confira a ligação.",
    guideTitle: "Guia",
    guideLead: "Depois de instalar: microfone → gravar (ditado ou consulta) → nota pronta.",
    guideSteps: [
      {
        title: "1. Permitir o microfone",
        text: "Toque uma vez em « Permitir microfone ». Grava no telefone — ditado e consulta.",
      },
      {
        title: "2. Gravar ditado ou consulta",
        text: "Modo Ditado (depois da visita) ou Consulta. Escolha o modelo → Stop e processar.",
      },
      {
        title: "3. Rever e copiar",
        text: "Edite o rascunho e copie para o processo. O histórico segue a mesma conta no telefone e no PC.",
      },
      {
        title: "4. Enquadramento legal",
        text: "Assistente, não um dispositivo médico. O médico aprova o texto. Informe antes de gravar uma consulta.",
      },
    ],
    micHelpTitle: "Se o telefone bloquear o microfone",
    micHelp: [
      "iPhone: Definições → Safari (ou OrdiZapis) → Microfone → Permitir",
      "Android: Definições → Aplicações → Chrome / OrdiZapis → Permissões → Microfone",
      "Depois na app outra vez « Permitir microfone »",
    ],
    legalTitle: "Aviso legal",
    legal: [
      "O OrdiZapis da MedScopeGlobal não é um dispositivo médico nem um diagnóstico.",
      "O médico revê e aprova a nota.",
      "O áudio não é guardado depois do processamento.",
    ],
    marketing: "Marketing e assinatura",
    historyTitle: "Histórico",
    historyLogin: "Entre para o histórico.",
    historyEmpty: "Ainda não há notas guardadas.",
    historyError: "Não foi possível carregar as notas.",
    historyNetwork: "Erro de rede.",
    copyFail: "A cópia falhou.",
    consent: "Consentimento para gravar",
    dictate: "Ditar",
    upload: "Enviar um ficheiro",
    myNotes: "As minhas notas",
    history: "Histórico",
    hide: "Ocultar",
    ready: "Pronto a gravar",
    recording: "A gravar…",
    processing: "A processar…",
    pause: "Pausa",
    resume: "Continuar",
    recordConsult: "Gravar a consulta",
    template: "Modelo",
    specialtyPh: "ex. medicina geral, cardiologia",
    noteTitle: "Nota clínica",
    notePh: "O rascunho para rever aparece aqui…",
    remaining: "Notas restantes hoje",
    emptyNote: "Nota",
    remainingToday: "Notas restantes hoje",
    savedSync: "Telefone ↔ web com a mesma conta.",
    mode: "Modo",
    specialty: "Especialidade (opcional)",
    allowMic: "1. Permitir o microfone",
    micOn: "Microfone permitido",
    howTo:
      "Passos: permitir o microfone → gravar um ditado ou uma consulta → Stop e processar. Até 60 min (corte a cada 2 min). A nota fica na conta.",
    stopProcess: "Stop e processar",
    dictateStep: "2. Ditar",
    consultStep: "2. Gravar a consulta",
    consentLong:
      "É um ditado, ou informei a pessoa da gravação da consulta",
    transcript: "Transcrição",
    copied: "Copiado",
    saved: "Guardado na conta",
    legalFooter:
      "O OrdiZapis da MedScopeGlobal não é um dispositivo médico. O texto é um rascunho de IA — o médico responde pelo conteúdo. O áudio não é guardado depois do processamento.",
    copyBtn: "Copiar",
    shareBtn: "Partilhar",
    refresh: "Atualizar",
    signInBtn: "Entrar",
    processingHint: "A enviar e transcrever a gravação, depois a montar a nota… O áudio não é guardado.",
    paused: "Em pausa",
    installGated: "Transferência após verificação",
    installApp: "Transferir a app",
    installed: "App instalada",
    iosShare: "iOS: Partilhar → Ecrã inicial",
  },
  en: {
    tabNote: "Note",
    tabHistory: "History",
    tabGuide: "Guide",
    tabAccount: "Account",
    signIn: "Sign in",
    loading: "Loading the app…",
    sectionsAria: "OrdiZapis sections",
    gateTitle: "Verified physicians only",
    gateLogin: "Sign in with a physician account",
    gateVerify: "Request physician verification",
    gateMore: "More about documentation",
    gateDefault: "Download and notes are for verified physicians only.",
    qrHint:
      "The QR link is tied to the physician account. Sign in with the same account — notes and history stay in sync.",
    qrHintShort: "QR link is tied to the physician account. Sign in with the same account.",
    hostLabel: "Guest · verified physician account required",
    needLogin: "Sign in with a verified physician account.",
    networkFail: "Could not verify access. Check the connection.",
    guideTitle: "Guide",
    guideLead: "After install: microphone → record (dictation or consult) → finished note.",
    guideSteps: [
      {
        title: "1. Allow the microphone",
        text: "Tap “Allow microphone” once. You record on the phone — dictation and consult.",
      },
      {
        title: "2. Record a dictation or consult",
        text: "Dictation mode (after the visit) or Consult. Pick a template → Stop and process.",
      },
      {
        title: "3. Review and copy",
        text: "Edit the draft and copy it into the EHR. History follows the same account on phone and PC.",
      },
      {
        title: "4. Legal frame",
        text: "An assistant, not a medical device. The clinician approves the wording. Tell the person before recording a consult.",
      },
    ],
    micHelpTitle: "If the phone blocks the microphone",
    micHelp: [
      "iPhone: Settings → Safari (or OrdiZapis) → Microphone → Allow",
      "Android: Settings → Apps → Chrome / OrdiZapis → Permissions → Microphone",
      "Then in the app tap “Allow microphone” again",
    ],
    legalTitle: "Legal notice",
    legal: [
      "OrdiZapis from MedScopeGlobal is not a medical device and not a diagnosis.",
      "The clinician reviews and approves the note.",
      "Audio is not stored after processing.",
    ],
    marketing: "Marketing and subscription",
    historyTitle: "History",
    historyLogin: "Sign in for history.",
    historyEmpty: "No saved notes yet.",
    historyError: "Could not load notes.",
    historyNetwork: "Network error.",
    copyFail: "Copy failed.",
    consent: "Consent to record",
    dictate: "Dictate",
    upload: "Upload a file",
    myNotes: "My notes",
    history: "History",
    hide: "Hide",
    ready: "Ready to record",
    recording: "Recording…",
    processing: "Processing…",
    pause: "Pause",
    resume: "Resume",
    recordConsult: "Record the consult",
    template: "Template",
    specialtyPh: "e.g. general practice, cardiology",
    noteTitle: "Clinical note",
    notePh: "The draft for review will appear here…",
    remaining: "Notes left today",
    emptyNote: "Note",
    remainingToday: "Notes left today",
    savedSync: "Phone ↔ web with the same account.",
    mode: "Mode",
    specialty: "Specialty (optional)",
    allowMic: "1. Allow microphone",
    micOn: "Microphone allowed",
    howTo:
      "Steps: allow the microphone → record a dictation or a consult → Stop and process. Up to 60 min (split every 2 min). The note is saved to the account.",
    stopProcess: "Stop and process",
    dictateStep: "2. Dictate",
    consultStep: "2. Record the consult",
    consentLong:
      "This is a dictation, or I have told the person that the consult is being recorded",
    transcript: "Transcript",
    copied: "Copied",
    saved: "Saved to the account",
    legalFooter:
      "OrdiZapis from MedScopeGlobal is not a medical device. The output is an AI draft — the clinician remains responsible. Audio is not stored after processing.",
    copyBtn: "Copy",
    shareBtn: "Share",
    refresh: "Refresh",
    signInBtn: "Sign in",
    processingHint: "Sending and transcribing the recording, then assembling the note… Audio is not kept.",
    paused: "Paused",
    installGated: "Download after verification",
    installApp: "Download the app",
    installed: "App installed",
    iosShare: "iOS: Share → Add to Home Screen",
  },
};

const ACCOUNT: Record<ChromePack, Omit<OrdiZapisAppCopy, keyof OrdiZapisChromeCopy>> = {
  cs: {
    accessLabel: "Přístup",
    validityLabel: "Platnost",
    subscribeCta: "Předplatné",
    accountAria: "Stav účtu a platnost",
    physicianFallback: "Lékař",
    planVip: "VIP / předplatné",
    planBasic: "základní",
    notSignedIn: "Nejste přihlášeni",
    signInLead: "Pro stažení, zápisy a historii se přihlaste ověřeným lékařským účtem.",
    validityAfterLogin: "po přihlášení",
    verifiedLinked: "Ověřený lékař — aplikace propojena s tímto účtem",
    signOut: "Odhlásit se",
    verifyAccount: "Ověřit lékařský účet",
    subscribeOrdi: "Předplatné OrdiZapis (390 Kč)",
    installTitle: "Instalace aplikace",
    installLead:
      "Stažení OrdiZapis je vázané na váš ověřený účet MedScopeGlobal — historie se synchronizuje.",
    backToMarketing: "Zpět na marketingovou stránku",
    loadingAccount: "Načítám účet…",
    statusLabel: "Stav",
    online: "Online",
    offline: "Offline",
    errConsent: "Nejprve potvrďte souhlas s nahráváním.",
    errEmptyRec: "Nahrávka je prázdná — mikrofon nic nezachytil. Povolte mikrofon a zkuste znovu.",
    errTooLarge:
      "Nahrávka je příliš velká pro odeslání. Zkuste kratší úsek — aplikace teď dělí nahrávku po 2 minutách.",
    errNeedLogin: "Pro zpracování se musíte přihlásit.",
    errServerHttp: "Zpracování na serveru selhalo (HTTP {status}). Zkuste znovu za chvíli.",
    errUnexpectedHttp: "Neočekávaná odpověď serveru (HTTP {status}). Zkuste znovu.",
    errStructure: "Sestavení zápisu selhalo.",
    errStructureRetry: "Zápis se nepodařilo sestavit. Zkuste nahrávku znovu.",
    errProcessRec: "Zpracování nahrávky selhalo. Zkuste kratší úsek nebo Nahrát soubor znovu.",
    errProcessFile: "Zpracování souboru selhalo.",
    errCopy: "Kopírování do schránky selhalo.",
    errNothingToCopy: "Zatím není co kopírovat — vytvořte zápis.",
    errMicBlocked:
      "Mikrofon je zablokovaný. V telefonu: Nastavení → OrdiZapis / Safari / Chrome → Mikrofon → Povolit, pak znovu klepněte na „Povolit mikrofon“.",
    errMicMissing: "Mikrofon nebyl nalezen. Zkontrolujte, že zařízení má mikrofon a není používán jinou aplikací.",
    errMicGeneric: "Nepodařilo se získat mikrofon. Povolte přístup a zkuste znovu.",
    errConsentMic: "Nejprve potvrďte souhlas s nahráváním (nebo povolte mikrofon).",
    errFileTooBig: "Soubor je větší než 25 MB. Nahrajte kratší nahrávku nebo použijte Nahrávat v OrdiZapisu.",
    errUploadConn:
      "Spojení při odesílání nahrávky selhalo (časté u většího M4A na mobilu). Zkuste znovu na Wi‑Fi, nebo použijte Nahrávat přímo v OrdiZapisu.",
    errSegmentTooBig:
      "Segment {n} je příliš velký ({mb} MB). Nahrajte znovu — nahrávka se teď automaticky dělí po 2 minutách.",
    errSegmentFailed: "Přepis segmentu {n} selhal.",
    errSegmentEmpty: "Segment {n} se nepřepsal (prázdný výsledek). Zkontrolujte mikrofon a zkuste znovu.",
    errEmptyFile: "Soubor je prázdný.",
    errTranscribe: "Přepis souboru selhal.",
    errEmptyTranscript: "Přepis je prázdný — soubor se nepodařilo rozpoznat.",
    noteShareTitle: "OrdiZapis zápis",
  },
  de: {
    accessLabel: "Zugang",
    validityLabel: "Gültigkeit",
    subscribeCta: "Abo",
    accountAria: "Kontostatus und Gültigkeit",
    physicianFallback: "Arztkonto",
    planVip: "VIP / Abo",
    planBasic: "Basis",
    notSignedIn: "Sie sind nicht angemeldet",
    signInLead: "Für Download, Notizen und Verlauf mit einem verifizierten Arztkonto anmelden.",
    validityAfterLogin: "nach der Anmeldung",
    verifiedLinked: "Verifiziertes Arztkonto — App mit diesem Konto verbunden",
    signOut: "Abmelden",
    verifyAccount: "Arztkonto verifizieren",
    subscribeOrdi: "OrdiZapis-Abo (390 Kč)",
    installTitle: "App installieren",
    installLead:
      "Der OrdiZapis-Download ist an Ihr verifiziertes MedScopeGlobal-Konto gebunden — der Verlauf bleibt synchron.",
    backToMarketing: "Zurück zur Produktseite",
    loadingAccount: "Konto wird geladen…",
    statusLabel: "Status",
    online: "Online",
    offline: "Offline",
    errConsent: "Bitte zuerst die Aufnahmebestätigung erteilen.",
    errEmptyRec: "Die Aufnahme ist leer — das Mikrofon hat nichts erfasst. Mikrofon erlauben und erneut versuchen.",
    errTooLarge:
      "Die Aufnahme ist zu groß. Kürzer aufnehmen — die App teilt jetzt alle 2 Minuten.",
    errNeedLogin: "Zum Verarbeiten müssen Sie sich anmelden.",
    errServerHttp: "Serverfehler (HTTP {status}). Bitte später erneut versuchen.",
    errUnexpectedHttp: "Unerwartete Serverantwort (HTTP {status}). Bitte erneut versuchen.",
    errStructure: "Die Notiz konnte nicht erstellt werden.",
    errStructureRetry: "Die Notiz konnte nicht erstellt werden. Aufnahme erneut versuchen.",
    errProcessRec: "Verarbeiten der Aufnahme fehlgeschlagen. Kürzeren Abschnitt oder Datei-Upload versuchen.",
    errProcessFile: "Verarbeiten der Datei fehlgeschlagen.",
    errCopy: "Kopieren in die Zwischenablage fehlgeschlagen.",
    errNothingToCopy: "Noch nichts zu kopieren — zuerst eine Notiz erstellen.",
    errMicBlocked:
      "Mikrofon ist blockiert. Am Telefon: Einstellungen → OrdiZapis / Safari / Chrome → Mikrofon → Erlauben, dann erneut „Mikrofon erlauben“.",
    errMicMissing: "Kein Mikrofon gefunden. Prüfen, ob das Gerät eines hat und keine andere App es nutzt.",
    errMicGeneric: "Mikrofon nicht verfügbar. Zugriff erlauben und erneut versuchen.",
    errConsentMic: "Bitte zuerst die Aufnahme bestätigen (oder das Mikrofon erlauben).",
    errFileTooBig: "Datei größer als 25 MB. Kürzere Aufnahme wählen oder in OrdiZapis aufnehmen.",
    errUploadConn:
      "Upload-Verbindung fehlgeschlagen (häufig bei größeren M4A am Handy). Auf WLAN erneut versuchen oder direkt in OrdiZapis aufnehmen.",
    errSegmentTooBig:
      "Segment {n} ist zu groß ({mb} MB). Erneut aufnehmen — die App teilt jetzt alle 2 Minuten.",
    errSegmentFailed: "Transkription von Segment {n} fehlgeschlagen.",
    errSegmentEmpty: "Segment {n} ist leer. Mikrofon prüfen und erneut versuchen.",
    errEmptyFile: "Die Datei ist leer.",
    errTranscribe: "Transkription der Datei fehlgeschlagen.",
    errEmptyTranscript: "Transkription ist leer — die Datei wurde nicht erkannt.",
    noteShareTitle: "OrdiZapis-Notiz",
  },
  fr: {
    accessLabel: "Accès",
    validityLabel: "Validité",
    subscribeCta: "Abonnement",
    accountAria: "État du compte et validité",
    physicianFallback: "Compte médecin",
    planVip: "VIP / abonnement",
    planBasic: "base",
    notSignedIn: "Vous n’êtes pas connecté",
    signInLead: "Pour le téléchargement, les notes et l’historique, connectez-vous avec un compte médecin vérifié.",
    validityAfterLogin: "après connexion",
    verifiedLinked: "Médecin vérifié — l’appli est liée à ce compte",
    signOut: "Se déconnecter",
    verifyAccount: "Vérifier le compte médecin",
    subscribeOrdi: "Abonnement OrdiZapis (390 Kč)",
    installTitle: "Installer l’application",
    installLead:
      "Le téléchargement OrdiZapis est lié à votre compte MedScopeGlobal vérifié — l’historique reste synchronisé.",
    backToMarketing: "Retour à la page produit",
    loadingAccount: "Chargement du compte…",
    statusLabel: "État",
    online: "En ligne",
    offline: "Hors ligne",
    errConsent: "Confirmez d’abord le consentement à l’enregistrement.",
    errEmptyRec: "L’enregistrement est vide — le micro n’a rien capté. Autorisez le micro et réessayez.",
    errTooLarge:
      "L’enregistrement est trop lourd. Essayez un passage plus court — l’appli découpe maintenant toutes les 2 min.",
    errNeedLogin: "Connectez-vous pour traiter l’enregistrement.",
    errServerHttp: "Échec serveur (HTTP {status}). Réessayez dans un instant.",
    errUnexpectedHttp: "Réponse serveur inattendue (HTTP {status}). Réessayez.",
    errStructure: "Échec de l’assemblage de la note.",
    errStructureRetry: "La note n’a pas pu être assemblée. Réessayez l’enregistrement.",
    errProcessRec: "Échec du traitement. Essayez un passage plus court ou Envoyer un fichier.",
    errProcessFile: "Échec du traitement du fichier.",
    errCopy: "Échec de la copie dans le presse-papiers.",
    errNothingToCopy: "Rien à copier pour l’instant — créez une note.",
    errMicBlocked:
      "Le micro est bloqué. Sur le téléphone : Réglages → OrdiZapis / Safari / Chrome → Microphone → Autoriser, puis « Autoriser le micro ».",
    errMicMissing: "Aucun micro trouvé. Vérifiez que l’appareil en a un et qu’une autre appli ne l’utilise pas.",
    errMicGeneric: "Impossible d’accéder au micro. Autorisez l’accès et réessayez.",
    errConsentMic: "Confirmez d’abord le consentement (ou autorisez le micro).",
    errFileTooBig: "Fichier de plus de 25 Mo. Envoyez un enregistrement plus court ou dictez dans OrdiZapis.",
    errUploadConn:
      "La connexion a échoué pendant l’envoi (fréquent avec un gros M4A sur mobile). Réessayez en Wi‑Fi, ou dictez dans OrdiZapis.",
    errSegmentTooBig:
      "Le segment {n} est trop lourd ({mb} Mo). Réenregistrez — l’appli découpe maintenant toutes les 2 min.",
    errSegmentFailed: "Échec de la transcription du segment {n}.",
    errSegmentEmpty: "Le segment {n} est vide. Vérifiez le micro et réessayez.",
    errEmptyFile: "Le fichier est vide.",
    errTranscribe: "Échec de la transcription du fichier.",
    errEmptyTranscript: "Transcription vide — le fichier n’a pas été reconnu.",
    noteShareTitle: "Note OrdiZapis",
  },
  it: {
    accessLabel: "Accesso",
    validityLabel: "Validità",
    subscribeCta: "Abbonamento",
    accountAria: "Stato dell’account e validità",
    physicianFallback: "Account medico",
    planVip: "VIP / abbonamento",
    planBasic: "base",
    notSignedIn: "Non siete connessi",
    signInLead: "Per download, note e cronologia accedete con un account medico verificato.",
    validityAfterLogin: "dopo l’accesso",
    verifiedLinked: "Medico verificato — l’app è collegata a questo account",
    signOut: "Esci",
    verifyAccount: "Verifica l’account medico",
    subscribeOrdi: "Abbonamento OrdiZapis (390 Kč)",
    installTitle: "Installa l’app",
    installLead:
      "Il download OrdiZapis è legato al vostro account MedScopeGlobal verificato — la cronologia resta sincronizzata.",
    backToMarketing: "Torna alla pagina prodotto",
    loadingAccount: "Caricamento dell’account…",
    statusLabel: "Stato",
    online: "Online",
    offline: "Offline",
    errConsent: "Confermate prima il consenso alla registrazione.",
    errEmptyRec: "La registrazione è vuota — il microfono non ha catturato nulla. Consenti il microfono e riprova.",
    errTooLarge:
      "La registrazione è troppo grande. Provate un tratto più breve — l’app ora spezza ogni 2 minuti.",
    errNeedLogin: "Per elaborare dovete accedere.",
    errServerHttp: "Errore del server (HTTP {status}). Riprovate tra poco.",
    errUnexpectedHttp: "Risposta del server inattesa (HTTP {status}). Riprovate.",
    errStructure: "Assemblaggio della nota non riuscito.",
    errStructureRetry: "Impossibile assemblare la nota. Riprovate la registrazione.",
    errProcessRec: "Elaborazione non riuscita. Provate un tratto più breve o Carica un file.",
    errProcessFile: "Elaborazione del file non riuscita.",
    errCopy: "Copia negli appunti non riuscita.",
    errNothingToCopy: "Non c’è ancora nulla da copiare — create una nota.",
    errMicBlocked:
      "Il microfono è bloccato. Sul telefono: Impostazioni → OrdiZapis / Safari / Chrome → Microfono → Consenti, poi di nuovo « Consenti il microfono ».",
    errMicMissing: "Microfono non trovato. Controllate che il dispositivo ne abbia uno e che un’altra app non lo usi.",
    errMicGeneric: "Impossibile ottenere il microfono. Consenti l’accesso e riprova.",
    errConsentMic: "Confermate prima il consenso (o consentite il microfono).",
    errFileTooBig: "File oltre 25 MB. Caricate una registrazione più breve o registrate in OrdiZapis.",
    errUploadConn:
      "Connessione persa durante l’invio (frequente con M4A grandi sul telefono). Riprovate in Wi‑Fi o registrate in OrdiZapis.",
    errSegmentTooBig:
      "Il segmento {n} è troppo grande ({mb} MB). Registrate di nuovo — l’app ora spezza ogni 2 minuti.",
    errSegmentFailed: "Trascrizione del segmento {n} non riuscita.",
    errSegmentEmpty: "Il segmento {n} è vuoto. Controllate il microfono e riprovate.",
    errEmptyFile: "Il file è vuoto.",
    errTranscribe: "Trascrizione del file non riuscita.",
    errEmptyTranscript: "Trascrizione vuota — il file non è stato riconosciuto.",
    noteShareTitle: "Nota OrdiZapis",
  },
  es: {
    accessLabel: "Acceso",
    validityLabel: "Validez",
    subscribeCta: "Suscripción",
    accountAria: "Estado de la cuenta y validez",
    physicianFallback: "Cuenta médica",
    planVip: "VIP / suscripción",
    planBasic: "básico",
    notSignedIn: "No ha iniciado sesión",
    signInLead: "Para la descarga, las notas y el historial, entre con una cuenta médica verificada.",
    validityAfterLogin: "tras iniciar sesión",
    verifiedLinked: "Médico verificado — la app está ligada a esta cuenta",
    signOut: "Cerrar sesión",
    verifyAccount: "Verificar la cuenta médica",
    subscribeOrdi: "Suscripción OrdiZapis (390 Kč)",
    installTitle: "Instalar la app",
    installLead:
      "La descarga de OrdiZapis está ligada a su cuenta MedScopeGlobal verificada — el historial se sincroniza.",
    backToMarketing: "Volver a la página del producto",
    loadingAccount: "Cargando la cuenta…",
    statusLabel: "Estado",
    online: "En línea",
    offline: "Sin conexión",
    errConsent: "Confirme primero el consentimiento de grabación.",
    errEmptyRec: "La grabación está vacía — el micrófono no captó nada. Permita el micrófono y reintente.",
    errTooLarge:
      "La grabación es demasiado grande. Pruebe un tramo más corto — la app ahora parte cada 2 minutos.",
    errNeedLogin: "Debe iniciar sesión para procesar.",
    errServerHttp: "Fallo del servidor (HTTP {status}). Reintente en un momento.",
    errUnexpectedHttp: "Respuesta inesperada del servidor (HTTP {status}). Reintente.",
    errStructure: "No se pudo armar la nota.",
    errStructureRetry: "No se pudo armar la nota. Vuelva a grabar.",
    errProcessRec: "Fallo al procesar. Pruebe un tramo más corto o Enviar un archivo.",
    errProcessFile: "Fallo al procesar el archivo.",
    errCopy: "No se pudo copiar al portapapeles.",
    errNothingToCopy: "Aún no hay nada que copiar — cree una nota.",
    errMicBlocked:
      "El micrófono está bloqueado. En el teléfono: Ajustes → OrdiZapis / Safari / Chrome → Micrófono → Permitir, luego « Permitir micrófono ».",
    errMicMissing: "No se encontró micrófono. Compruebe que el dispositivo tenga uno y que otra app no lo use.",
    errMicGeneric: "No se pudo acceder al micrófono. Permita el acceso y reintente.",
    errConsentMic: "Confirme primero el consentimiento (o permita el micrófono).",
    errFileTooBig: "Archivo de más de 25 MB. Suba una grabación más corta o grabe en OrdiZapis.",
    errUploadConn:
      "Falló la conexión al enviar (frecuente con un M4A grande en el móvil). Reintente por Wi‑Fi o grabe en OrdiZapis.",
    errSegmentTooBig:
      "El segmento {n} es demasiado grande ({mb} MB). Grabe de nuevo — la app ahora parte cada 2 minutos.",
    errSegmentFailed: "Falló la transcripción del segmento {n}.",
    errSegmentEmpty: "El segmento {n} está vacío. Revise el micrófono y reintente.",
    errEmptyFile: "El archivo está vacío.",
    errTranscribe: "Falló la transcripción del archivo.",
    errEmptyTranscript: "Transcripción vacía — no se reconoció el archivo.",
    noteShareTitle: "Nota OrdiZapis",
  },
  "pt-BR": {
    accessLabel: "Acesso",
    validityLabel: "Validade",
    subscribeCta: "Assinatura",
    accountAria: "Estado da conta e validade",
    physicianFallback: "Conta médica",
    planVip: "VIP / assinatura",
    planBasic: "básico",
    notSignedIn: "Você não está conectado",
    signInLead: "Para transferência, notas e histórico, entre com uma conta médica verificada.",
    validityAfterLogin: "após o login",
    verifiedLinked: "Médico verificado — a app está ligada a esta conta",
    signOut: "Sair",
    verifyAccount: "Verificar a conta médica",
    subscribeOrdi: "Assinatura OrdiZapis (390 Kč)",
    installTitle: "Instalar a app",
    installLead:
      "A transferência do OrdiZapis está ligada à sua conta MedScopeGlobal verificada — o histórico sincroniza.",
    backToMarketing: "Voltar à página do produto",
    loadingAccount: "A carregar a conta…",
    statusLabel: "Estado",
    online: "Online",
    offline: "Offline",
    errConsent: "Confirme primeiro o consentimento da gravação.",
    errEmptyRec: "A gravação está vazia — o microfone não captou nada. Autorize o microfone e tente de novo.",
    errTooLarge:
      "A gravação é demasiado grande. Tente um trecho mais curto — a app agora parte a cada 2 min.",
    errNeedLogin: "Tem de iniciar sessão para processar.",
    errServerHttp: "Falha no servidor (HTTP {status}). Tente de novo daqui a pouco.",
    errUnexpectedHttp: "Resposta inesperada do servidor (HTTP {status}). Tente de novo.",
    errStructure: "Falha ao montar a nota.",
    errStructureRetry: "Não foi possível montar a nota. Tente gravar de novo.",
    errProcessRec: "Falha no processamento. Tente um trecho mais curto ou Enviar um ficheiro.",
    errProcessFile: "Falha ao processar o ficheiro.",
    errCopy: "Falha ao copiar para a área de transferência.",
    errNothingToCopy: "Ainda não há nada para copiar — crie uma nota.",
    errMicBlocked:
      "O microfone está bloqueado. No telefone: Definições → OrdiZapis / Safari / Chrome → Microfone → Permitir, depois « Permitir microfone ».",
    errMicMissing: "Microfone não encontrado. Confirme que o aparelho tem um e que outra app não o está a usar.",
    errMicGeneric: "Não foi possível obter o microfone. Autorize o acesso e tente de novo.",
    errConsentMic: "Confirme primeiro o consentimento (ou autorize o microfone).",
    errFileTooBig: "Ficheiro com mais de 25 MB. Envie uma gravação mais curta ou grave no OrdiZapis.",
    errUploadConn:
      "A ligação falhou no envio (comum com M4A grandes no telemóvel). Tente em Wi‑Fi ou grave no OrdiZapis.",
    errSegmentTooBig:
      "O segmento {n} é demasiado grande ({mb} MB). Grave de novo — a app agora parte a cada 2 min.",
    errSegmentFailed: "A transcrição do segmento {n} falhou.",
    errSegmentEmpty: "O segmento {n} está vazio. Verifique o microfone e tente de novo.",
    errEmptyFile: "O ficheiro está vazio.",
    errTranscribe: "A transcrição do ficheiro falhou.",
    errEmptyTranscript: "Transcrição vazia — o ficheiro não foi reconhecido.",
    noteShareTitle: "Nota OrdiZapis",
  },
  en: {
    accessLabel: "Access",
    validityLabel: "Validity",
    subscribeCta: "Subscribe",
    accountAria: "Account status and validity",
    physicianFallback: "Physician account",
    planVip: "VIP / subscription",
    planBasic: "basic",
    notSignedIn: "You are not signed in",
    signInLead: "To download, take notes and see history, sign in with a verified physician account.",
    validityAfterLogin: "after sign-in",
    verifiedLinked: "Verified physician — the app is linked to this account",
    signOut: "Sign out",
    verifyAccount: "Verify physician account",
    subscribeOrdi: "OrdiZapis subscription (390 Kč)",
    installTitle: "Install the app",
    installLead:
      "The OrdiZapis download is tied to your verified MedScopeGlobal account — history stays in sync.",
    backToMarketing: "Back to the product page",
    loadingAccount: "Loading account…",
    statusLabel: "Status",
    online: "Online",
    offline: "Offline",
    errConsent: "Confirm recording consent first.",
    errEmptyRec: "The recording is empty — the microphone captured nothing. Allow the microphone and try again.",
    errTooLarge:
      "The recording is too large. Try a shorter clip — the app now splits every 2 minutes.",
    errNeedLogin: "Sign in to process the recording.",
    errServerHttp: "Server processing failed (HTTP {status}). Try again in a moment.",
    errUnexpectedHttp: "Unexpected server response (HTTP {status}). Try again.",
    errStructure: "Failed to assemble the note.",
    errStructureRetry: "The note could not be assembled. Try recording again.",
    errProcessRec: "Processing failed. Try a shorter clip or Upload a file.",
    errProcessFile: "File processing failed.",
    errCopy: "Could not copy to the clipboard.",
    errNothingToCopy: "Nothing to copy yet — create a note first.",
    errMicBlocked:
      "The microphone is blocked. On the phone: Settings → OrdiZapis / Safari / Chrome → Microphone → Allow, then tap “Allow microphone” again.",
    errMicMissing: "No microphone found. Check that the device has one and that another app is not using it.",
    errMicGeneric: "Could not access the microphone. Allow access and try again.",
    errConsentMic: "Confirm recording consent first (or allow the microphone).",
    errFileTooBig: "File is larger than 25 MB. Upload a shorter recording or record in OrdiZapis.",
    errUploadConn:
      "The upload connection failed (common with a large M4A on mobile). Retry on Wi‑Fi, or record in OrdiZapis.",
    errSegmentTooBig:
      "Segment {n} is too large ({mb} MB). Record again — the app now splits every 2 minutes.",
    errSegmentFailed: "Transcription of segment {n} failed.",
    errSegmentEmpty: "Segment {n} came back empty. Check the microphone and try again.",
    errEmptyFile: "The file is empty.",
    errTranscribe: "File transcription failed.",
    errEmptyTranscript: "Transcript is empty — the file was not recognised.",
    noteShareTitle: "OrdiZapis note",
  },
};

export function getOrdiZapisAppCopy(locale?: string | null): OrdiZapisAppCopy {
  const pack = chromePack(locale);
  return { ...PACK[pack], ...ACCOUNT[pack] };
}

export function ordizapisAppHref(locale?: string | null): string {
  const loc = normalizeLocale(locale || "cs");
  if (chromePack(loc) === "cs") return "/app/dokumentace";
  return `/app/dokumentace?locale=${encodeURIComponent(loc)}`;
}

export function ordizapisLoginHref(locale?: string | null): string {
  const loc = normalizeLocale(locale || "cs");
  const login = localizePublicHref("/login", loc);
  return `${login}?next=${encodeURIComponent(ordizapisAppHref(loc))}`;
}

export function ordizapisSubscribeHref(locale?: string | null): string {
  return localizePublicHref("/predplatne#dokumentace", normalizeLocale(locale || "cs"));
}
