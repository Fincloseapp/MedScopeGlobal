/**
 * OrdiZapis PWA chrome (shell, gate, guide, history).
 * Clinical note language lives in lib/lekari/dokumentace/note-language.ts.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { normalizeLocale } from "@/lib/i18n/config";

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
};

const PACK: Record<ChromePack, OrdiZapisAppCopy> = {
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
  },
};

export function getOrdiZapisAppCopy(locale?: string | null): OrdiZapisAppCopy {
  return PACK[chromePack(locale)];
}

export function ordizapisAppHref(locale?: string | null): string {
  const loc = normalizeLocale(locale || "cs");
  if (chromePack(loc) === "cs") return "/app/dokumentace";
  return `/app/dokumentace?locale=${encodeURIComponent(loc)}`;
}
