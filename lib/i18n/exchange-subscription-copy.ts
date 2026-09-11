import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { EXCHANGE_PLANS_SPEC } from "@/lib/exchange/monetization";
import type { ExchangePlan } from "@/lib/exchange/types";

export type ExchangeSubCopy = {
  free: string;
  paid: string;
  lockedTitle: string;
  lockedBody: string;
  upgradeCta: string;
  dashboardTitle: string;
  dashboardLead: string;
  inquiriesTitle: string;
  inquiriesLead: string;
  anonymousBadge: string;
  replyCta: string;
  replyBlocked: string;
  statsTitle: string;
  micrositeTitle: string;
  micrositeLead: string;
  importTitle: string;
  importLead: string;
  adsPaidOnly: string;
  buyerFree: string;
  planFeatures: Record<ExchangePlan, string[]>;
  activate: string;
  demoPlan: string;
  emailsTitle: string;
};

const PACK: Record<ChromePack, ExchangeSubCopy> = {
  cs: {
    free: "Zdarma",
    paid: "Placené",
    lockedTitle: "Kontakty jsou v tarifu Pro",
    lockedBody:
      "Basic vidí anonymní poptávky bez jména, e-mailu a telefonu a nemůže odpovídat. Kupující posílá poptávku zdarma — bez registrace.",
    upgradeCta: "Odemknout Pro",
    dashboardTitle: "Firemní dashboard",
    dashboardLead: "Nabídky, poptávky, statistiky a předplatné. Jediný příjem platformy je předplatné — žádná provize z obchodu.",
    inquiriesTitle: "Poptávky",
    inquiriesLead: "Platící inzerent vidí kontakty a odpovídá napřímo. Basic vidí jen anonymní náhled.",
    anonymousBadge: "Anonymní náhled",
    replyCta: "Odpovědět",
    replyBlocked: "Odpovědi jsou v tarifu Pro.",
    statsTitle: "Statistiky",
    micrositeTitle: "Enterprise microsite",
    micrositeLead: "Vlastní branded stránka organizace. Dostupné v tarifu Enterprise.",
    importTitle: "API import",
    importLead: "Hromadný import nabídek JSON. Pouze Enterprise.",
    adsPaidOnly: "Reklamní balíčky jen pro platící inzerenty.",
    buyerFree: "Kupující neplatí nic a nemusí se registrovat.",
    planFeatures: {
      basic: ["Nabídky ano", "Poptávky anonymně", "Bez kontaktů", "Bez odpovědí", "Bez reklamy"],
      pro: ["Poptávky s kontakty", "Odpovědi napřímo", "Zvýraznění", "Statistiky", "Regionální inbox"],
      enterprise: ["Vše z Pro", "Microsite", "API import", "Reklamní kredity", "Prémiové poptávky"],
    },
    activate: "Aktivovat",
    demoPlan: "Ukázkový tarif",
    emailsTitle: "Onboarding e-maily",
  },
  en: {
    free: "Free",
    paid: "Paid",
    lockedTitle: "Contacts unlock on Pro",
    lockedBody:
      "Basic sees anonymous inquiries without name, email or phone and cannot reply. Buyers send inquiries free — no registration.",
    upgradeCta: "Unlock Pro",
    dashboardTitle: "Company dashboard",
    dashboardLead: "Listings, inquiries, stats and billing. The only platform revenue is the subscription — no deal commission.",
    inquiriesTitle: "Inquiries",
    inquiriesLead: "Paying advertisers see contacts and reply directly. Basic sees an anonymous teaser.",
    anonymousBadge: "Anonymous preview",
    replyCta: "Reply",
    replyBlocked: "Replies require Pro.",
    statsTitle: "Statistics",
    micrositeTitle: "Enterprise microsite",
    micrositeLead: "Branded organisation page. Enterprise only.",
    importTitle: "API import",
    importLead: "Bulk JSON listing import. Enterprise only.",
    adsPaidOnly: "Ad packs are for paying advertisers only.",
    buyerFree: "Buyers pay nothing and need no account.",
    planFeatures: {
      basic: ["Listings yes", "Anonymous inquiries", "No contacts", "No replies", "No ads"],
      pro: ["Inquiries with contacts", "Direct replies", "Featuring", "Statistics", "Regional inbox"],
      enterprise: ["Everything in Pro", "Microsite", "API import", "Ad credits", "Premium inquiries"],
    },
    activate: "Activate",
    demoPlan: "Demo plan",
    emailsTitle: "Onboarding emails",
  },
  de: {
    free: "Kostenlos",
    paid: "Kostenpflichtig",
    lockedTitle: "Kontakte ab Pro",
    lockedBody: "Basic sieht anonyme Anfragen ohne Name, E-Mail und Telefon und kann nicht antworten.",
    upgradeCta: "Pro freischalten",
    dashboardTitle: "Firmen-Dashboard",
    dashboardLead: "Inserate, Anfragen, Statistik. Einzige Einnahme: das Abo — keine Handelsprovision.",
    inquiriesTitle: "Anfragen",
    inquiriesLead: "Zahlende Inserenten sehen Kontakte. Basic nur anonym.",
    anonymousBadge: "Anonyme Vorschau",
    replyCta: "Antworten",
    replyBlocked: "Antworten erfordern Pro.",
    statsTitle: "Statistik",
    micrositeTitle: "Enterprise-Microsite",
    micrositeLead: "Gebrandete Organisationsseite. Nur Enterprise.",
    importTitle: "API-Import",
    importLead: "JSON-Import. Nur Enterprise.",
    adsPaidOnly: "Werbepakete nur für zahlende Inserenten.",
    buyerFree: "Käufer zahlen nichts und brauchen kein Konto.",
    planFeatures: {
      basic: ["Inserate ja", "Anfragen anonym", "Keine Kontakte", "Keine Antworten", "Keine Werbung"],
      pro: ["Anfragen mit Kontakt", "Direktantworten", "Hervorhebung", "Statistik", "Regionale Inbox"],
      enterprise: ["Alles aus Pro", "Microsite", "API-Import", "Werbekredite", "Premium-Anfragen"],
    },
    activate: "Aktivieren",
    demoPlan: "Demo-Tarif",
    emailsTitle: "Onboarding-E-Mails",
  },
  fr: {
    free: "Gratuit",
    paid: "Payant",
    lockedTitle: "Contacts dès Pro",
    lockedBody: "Basic voit des demandes anonymes sans nom, e-mail ni téléphone et ne peut pas répondre.",
    upgradeCta: "Débloquer Pro",
    dashboardTitle: "Tableau de bord",
    dashboardLead: "Offres, demandes, stats. Seul revenu : l’abonnement — aucune commission sur l’affaire.",
    inquiriesTitle: "Demandes",
    inquiriesLead: "Les annonceurs payants voient les contacts. Basic : aperçu anonyme.",
    anonymousBadge: "Aperçu anonyme",
    replyCta: "Répondre",
    replyBlocked: "Les réponses exigent Pro.",
    statsTitle: "Statistiques",
    micrositeTitle: "Microsite Enterprise",
    micrositeLead: "Page organisation. Enterprise uniquement.",
    importTitle: "Import API",
    importLead: "Import JSON. Enterprise uniquement.",
    adsPaidOnly: "Packs pub réservés aux annonceurs payants.",
    buyerFree: "L’acheteur ne paie rien et n’a pas de compte.",
    planFeatures: {
      basic: ["Offres oui", "Demandes anonymes", "Pas de contacts", "Pas de réponses", "Pas de pub"],
      pro: ["Demandes avec contacts", "Réponses directes", "Mise en avant", "Stats", "Boîte régionale"],
      enterprise: ["Tout Pro", "Microsite", "Import API", "Crédits pub", "Demandes premium"],
    },
    activate: "Activer",
    demoPlan: "Tarif démo",
    emailsTitle: "E-mails d’onboarding",
  },
  it: {
    free: "Gratis",
    paid: "A pagamento",
    lockedTitle: "Contatti da Pro",
    lockedBody: "Basic vede richieste anonime senza nome, e-mail e telefono e non può rispondere.",
    upgradeCta: "Sblocca Pro",
    dashboardTitle: "Dashboard aziendale",
    dashboardLead: "Offerte, richieste, stats. Unico ricavo: l’abbonamento.",
    inquiriesTitle: "Richieste",
    inquiriesLead: "Gli inserzionisti paganti vedono i contatti. Basic: anteprima anonima.",
    anonymousBadge: "Anteprima anonima",
    replyCta: "Rispondi",
    replyBlocked: "Le risposte richiedono Pro.",
    statsTitle: "Statistiche",
    micrositeTitle: "Microsite Enterprise",
    micrositeLead: "Pagina organizzazione. Solo Enterprise.",
    importTitle: "Import API",
    importLead: "Import JSON. Solo Enterprise.",
    adsPaidOnly: "Pacchetti ads solo per inserzionisti paganti.",
    buyerFree: "L’acquirente non paga e non serve un account.",
    planFeatures: {
      basic: ["Offerte sì", "Richieste anonime", "Niente contatti", "Niente risposte", "Niente ads"],
      pro: ["Richieste con contatti", "Risposte dirette", "In evidenza", "Statistiche", "Inbox regionale"],
      enterprise: ["Tutto Pro", "Microsite", "Import API", "Crediti ads", "Richieste premium"],
    },
    activate: "Attiva",
    demoPlan: "Piano demo",
    emailsTitle: "Email di onboarding",
  },
  es: {
    free: "Gratis",
    paid: "De pago",
    lockedTitle: "Contactos en Pro",
    lockedBody: "Basic ve solicitudes anónimas sin nombre, correo ni teléfono y no puede responder.",
    upgradeCta: "Desbloquear Pro",
    dashboardTitle: "Panel de empresa",
    dashboardLead: "Ofertas, solicitudes, stats. Único ingreso: la suscripción.",
    inquiriesTitle: "Solicitudes",
    inquiriesLead: "Los anunciantes de pago ven contactos. Basic: vista anónima.",
    anonymousBadge: "Vista anónima",
    replyCta: "Responder",
    replyBlocked: "Responder exige Pro.",
    statsTitle: "Estadísticas",
    micrositeTitle: "Microsite Enterprise",
    micrositeLead: "Página de organización. Solo Enterprise.",
    importTitle: "Importación API",
    importLead: "Import JSON. Solo Enterprise.",
    adsPaidOnly: "Paquetes de anuncios solo para anunciantes de pago.",
    buyerFree: "El comprador no paga y no necesita cuenta.",
    planFeatures: {
      basic: ["Ofertas sí", "Solicitudes anónimas", "Sin contactos", "Sin respuestas", "Sin anuncios"],
      pro: ["Solicitudes con contacto", "Respuestas directas", "Destacados", "Estadísticas", "Bandeja regional"],
      enterprise: ["Todo Pro", "Microsite", "Import API", "Créditos ads", "Solicitudes premium"],
    },
    activate: "Activar",
    demoPlan: "Plan demo",
    emailsTitle: "Correos de onboarding",
  },
  "pt-BR": {
    free: "Grátis",
    paid: "Pago",
    lockedTitle: "Contactos no Pro",
    lockedBody: "Basic vê pedidos anónimos sem nome, e-mail ou telefone e não pode responder.",
    upgradeCta: "Desbloquear Pro",
    dashboardTitle: "Painel da empresa",
    dashboardLead: "Ofertas, pedidos, stats. Única receita: a subscrição.",
    inquiriesTitle: "Pedidos",
    inquiriesLead: "Anunciantes pagantes vêem contactos. Basic: pré-visualização anónima.",
    anonymousBadge: "Pré-visualização anónima",
    replyCta: "Responder",
    replyBlocked: "Respostas exigem Pro.",
    statsTitle: "Estatísticas",
    micrositeTitle: "Microsite Enterprise",
    micrositeLead: "Página da organização. Só Enterprise.",
    importTitle: "Importação API",
    importLead: "Import JSON. Só Enterprise.",
    adsPaidOnly: "Pacotes de anúncios só para anunciantes pagantes.",
    buyerFree: "O comprador não paga e não precisa de conta.",
    planFeatures: {
      basic: ["Ofertas sim", "Pedidos anónimos", "Sem contactos", "Sem respostas", "Sem anúncios"],
      pro: ["Pedidos com contacto", "Respostas diretas", "Destaque", "Estatísticas", "Caixa regional"],
      enterprise: ["Tudo do Pro", "Microsite", "Import API", "Créditos ads", "Pedidos premium"],
    },
    activate: "Ativar",
    demoPlan: "Plano demo",
    emailsTitle: "E-mails de onboarding",
  },
};

export function getExchangeSubCopy(locale?: string | null): ExchangeSubCopy {
  return PACK[chromePack(locale)];
}

export function planPriceLabel(plan: ExchangePlan, freeLabel: string, onRequest: string) {
  const spec = EXCHANGE_PLANS_SPEC[plan];
  if (!spec.paid) return freeLabel;
  if (spec.monthlyCzk === 0) return onRequest;
  return spec.monthlyCzk;
}
