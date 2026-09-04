/**
 * Install-to-home-screen button. Locales without a pack use English, never Czech.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type InstallPwaCopy = {
  download: string;
  downloadNamed: string;
  installed: string;
  gated: string;
  howTitle: string;
  ios1: string;
  ios2: string;
  ios3: string;
  android1: string;
  android2: string;
  android3: string;
  desktop1: string;
  desktop2: string;
  redirect: string;
  hideTip: string;
  hintIos: string;
  hintAndroid: string;
  hintDesktop: string;
};

const PACK: Record<ChromePack, InstallPwaCopy> = {
  cs: {
    download: "Stáhnout",
    downloadNamed: "Stáhnout {name}",
    installed: "Aplikace nainstalována",
    gated: "Stažení po přihlášení",
    howTitle: "Jak nainstalovat na mobil",
    ios1: "Klepněte na Sdílet v Safari",
    ios2: "Zvolte Přidat na plochu",
    ios3: "Potvrďte Přidat — ikona {name} se objeví na ploše",
    android1: "V Chrome otevřete menu ⋮ vpravo nahoře",
    android2: "Zvolte Nainstalovat aplikaci / Přidat na plochu",
    android3: "Potvrďte instalaci — {name} se otevře jako aplikace",
    desktop1: "Chrome/Edge: ikona ⊕ v adresním řádku, nebo menu → Instalovat",
    desktop2: "Nebo otevřete {name} a klepněte znovu na Stáhnout",
    redirect: "Instalace probíhá z aplikace — přesměrováváme na {path}…",
    hideTip: "Skrýt tip",
    hintIos: "iPhone: Sdílet → Přidat na plochu",
    hintAndroid: "Android: Chrome → Nainstalovat aplikaci",
    hintDesktop: "PC: Chrome/Edge → Nainstalovat aplikaci",
  },
  de: {
    download: "Laden",
    downloadNamed: "{name} laden",
    installed: "App installiert",
    gated: "Download nach Anmeldung",
    howTitle: "So installieren Sie auf dem Handy",
    ios1: "In Safari auf Teilen tippen",
    ios2: "Zum Home-Bildschirm wählen",
    ios3: "Mit Hinzufügen bestätigen — das Symbol {name} erscheint auf dem Homescreen",
    android1: "In Chrome oben rechts das Menü ⋮ öffnen",
    android2: "App installieren / Zum Startbildschirm wählen",
    android3: "Installation bestätigen — {name} öffnet sich als App",
    desktop1: "Chrome/Edge: ⊕ in der Adressleiste oder Menü → Installieren",
    desktop2: "Oder {name} öffnen und erneut auf Laden tippen",
    redirect: "Die Installation läuft in der App — Weiterleitung zu {path}…",
    hideTip: "Tipp ausblenden",
    hintIos: "iPhone: Teilen → Zum Home-Bildschirm",
    hintAndroid: "Android: Chrome → App installieren",
    hintDesktop: "PC: Chrome/Edge → App installieren",
  },
  fr: {
    download: "Télécharger",
    downloadNamed: "Télécharger {name}",
    installed: "Application installée",
    gated: "Téléchargement après connexion",
    howTitle: "Installer sur le téléphone",
    ios1: "Dans Safari, touchez Partager",
    ios2: "Choisissez Sur l’écran d’accueil",
    ios3: "Confirmez Ajouter — l’icône {name} apparaît sur l’écran",
    android1: "Dans Chrome, ouvrez le menu ⋮ en haut à droite",
    android2: "Choisissez Installer l’application / Ajouter à l’écran d’accueil",
    android3: "Confirmez — {name} s’ouvre comme une appli",
    desktop1: "Chrome/Edge : icône ⊕ dans la barre d’adresse, ou menu → Installer",
    desktop2: "Ou ouvrez {name} et touchez de nouveau Télécharger",
    redirect: "L’installation se fait depuis l’appli — redirection vers {path}…",
    hideTip: "Masquer l’astuce",
    hintIos: "iPhone : Partager → Sur l’écran d’accueil",
    hintAndroid: "Android : Chrome → Installer l’application",
    hintDesktop: "PC : Chrome/Edge → Installer l’application",
  },
  it: {
    download: "Scarica",
    downloadNamed: "Scarica {name}",
    installed: "App installata",
    gated: "Download dopo l’accesso",
    howTitle: "Come installare sul telefono",
    ios1: "In Safari tocca Condividi",
    ios2: "Scegli Aggiungi a Home",
    ios3: "Conferma Aggiungi — l’icona {name} compare sulla Home",
    android1: "In Chrome apri il menu ⋮ in alto a destra",
    android2: "Scegli Installa app / Aggiungi a Home",
    android3: "Conferma — {name} si apre come app",
    desktop1: "Chrome/Edge: icona ⊕ nella barra degli indirizzi, oppure menu → Installa",
    desktop2: "Oppure apri {name} e tocca di nuovo Scarica",
    redirect: "L’installazione avviene dall’app — reindirizzamento a {path}…",
    hideTip: "Nascondi il suggerimento",
    hintIos: "iPhone: Condividi → Aggiungi a Home",
    hintAndroid: "Android: Chrome → Installa app",
    hintDesktop: "PC: Chrome/Edge → Installa app",
  },
  es: {
    download: "Descargar",
    downloadNamed: "Descargar {name}",
    installed: "Aplicación instalada",
    gated: "Descarga tras iniciar sesión",
    howTitle: "Cómo instalar en el teléfono",
    ios1: "En Safari, toca Compartir",
    ios2: "Elige Añadir a pantalla de inicio",
    ios3: "Confirma Añadir — el icono {name} aparece en la pantalla",
    android1: "En Chrome abre el menú ⋮ arriba a la derecha",
    android2: "Elige Instalar aplicación / Añadir a pantalla de inicio",
    android3: "Confirma — {name} se abre como app",
    desktop1: "Chrome/Edge: icono ⊕ en la barra de direcciones, o menú → Instalar",
    desktop2: "O abre {name} y toca de nuevo Descargar",
    redirect: "La instalación se hace desde la app — redirección a {path}…",
    hideTip: "Ocultar consejo",
    hintIos: "iPhone: Compartir → Añadir a pantalla de inicio",
    hintAndroid: "Android: Chrome → Instalar aplicación",
    hintDesktop: "PC: Chrome/Edge → Instalar aplicación",
  },
  "pt-BR": {
    download: "Baixar",
    downloadNamed: "Baixar {name}",
    installed: "Aplicativo instalado",
    gated: "Download depois do login",
    howTitle: "Como instalar no telefone",
    ios1: "No Safari, toque em Compartilhar",
    ios2: "Escolha Adicionar à Tela de Início",
    ios3: "Confirme Adicionar — o ícone {name} aparece na tela",
    android1: "No Chrome, abra o menu ⋮ no canto superior direito",
    android2: "Escolha Instalar app / Adicionar à tela inicial",
    android3: "Confirme — {name} abre como aplicativo",
    desktop1: "Chrome/Edge: ícone ⊕ na barra de endereços, ou menu → Instalar",
    desktop2: "Ou abra {name} e toque de novo em Baixar",
    redirect: "A instalação acontece no app — redirecionando para {path}…",
    hideTip: "Ocultar dica",
    hintIos: "iPhone: Compartilhar → Adicionar à Tela de Início",
    hintAndroid: "Android: Chrome → Instalar app",
    hintDesktop: "PC: Chrome/Edge → Instalar app",
  },
  en: {
    download: "Download",
    downloadNamed: "Download {name}",
    installed: "App installed",
    gated: "Download after sign-in",
    howTitle: "How to install on a phone",
    ios1: "In Safari, tap Share",
    ios2: "Choose Add to Home Screen",
    ios3: "Confirm Add — the {name} icon appears on the home screen",
    android1: "In Chrome, open the ⋮ menu at the top right",
    android2: "Choose Install app / Add to Home screen",
    android3: "Confirm — {name} opens as an app",
    desktop1: "Chrome/Edge: ⊕ in the address bar, or menu → Install",
    desktop2: "Or open {name} and tap Download again",
    redirect: "Install runs from the app — redirecting to {path}…",
    hideTip: "Hide tip",
    hintIos: "iPhone: Share → Add to Home Screen",
    hintAndroid: "Android: Chrome → Install app",
    hintDesktop: "PC: Chrome/Edge → Install app",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function getInstallPwaCopy(
  locale?: string | null,
  vars?: { name?: string; path?: string }
): InstallPwaCopy {
  const raw = PACK[chromePack(locale)];
  const name = vars?.name ?? "";
  const path = vars?.path ?? "";
  return {
    ...raw,
    downloadNamed: fill(raw.downloadNamed, { name }),
    ios3: fill(raw.ios3, { name }),
    android3: fill(raw.android3, { name }),
    desktop2: fill(raw.desktop2, { name }),
    redirect: fill(raw.redirect, { path }),
  };
}
