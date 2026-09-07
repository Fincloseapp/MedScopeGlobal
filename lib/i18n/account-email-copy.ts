import { SITE } from "@/lib/config/site";
import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type AccountEmailCopy = {
  signupSubject: string;
  signupGreeting: string;
  signupIntro: string;
  signupCta: string;
  signupIgnore: string;
  signupExpiry: string;
  subscriptionSubject: (plan: string) => string;
  subscriptionBody: (plan: string) => string;
  openSite: string;
};

const PACKS: Record<ChromePack, AccountEmailCopy> = {
  cs: {
    signupSubject: `Potvrďte registraci — ${SITE.name}`,
    signupGreeting: "vážený uživateli",
    signupIntro: `děkujeme za registraci na ${SITE.name}.`,
    signupCta: "Potvrdit e-mail",
    signupIgnore: "Pokud jste se neregistrovali, e-mail ignorujte.",
    signupExpiry: "Odkaz platí omezenou dobu.",
    subscriptionSubject: (plan) => `Předplatné ${plan} aktivováno`,
    subscriptionBody: (plan) => `Vaše předplatné ${SITE.name} (${plan}) je aktivní.`,
    openSite: `Otevřít ${SITE.name}`,
  },
  de: {
    signupSubject: `Registrierung bestätigen — ${SITE.name}`,
    signupGreeting: "geehrte Nutzerin, geehrter Nutzer",
    signupIntro: `danke für die Registrierung bei ${SITE.name}.`,
    signupCta: "E-Mail bestätigen",
    signupIgnore: "Wenn Sie sich nicht registriert haben, ignorieren Sie diese Nachricht.",
    signupExpiry: "Der Link ist nur begrenzt gültig.",
    subscriptionSubject: (plan) => `Abo ${plan} aktiviert`,
    subscriptionBody: (plan) => `Ihr ${SITE.name}-Abo (${plan}) ist aktiv.`,
    openSite: `${SITE.name} öffnen`,
  },
  fr: {
    signupSubject: `Confirmez votre inscription — ${SITE.name}`,
    signupGreeting: "cher lecteur, chère lectrice",
    signupIntro: `merci de vous être inscrit(e) sur ${SITE.name}.`,
    signupCta: "Confirmer l’e-mail",
    signupIgnore: "Si vous ne vous êtes pas inscrit(e), ignorez ce message.",
    signupExpiry: "Le lien expire après un délai limité.",
    subscriptionSubject: (plan) => `Abonnement ${plan} activé`,
    subscriptionBody: (plan) => `Votre abonnement ${SITE.name} (${plan}) est actif.`,
    openSite: `Ouvrir ${SITE.name}`,
  },
  it: {
    signupSubject: `Conferma la registrazione — ${SITE.name}`,
    signupGreeting: "gentile utente",
    signupIntro: `grazie per la registrazione su ${SITE.name}.`,
    signupCta: "Conferma e-mail",
    signupIgnore: "Se non ti sei registrato, ignora questo messaggio.",
    signupExpiry: "Il link è valido per un tempo limitato.",
    subscriptionSubject: (plan) => `Abbonamento ${plan} attivato`,
    subscriptionBody: (plan) => `Il tuo abbonamento ${SITE.name} (${plan}) è attivo.`,
    openSite: `Apri ${SITE.name}`,
  },
  es: {
    signupSubject: `Confirme el registro — ${SITE.name}`,
    signupGreeting: "estimado lector, estimada lectora",
    signupIntro: `gracias por registrarse en ${SITE.name}.`,
    signupCta: "Confirmar el correo",
    signupIgnore: "Si no se ha registrado, ignore este mensaje.",
    signupExpiry: "El enlace caduca en un plazo limitado.",
    subscriptionSubject: (plan) => `Suscripción ${plan} activada`,
    subscriptionBody: (plan) => `Su suscripción ${SITE.name} (${plan}) está activa.`,
    openSite: `Abrir ${SITE.name}`,
  },
  "pt-BR": {
    signupSubject: `Confirme o cadastro — ${SITE.name}`,
    signupGreeting: "prezado leitor, prezada leitora",
    signupIntro: `obrigado por se cadastrar no ${SITE.name}.`,
    signupCta: "Confirmar e-mail",
    signupIgnore: "Se você não se cadastrou, ignore esta mensagem.",
    signupExpiry: "O link vale por tempo limitado.",
    subscriptionSubject: (plan) => `Assinatura ${plan} ativada`,
    subscriptionBody: (plan) => `Sua assinatura ${SITE.name} (${plan}) está ativa.`,
    openSite: `Abrir ${SITE.name}`,
  },
  en: {
    signupSubject: `Confirm your registration — ${SITE.name}`,
    signupGreeting: "dear reader",
    signupIntro: `thank you for registering on ${SITE.name}.`,
    signupCta: "Confirm email",
    signupIgnore: "If you did not register, ignore this message.",
    signupExpiry: "The link expires after a limited time.",
    subscriptionSubject: (plan) => `${plan} subscription activated`,
    subscriptionBody: (plan) => `Your ${SITE.name} subscription (${plan}) is active.`,
    openSite: `Open ${SITE.name}`,
  },
};

export function getAccountEmailCopy(locale?: string | null): AccountEmailCopy {
  return PACKS[chromePack(locale)];
}
