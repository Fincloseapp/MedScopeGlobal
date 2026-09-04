/**
 * OrdiZapis server / eligibility copy.
 * Never fall back to Czech on a non-CS edition.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { intlLocaleFor } from "@/lib/i18n/format-date";

export type OrdiZapisApiCopy = {
  unauthMessage: string;
  unauthShort: string;
  hostLabel: string;
  notSignedIn: string;
  accountUnavailable: string;
  accountMedscope: string;
  cannotVerify: string;
  checkConnection: string;
  notVerifiedMessage: string;
  waitingVerification: string;
  planPhysicianSub: string;
  planVerified: string;
  linkedNamed: string;
  linkedFacilities: string;
  verifiedPhysicianName: string;
  physicianName: string;
  validityAfterLogin: string;
  validityExpired: string;
  validityUntil: string;
  validityActiveNoEnd: string;
  validityLimited: string;
  quotaDemo: string;
  quotaVip: string;
  qrVerifiedOnly: string;
  errLoginRequired: string;
  errInvalidInput: string;
  errNoteNotFound: string;
  errSaveFailed: string;
  errMissingAudio: string;
  errEmptyTranscript: string;
  errEmptyFile: string;
  errSegmentLimit: string;
  errBadForm: string;
  errBadProcessFile: string;
  errBadPath: string;
};

const PACK: Record<ChromePack, OrdiZapisApiCopy> = {
  cs: {
    unauthMessage:
      "Pro stažení a používání OrdiZapis od MedScopeGlobal se přihlaste ověřeným lékařským účtem.",
    unauthShort: "Pro OrdiZapis od MedScopeGlobal se musíte přihlásit.",
    hostLabel: "Host · vyžaduje ověřeného lékaře",
    notSignedIn: "Nepřihlášeni",
    accountUnavailable: "Nepodařilo se ověřit účet. Zkuste to znovu.",
    accountMedscope: "Účet MedScope",
    cannotVerify: "Nelze ověřit",
    checkConnection: "zkontrolujte připojení",
    notVerifiedMessage:
      "Stažení a plné používání OrdiZapis je jen pro ověřené lékaře (nebo účet zdravotnického zařízení). Dokončete ověření v Lékařské zóně.",
    waitingVerification: "Čeká na ověření lékaře",
    planPhysicianSub: "Lékař · předplatné OrdiZapis",
    planVerified: "Ověřený lékařský účet",
    linkedNamed: "Účet propojen: {name}",
    linkedFacilities: "Účet propojen: {name} · {facilities}",
    verifiedPhysicianName: "ověřený lékař",
    physicianName: "lékař",
    validityAfterLogin: "po přihlášení",
    validityExpired: "vypršelo {date}",
    validityUntil: "do {date}",
    validityActiveNoEnd: "aktivní (bez data konce)",
    validityLimited: "omezený přístup",
    quotaDemo:
      "Vyčerpán denní demo limit (3 zápisy). Předplatné OrdiZapis nebo Lékař v praxi odemyká až 40 zápisů denně.",
    quotaVip: "Vyčerpán denní limit OrdiZapis (40 zápisů / 24 h). Zkuste později.",
    qrVerifiedOnly: "QR pro stažení je jen pro ověřené lékaře.",
    errLoginRequired: "Přihlášení vyžadováno.",
    errInvalidInput: "Neplatný vstup.",
    errNoteNotFound: "Zápis nenalezen.",
    errSaveFailed: "Uložení zápisu selhalo.",
    errMissingAudio: "Chybí audio soubor (pole audio nebo file).",
    errEmptyTranscript: "Přepis je prázdný — nahrávka se nepřenášla nebo mikrofon nic nezachytil.",
    errEmptyFile: "Přepis je prázdný — soubor se nepodařilo rozpoznat.",
    errSegmentLimit:
      "Segment {n} přesahuje limit 25 MB. Nahrajte kratší úsek nebo použijte automatické dělení.",
    errBadForm: "Neplatný multipart formulář.",
    errBadProcessFile: "Neplatný vstup process-file.",
    errBadPath: "Neplatná cesta souboru.",
  },
  de: {
    unauthMessage:
      "Für Download und Nutzung von OrdiZapis (MedScopeGlobal) mit einem verifizierten Arztkonto anmelden.",
    unauthShort: "Für OrdiZapis von MedScopeGlobal müssen Sie sich anmelden.",
    hostLabel: "Gast · verifiziertes Arztkonto nötig",
    notSignedIn: "Nicht angemeldet",
    accountUnavailable: "Konto konnte nicht geprüft werden. Bitte erneut versuchen.",
    accountMedscope: "MedScope-Konto",
    cannotVerify: "Nicht prüfbar",
    checkConnection: "Verbindung prüfen",
    notVerifiedMessage:
      "Download und volle Nutzung von OrdiZapis nur für verifizierte Ärztinnen und Ärzte (oder eine Einrichtung). Verifizierung in der Arztzone abschließen.",
    waitingVerification: "Wartet auf Arztverifizierung",
    planPhysicianSub: "Arzt · OrdiZapis-Abo",
    planVerified: "Verifiziertes Arztkonto",
    linkedNamed: "Konto verbunden: {name}",
    linkedFacilities: "Konto verbunden: {name} · {facilities}",
    verifiedPhysicianName: "verifiziertes Arztkonto",
    physicianName: "Arztkonto",
    validityAfterLogin: "nach der Anmeldung",
    validityExpired: "abgelaufen {date}",
    validityUntil: "bis {date}",
    validityActiveNoEnd: "aktiv (ohne Enddatum)",
    validityLimited: "eingeschränkter Zugang",
    quotaDemo:
      "Tageslimit der Demo (3 Notizen) erreicht. Das OrdiZapis-Abo oder der Praxis-Tarif öffnet bis zu 40 Notizen pro Tag.",
    quotaVip: "Tageslimit OrdiZapis erreicht (40 Notizen / 24 h). Später erneut versuchen.",
    qrVerifiedOnly: "Der Download-QR ist nur für verifizierte Ärztinnen und Ärzte.",
    errLoginRequired: "Anmeldung erforderlich.",
    errInvalidInput: "Ungültige Eingabe.",
    errNoteNotFound: "Notiz nicht gefunden.",
    errSaveFailed: "Speichern der Notiz fehlgeschlagen.",
    errMissingAudio: "Audiodatei fehlt (Feld audio oder file).",
    errEmptyTranscript: "Transkription ist leer — Aufnahme nicht übertragen oder Mikrofon ohne Signal.",
    errEmptyFile: "Transkription ist leer — Datei nicht erkannt.",
    errSegmentLimit:
      "Segment {n} überschreitet 25 MB. Kürzeren Abschnitt wählen oder die automatische Teilung nutzen.",
    errBadForm: "Ungültiges Multipart-Formular.",
    errBadProcessFile: "Ungültige process-file-Eingabe.",
    errBadPath: "Ungültiger Dateipfad.",
  },
  fr: {
    unauthMessage:
      "Pour télécharger et utiliser OrdiZapis (MedScopeGlobal), connectez-vous avec un compte médecin vérifié.",
    unauthShort: "Connectez-vous pour OrdiZapis de MedScopeGlobal.",
    hostLabel: "Invité · compte médecin vérifié requis",
    notSignedIn: "Non connecté",
    accountUnavailable: "Impossible de vérifier le compte. Réessayez.",
    accountMedscope: "Compte MedScope",
    cannotVerify: "Vérification impossible",
    checkConnection: "vérifiez la connexion",
    notVerifiedMessage:
      "Le téléchargement et l’usage complet d’OrdiZapis sont réservés aux médecins vérifiés (ou à un établissement). Terminez la vérification dans l’espace médecin.",
    waitingVerification: "En attente de vérification médecin",
    planPhysicianSub: "Médecin · abonnement OrdiZapis",
    planVerified: "Compte médecin vérifié",
    linkedNamed: "Compte lié : {name}",
    linkedFacilities: "Compte lié : {name} · {facilities}",
    verifiedPhysicianName: "médecin vérifié",
    physicianName: "médecin",
    validityAfterLogin: "après connexion",
    validityExpired: "expiré le {date}",
    validityUntil: "jusqu’au {date}",
    validityActiveNoEnd: "actif (sans date de fin)",
    validityLimited: "accès limité",
    quotaDemo:
      "Quota démo du jour atteint (3 notes). L’abonnement OrdiZapis ou l’offre médecin en exercice ouvre jusqu’à 40 notes par jour.",
    quotaVip: "Quota OrdiZapis du jour atteint (40 notes / 24 h). Réessayez plus tard.",
    qrVerifiedOnly: "Le QR de téléchargement est réservé aux médecins vérifiés.",
    errLoginRequired: "Connexion requise.",
    errInvalidInput: "Entrée invalide.",
    errNoteNotFound: "Note introuvable.",
    errSaveFailed: "Échec de l’enregistrement de la note.",
    errMissingAudio: "Fichier audio manquant (champ audio ou file).",
    errEmptyTranscript: "Transcription vide — l’enregistrement ne s’est pas transmis ou le micro n’a rien capté.",
    errEmptyFile: "Transcription vide — le fichier n’a pas été reconnu.",
    errSegmentLimit:
      "Le segment {n} dépasse 25 Mo. Envoyez un passage plus court ou utilisez le découpage automatique.",
    errBadForm: "Formulaire multipart invalide.",
    errBadProcessFile: "Entrée process-file invalide.",
    errBadPath: "Chemin de fichier invalide.",
  },
  it: {
    unauthMessage:
      "Per scaricare e usare OrdiZapis (MedScopeGlobal) accedete con un account medico verificato.",
    unauthShort: "Accedete per OrdiZapis di MedScopeGlobal.",
    hostLabel: "Ospite · serve un account medico verificato",
    notSignedIn: "Non connessi",
    accountUnavailable: "Impossibile verificare l’account. Riprovate.",
    accountMedscope: "Account MedScope",
    cannotVerify: "Verifica non riuscita",
    checkConnection: "controllate la connessione",
    notVerifiedMessage:
      "Download e uso completo di OrdiZapis solo per medici verificati (o una struttura). Completate la verifica nell’area medici.",
    waitingVerification: "In attesa di verifica medica",
    planPhysicianSub: "Medico · abbonamento OrdiZapis",
    planVerified: "Account medico verificato",
    linkedNamed: "Account collegato: {name}",
    linkedFacilities: "Account collegato: {name} · {facilities}",
    verifiedPhysicianName: "medico verificato",
    physicianName: "medico",
    validityAfterLogin: "dopo l’accesso",
    validityExpired: "scaduto il {date}",
    validityUntil: "fino al {date}",
    validityActiveNoEnd: "attivo (senza data di fine)",
    validityLimited: "accesso limitato",
    quotaDemo:
      "Quota demo del giorno esaurita (3 note). L’abbonamento OrdiZapis o il piano medico in pratica apre fino a 40 note al giorno.",
    quotaVip: "Quota OrdiZapis del giorno esaurita (40 note / 24 h). Riprovate più tardi.",
    qrVerifiedOnly: "Il QR per il download è solo per medici verificati.",
    errLoginRequired: "Accesso richiesto.",
    errInvalidInput: "Dati non validi.",
    errNoteNotFound: "Nota non trovata.",
    errSaveFailed: "Salvataggio della nota non riuscito.",
    errMissingAudio: "Manca il file audio (campo audio o file).",
    errEmptyTranscript: "Trascrizione vuota — la registrazione non è arrivata o il microfono non ha catturato nulla.",
    errEmptyFile: "Trascrizione vuota — il file non è stato riconosciuto.",
    errSegmentLimit:
      "Il segmento {n} supera i 25 MB. Caricate un tratto più breve o usate la suddivisione automatica.",
    errBadForm: "Modulo multipart non valido.",
    errBadProcessFile: "Dati process-file non validi.",
    errBadPath: "Percorso file non valido.",
  },
  es: {
    unauthMessage:
      "Para descargar y usar OrdiZapis (MedScopeGlobal), entre con una cuenta médica verificada.",
    unauthShort: "Inicie sesión para OrdiZapis de MedScopeGlobal.",
    hostLabel: "Invitado · se requiere cuenta médica verificada",
    notSignedIn: "Sin sesión",
    accountUnavailable: "No se pudo verificar la cuenta. Reintente.",
    accountMedscope: "Cuenta MedScope",
    cannotVerify: "No se puede verificar",
    checkConnection: "compruebe la conexión",
    notVerifiedMessage:
      "La descarga y el uso completo de OrdiZapis son solo para médicos verificados (o un centro). Termine la verificación en la zona médica.",
    waitingVerification: "Pendiente de verificación médica",
    planPhysicianSub: "Médico · suscripción OrdiZapis",
    planVerified: "Cuenta médica verificada",
    linkedNamed: "Cuenta vinculada: {name}",
    linkedFacilities: "Cuenta vinculada: {name} · {facilities}",
    verifiedPhysicianName: "médico verificado",
    physicianName: "médico",
    validityAfterLogin: "tras iniciar sesión",
    validityExpired: "caducó el {date}",
    validityUntil: "hasta el {date}",
    validityActiveNoEnd: "activo (sin fecha de fin)",
    validityLimited: "acceso limitado",
    quotaDemo:
      "Cupo demo del día agotado (3 notas). La suscripción OrdiZapis o el plan de médico en ejercicio abre hasta 40 notas al día.",
    quotaVip: "Cupo OrdiZapis del día agotado (40 notas / 24 h). Reintente más tarde.",
    qrVerifiedOnly: "El QR de descarga es solo para médicos verificados.",
    errLoginRequired: "Inicio de sesión requerido.",
    errInvalidInput: "Entrada no válida.",
    errNoteNotFound: "Nota no encontrada.",
    errSaveFailed: "No se pudo guardar la nota.",
    errMissingAudio: "Falta el archivo de audio (campo audio o file).",
    errEmptyTranscript: "Transcripción vacía — la grabación no se transmitió o el micrófono no captó nada.",
    errEmptyFile: "Transcripción vacía — no se reconoció el archivo.",
    errSegmentLimit:
      "El segmento {n} supera 25 MB. Suba un tramo más corto o use el corte automático.",
    errBadForm: "Formulario multipart no válido.",
    errBadProcessFile: "Entrada process-file no válida.",
    errBadPath: "Ruta de archivo no válida.",
  },
  "pt-BR": {
    unauthMessage:
      "Para transferir e usar o OrdiZapis (MedScopeGlobal), entre com uma conta médica verificada.",
    unauthShort: "Entre para o OrdiZapis da MedScopeGlobal.",
    hostLabel: "Convidado · é precisa uma conta médica verificada",
    notSignedIn: "Sem sessão",
    accountUnavailable: "Não foi possível verificar a conta. Tente de novo.",
    accountMedscope: "Conta MedScope",
    cannotVerify: "Não é possível verificar",
    checkConnection: "verifique a ligação",
    notVerifiedMessage:
      "A transferência e o uso completo do OrdiZapis são só para médicos verificados (ou uma instituição). Conclua a verificação na zona médica.",
    waitingVerification: "A aguardar verificação médica",
    planPhysicianSub: "Médico · assinatura OrdiZapis",
    planVerified: "Conta médica verificada",
    linkedNamed: "Conta ligada: {name}",
    linkedFacilities: "Conta ligada: {name} · {facilities}",
    verifiedPhysicianName: "médico verificado",
    physicianName: "médico",
    validityAfterLogin: "após o login",
    validityExpired: "expirou em {date}",
    validityUntil: "até {date}",
    validityActiveNoEnd: "ativo (sem data de fim)",
    validityLimited: "acesso limitado",
    quotaDemo:
      "Limite demo do dia esgotado (3 notas). A assinatura OrdiZapis ou o plano médico em prática abre até 40 notas por dia.",
    quotaVip: "Limite OrdiZapis do dia esgotado (40 notas / 24 h). Tente mais tarde.",
    qrVerifiedOnly: "O QR de transferência é só para médicos verificados.",
    errLoginRequired: "Início de sessão necessário.",
    errInvalidInput: "Entrada inválida.",
    errNoteNotFound: "Nota não encontrada.",
    errSaveFailed: "Falha ao guardar a nota.",
    errMissingAudio: "Falta o ficheiro de áudio (campo audio ou file).",
    errEmptyTranscript: "Transcrição vazia — a gravação não chegou ou o microfone não captou nada.",
    errEmptyFile: "Transcrição vazia — o ficheiro não foi reconhecido.",
    errSegmentLimit:
      "O segmento {n} ultrapassa 25 MB. Envie um trecho mais curto ou use a divisão automática.",
    errBadForm: "Formulário multipart inválido.",
    errBadProcessFile: "Entrada process-file inválida.",
    errBadPath: "Caminho de ficheiro inválido.",
  },
  en: {
    unauthMessage:
      "To download and use OrdiZapis from MedScopeGlobal, sign in with a verified physician account.",
    unauthShort: "Sign in to use OrdiZapis from MedScopeGlobal.",
    hostLabel: "Guest · verified physician account required",
    notSignedIn: "Not signed in",
    accountUnavailable: "Could not verify the account. Try again.",
    accountMedscope: "MedScope account",
    cannotVerify: "Cannot verify",
    checkConnection: "check the connection",
    notVerifiedMessage:
      "Download and full use of OrdiZapis are for verified physicians (or a facility account). Finish verification in the physician zone.",
    waitingVerification: "Waiting for physician verification",
    planPhysicianSub: "Physician · OrdiZapis subscription",
    planVerified: "Verified physician account",
    linkedNamed: "Account linked: {name}",
    linkedFacilities: "Account linked: {name} · {facilities}",
    verifiedPhysicianName: "verified physician",
    physicianName: "physician",
    validityAfterLogin: "after sign-in",
    validityExpired: "expired {date}",
    validityUntil: "until {date}",
    validityActiveNoEnd: "active (no end date)",
    validityLimited: "limited access",
    quotaDemo:
      "Daily demo limit reached (3 notes). An OrdiZapis subscription or the practicing-physician plan unlocks up to 40 notes a day.",
    quotaVip: "Daily OrdiZapis limit reached (40 notes / 24 h). Try again later.",
    qrVerifiedOnly: "The download QR is for verified physicians only.",
    errLoginRequired: "Sign-in required.",
    errInvalidInput: "Invalid input.",
    errNoteNotFound: "Note not found.",
    errSaveFailed: "Could not save the note.",
    errMissingAudio: "Audio file missing (audio or file field).",
    errEmptyTranscript: "Transcript is empty — the recording did not arrive or the microphone captured nothing.",
    errEmptyFile: "Transcript is empty — the file was not recognised.",
    errSegmentLimit:
      "Segment {n} exceeds the 25 MB limit. Upload a shorter clip or use automatic splitting.",
    errBadForm: "Invalid multipart form.",
    errBadProcessFile: "Invalid process-file input.",
    errBadPath: "Invalid file path.",
  },
};

export function getOrdiZapisApiCopy(locale?: string | null): OrdiZapisApiCopy {
  return PACK[chromePack(locale)];
}

export function fillOrdiApi(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function ordiZapisValidityLabel(opts: {
  locale?: string | null;
  authenticated: boolean;
  entitled: boolean;
  endsAt: string | null;
}): string {
  const copy = getOrdiZapisApiCopy(opts.locale);
  if (!opts.authenticated) return copy.validityAfterLogin;
  if (opts.endsAt) {
    const d = new Date(opts.endsAt);
    if (!Number.isNaN(d.getTime())) {
      const date = d.toLocaleDateString(intlLocaleFor(opts.locale), {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      if (d < new Date()) return fillOrdiApi(copy.validityExpired, { date });
      return fillOrdiApi(copy.validityUntil, { date });
    }
  }
  if (opts.entitled) return copy.validityActiveNoEnd;
  return copy.validityLimited;
}
