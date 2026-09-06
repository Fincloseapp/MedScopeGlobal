import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type NotFoundCopy = {
  code: string;
  title: string;
  body: string;
  home: string;
  apps: string;
  dashboard: string;
  trial: string;
};

const PACK: Record<ChromePack, NotFoundCopy> = {
  cs: {
    code: "Chyba 404",
    title: "Stránka nebyla nalezena",
    body: "Požadovaná stránka na MedScopeGlobal neexistuje nebo byla přesunuta. Otevřete aplikaci, předplatné nebo úvodní stránku.",
    home: "Domů",
    apps: "Aplikace",
    dashboard: "Dashboard",
    trial: "14 dní zdarma",
  },
  de: {
    code: "Fehler 404",
    title: "Seite nicht gefunden",
    body: "Diese Seite gibt es auf MedScopeGlobal nicht oder sie wurde verschoben. Öffnen Sie eine App, das Abo oder die Startseite.",
    home: "Start",
    apps: "Apps",
    dashboard: "Dashboard",
    trial: "14 Tage kostenlos",
  },
  fr: {
    code: "Erreur 404",
    title: "Page introuvable",
    body: "Cette page n’existe pas sur MedScopeGlobal ou a été déplacée. Ouvrez une appli, l’abonnement ou l’accueil.",
    home: "Accueil",
    apps: "Applis",
    dashboard: "Tableau de bord",
    trial: "14 jours gratuits",
  },
  en: {
    code: "Error 404",
    title: "Page not found",
    body: "This page does not exist on MedScopeGlobal or it has moved. Open an app, the subscription page or the homepage.",
    home: "Home",
    apps: "Apps",
    dashboard: "Dashboard",
    trial: "14 days free",
  },
  it: {
    code: "Errore 404",
    title: "Pagina non trovata",
    body: "Questa pagina non esiste su MedScopeGlobal o è stata spostata. Apri un’app, l’abbonamento o la home.",
    home: "Home",
    apps: "App",
    dashboard: "Dashboard",
    trial: "14 giorni gratis",
  },
  es: {
    code: "Error 404",
    title: "Página no encontrada",
    body: "Esta página no existe en MedScopeGlobal o se ha movido. Abre una app, la suscripción o la portada.",
    home: "Inicio",
    apps: "Apps",
    dashboard: "Panel",
    trial: "14 días gratis",
  },
  "pt-BR": {
    code: "Erro 404",
    title: "Página não encontrada",
    body: "Esta página não existe no MedScopeGlobal ou foi movida. Abra uma app, a subscrição ou a página inicial.",
    home: "Início",
    apps: "Apps",
    dashboard: "Painel",
    trial: "14 dias grátis",
  },
};

export function getNotFoundCopy(locale?: string | null): NotFoundCopy {
  return PACK[chromePack(locale)];
}
