/**
 * /medipacient marketing + /medipacient/stahnout chrome.
 * Czech demo reports stay on /cs only — do not dump Czech diagnoses on other editions.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type MedipacientStep = {
  n: string;
  title: string;
  cta?: string;
};

export type MedipacientCopy = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  pitch: string;
  downloadCta: string;
  downloadGuideCta: string;
  steps: MedipacientStep[];
  demoEyebrow: string;
  demoTitle: string;
  demoLead: string;
  demoOpen: string;
  showDemoReports: boolean;
  freeTitle: string;
  freeItems: string[];
  premiumTitle: string;
  premiumItems: string[];
  subscribeCta: string;
  disclaimer: string;
  downloadPageKicker: string;
  downloadPageTitle: string;
  downloadPageLead: string;
  downloadPageBack: string;
};

type PackCopy = Omit<MedipacientCopy, "showDemoReports" | "premiumTitle" | "subscribeCta"> & {
  premiumTitle: string;
  subscribeCta: string;
};

const PACK: Record<ChromePack, PackCopy> = {
  cs: {
    metaTitle: "MeDipacient — Moje lékařské zprávy přehledně k dispozici | MedScopeGlobal",
    metaDescription:
      "Vyfoťte PDF nebo fotografii lékařské zprávy — i bez dat. OCR vytáhne diagnózy, léky a kontroly. Premium od 99 Kč / měsíc.",
    kicker: "Aplikace pro veřejnost · medscopeglobal.com",
    title: "Moje lékařské zprávy přehledně k dispozici",
    pitch:
      "Vyfoťte PDF nebo fotografii lékařské zprávy — i bez dat. Po připojení se soubor přečte, OCR vytáhne diagnózy, léky a kontroly.",
    downloadCta: "Stáhnout MeDipacient",
    downloadGuideCta: "Průvodce stažením",
    steps: [
      { n: "1 / 6", title: "Po vyšetření si nahrajete zprávu.", cta: "Nahrát zprávu" },
      { n: "2 / 6", title: "AI zprávu přečte, vyhodnotí a uloží." },
      { n: "3 / 6", title: "Už nikdy nezapomeňte." },
      { n: "4 / 6", title: "Všechny vaše zprávy na jednom místě.", cta: "Nahrát zprávu" },
      { n: "5 / 6", title: "Jednoduché pro každého. Od studentů po seniory." },
      { n: "6 / 6", title: "Premium vám hlídá zdraví. Vy jen žijete." },
    ],
    demoEyebrow: "Zkušební dashboard",
    demoTitle: "Už teď vidíte, co aplikace umí",
    demoLead:
      "Pět zkušebních zpráv (květen–červenec) skládá diagnózy, léky, laboratoř a otázky k lékaři. Vaše nahrávky se přidají do stejné osy.",
    demoOpen: "Otevřít plný dashboard",
    freeTitle: "Zdarma",
    freeItems: [
      "Nahrávání zpráv",
      "Základní analýza a časová osa",
      "Zkušební ukázkové zprávy v dashboardu",
    ],
    premiumTitle: "Premium od {price}",
    premiumItems: [
      "Pokročilá analýza a lékový plán",
      "Chytré připomínky kontrol",
      "Celý magazín Veřejnost bez reklam",
    ],
    subscribeCta: "Předplatné {price}",
    disclaimer: "Vzdělávací přehled zpráv — nenahrazuje lékařskou péči.",
    downloadPageKicker: "Instalace na plochu",
    downloadPageTitle: "Na plochu telefonu i počítače",
    downloadPageLead:
      "Aplikace běží na medscopeglobal.com/app/pacient — v Chrome/Edge na počítači i v Safari/Chrome v telefonu, po přihlášení stejným účtem. Instalace na plochu je volitelná.",
    downloadPageBack: "← Jak MeDipacient funguje",
  },
  de: {
    metaTitle: "MeDipacient — Arztberichte übersichtlich zur Hand | MedScopeGlobal",
    metaDescription:
      "Foto oder PDF eines Arztberichts — auch offline. OCR liest Diagnosen, Medikamente und Kontrollen. Kein Ersatz für die Behandlung.",
    kicker: "App für die Öffentlichkeit · medscopeglobal.com",
    title: "Arztberichte übersichtlich zur Hand",
    pitch:
      "Fotografieren Sie ein PDF oder einen Arztbericht — auch offline. Nach der Verbindung liest OCR Diagnosen, Medikamente und Kontrolltermine.",
    downloadCta: "MeDipacient herunterladen",
    downloadGuideCta: "Installationsanleitung",
    steps: [
      { n: "1 / 6", title: "Nach dem Termin laden Sie den Bericht hoch.", cta: "Bericht hochladen" },
      { n: "2 / 6", title: "Die KI liest, ordnet und speichert ihn." },
      { n: "3 / 6", title: "Nichts mehr vergessen." },
      { n: "4 / 6", title: "Alle Berichte an einem Ort.", cta: "Bericht hochladen" },
      { n: "5 / 6", title: "Einfach für alle — vom Studium bis ins höhere Alter." },
      { n: "6 / 6", title: "Premium behält den Überblick. Sie leben weiter." },
    ],
    demoEyebrow: "Demo-Dashboard",
    demoTitle: "So sieht die App aus",
    demoLead:
      "Der Demo-Bereich zeigt, wie Berichte auf einer Zeitachse landen. Eigene Uploads kommen in dieselbe Ansicht — ohne tschechische Beispieldiagnosen auf dieser Ausgabe.",
    demoOpen: "Dashboard öffnen",
    freeTitle: "Kostenlos",
    freeItems: [
      "Berichte hochladen",
      "Grundanalyse und Zeitachse",
      "Demo-Ansicht im Dashboard",
    ],
    premiumTitle: "Premium ab {price}",
    premiumItems: [
      "Erweiterte Analyse und Medikamentenplan",
      "Erinnerungen an Kontrollen",
      "Das öffentliche Magazin ohne Werbung",
    ],
    subscribeCta: "Abo {price}",
    disclaimer: "Ein Bildungsüberblick über Berichte — kein Ersatz für medizinische Versorgung.",
    downloadPageKicker: "Installation auf den Homescreen",
    downloadPageTitle: "Auf Telefon und Computer",
    downloadPageLead:
      "Die App läuft unter medscopeglobal.com/app/pacient — in Chrome/Edge am Rechner und in Safari/Chrome am Telefon, mit demselben Konto. Die Installation ist optional.",
    downloadPageBack: "← So funktioniert MeDipacient",
  },
  fr: {
    metaTitle: "MeDipacient — Comptes rendus clairement sous la main | MedScopeGlobal",
    metaDescription:
      "Photo ou PDF d’un compte rendu — même hors ligne. L’OCR extrait diagnostics, médicaments et contrôles. Ce n’est pas un soin.",
    kicker: "Application grand public · medscopeglobal.com",
    title: "Comptes rendus clairement sous la main",
    pitch:
      "Photographiez un PDF ou un compte rendu — même hors ligne. Une fois reconnecté, l’OCR extrait diagnostics, médicaments et contrôles.",
    downloadCta: "Télécharger MeDipacient",
    downloadGuideCta: "Guide d’installation",
    steps: [
      { n: "1 / 6", title: "Après la visite, vous déposez le compte rendu.", cta: "Déposer un compte rendu" },
      { n: "2 / 6", title: "L’IA le lit, l’évalue et l’enregistre." },
      { n: "3 / 6", title: "Plus rien n’est oublié." },
      { n: "4 / 6", title: "Tous vos comptes rendus au même endroit.", cta: "Déposer un compte rendu" },
      { n: "5 / 6", title: "Simple pour tout le monde — des étudiants aux aînés." },
      { n: "6 / 6", title: "Premium garde le fil. Vous vivez." },
    ],
    demoEyebrow: "Tableau de démonstration",
    demoTitle: "Vous voyez déjà ce que l’appli fait",
    demoLead:
      "Le tableau montre comment les comptes rendus s’alignent. Vos dépôts rejoignent la même frise — sans exemples tchèques sur cette édition.",
    demoOpen: "Ouvrir le tableau",
    freeTitle: "Gratuit",
    freeItems: [
      "Dépôt de comptes rendus",
      "Analyse de base et frise",
      "Aperçu de démonstration",
    ],
    premiumTitle: "Premium dès {price}",
    premiumItems: [
      "Analyse avancée et plan médicamenteux",
      "Rappels de contrôles",
      "Le magazine grand public sans publicité",
    ],
    subscribeCta: "Abonnement {price}",
    disclaimer: "Aperçu éducatif des comptes rendus — ne remplace pas des soins médicaux.",
    downloadPageKicker: "Installation sur l’écran d’accueil",
    downloadPageTitle: "Sur le téléphone et l’ordinateur",
    downloadPageLead:
      "L’appli tourne sur medscopeglobal.com/app/pacient — Chrome/Edge sur ordinateur et Safari/Chrome sur téléphone, avec le même compte. L’installation est facultative.",
    downloadPageBack: "← Comment fonctionne MeDipacient",
  },
  it: {
    metaTitle: "MeDipacient — Referti medici a portata di mano | MedScopeGlobal",
    metaDescription:
      "Foto o PDF di un referto — anche offline. L’OCR estrae diagnosi, farmaci e controlli. Non sostituisce le cure.",
    kicker: "App per il pubblico · medscopeglobal.com",
    title: "Referti medici a portata di mano",
    pitch:
      "Fotografa un PDF o un referto — anche offline. Quando torni online, l’OCR estrae diagnosi, farmaci e controlli.",
    downloadCta: "Scarica MeDipacient",
    downloadGuideCta: "Guida all’installazione",
    steps: [
      { n: "1 / 6", title: "Dopo la visita carichi il referto.", cta: "Carica un referto" },
      { n: "2 / 6", title: "L’IA lo legge, lo valuta e lo salva." },
      { n: "3 / 6", title: "Non dimentichi più nulla." },
      { n: "4 / 6", title: "Tutti i referti in un solo posto.", cta: "Carica un referto" },
      { n: "5 / 6", title: "Semplice per tutti — dagli studenti agli anziani." },
      { n: "6 / 6", title: "Premium tiene il filo. Tu vivi." },
    ],
    demoEyebrow: "Dashboard di prova",
    demoTitle: "Vedi già cosa fa l’app",
    demoLead:
      "La dashboard mostra come i referti finiscono su una linea del tempo. I tuoi file arrivano nella stessa vista — senza esempi cechi su questa edizione.",
    demoOpen: "Apri la dashboard",
    freeTitle: "Gratis",
    freeItems: [
      "Caricamento referti",
      "Analisi di base e linea del tempo",
      "Vista demo nella dashboard",
    ],
    premiumTitle: "Premium da {price}",
    premiumItems: [
      "Analisi avanzata e piano dei farmaci",
      "Promemoria dei controlli",
      "La rivista pubblica senza pubblicità",
    ],
    subscribeCta: "Abbonamento {price}",
    disclaimer: "Quadro educativo dei referti — non sostituisce le cure mediche.",
    downloadPageKicker: "Installazione sulla schermata Home",
    downloadPageTitle: "Su telefono e computer",
    downloadPageLead:
      "L’app gira su medscopeglobal.com/app/pacient — Chrome/Edge sul computer e Safari/Chrome sul telefono, con lo stesso account. L’installazione è facoltativa.",
    downloadPageBack: "← Come funziona MeDipacient",
  },
  es: {
    metaTitle: "MeDipacient — Informes médicos a mano | MedScopeGlobal",
    metaDescription:
      "Foto o PDF de un informe — también sin conexión. El OCR extrae diagnósticos, medicamentos y controles. No sustituye la atención.",
    kicker: "Aplicación para el público · medscopeglobal.com",
    title: "Informes médicos a mano",
    pitch:
      "Fotografía un PDF o un informe — también sin conexión. Al reconectar, el OCR extrae diagnósticos, medicamentos y controles.",
    downloadCta: "Descargar MeDipacient",
    downloadGuideCta: "Guía de instalación",
    steps: [
      { n: "1 / 6", title: "Tras la visita subes el informe.", cta: "Subir un informe" },
      { n: "2 / 6", title: "La IA lo lee, lo valora y lo guarda." },
      { n: "3 / 6", title: "Ya no se te olvida." },
      { n: "4 / 6", title: "Todos tus informes en un solo sitio.", cta: "Subir un informe" },
      { n: "5 / 6", title: "Sencillo para todos — de estudiantes a mayores." },
      { n: "6 / 6", title: "Premium vigila el hilo. Tú vives." },
    ],
    demoEyebrow: "Panel de prueba",
    demoTitle: "Ya ves lo que hace la app",
    demoLead:
      "El panel muestra cómo los informes se alinean en una línea de tiempo. Tus archivos llegan a la misma vista — sin ejemplos checos en esta edición.",
    demoOpen: "Abrir el panel",
    freeTitle: "Gratis",
    freeItems: [
      "Subida de informes",
      "Análisis básico y línea de tiempo",
      "Vista de demostración",
    ],
    premiumTitle: "Premium desde {price}",
    premiumItems: [
      "Análisis avanzado y plan de medicamentos",
      "Recordatorios de controles",
      "La revista pública sin anuncios",
    ],
    subscribeCta: "Suscripción {price}",
    disclaimer: "Resumen educativo de informes — no sustituye la atención médica.",
    downloadPageKicker: "Instalación en la pantalla de inicio",
    downloadPageTitle: "En el teléfono y el ordenador",
    downloadPageLead:
      "La app corre en medscopeglobal.com/app/pacient — Chrome/Edge en el ordenador y Safari/Chrome en el teléfono, con la misma cuenta. La instalación es opcional.",
    downloadPageBack: "← Cómo funciona MeDipacient",
  },
  "pt-BR": {
    metaTitle: "MeDipacient — Relatórios médicos à mão | MedScopeGlobal",
    metaDescription:
      "Foto ou PDF de um relatório — mesmo offline. O OCR extrai diagnósticos, medicamentos e controles. Não substitui o cuidado.",
    kicker: "Aplicativo para o público · medscopeglobal.com",
    title: "Relatórios médicos à mão",
    pitch:
      "Fotografe um PDF ou um relatório — mesmo offline. Ao reconectar, o OCR extrai diagnósticos, medicamentos e controles.",
    downloadCta: "Baixar o MeDipacient",
    downloadGuideCta: "Guia de instalação",
    steps: [
      { n: "1 / 6", title: "Depois da consulta, você envia o relatório.", cta: "Enviar um relatório" },
      { n: "2 / 6", title: "A IA lê, avalia e guarda." },
      { n: "3 / 6", title: "Você não esquece mais." },
      { n: "4 / 6", title: "Todos os relatórios num só lugar.", cta: "Enviar um relatório" },
      { n: "5 / 6", title: "Simples para todos — de estudantes a idosos." },
      { n: "6 / 6", title: "O Premium acompanha o fio. Você vive." },
    ],
    demoEyebrow: "Painel de demonstração",
    demoTitle: "Você já vê o que o app faz",
    demoLead:
      "O painel mostra como os relatórios entram numa linha do tempo. Os seus envios chegam à mesma vista — sem exemplos tchecos nesta edição.",
    demoOpen: "Abrir o painel",
    freeTitle: "Grátis",
    freeItems: [
      "Envio de relatórios",
      "Análise básica e linha do tempo",
      "Vista de demonstração",
    ],
    premiumTitle: "Premium a partir de {price}",
    premiumItems: [
      "Análise avançada e plano de medicamentos",
      "Lembretes de controles",
      "A revista pública sem anúncios",
    ],
    subscribeCta: "Assinatura {price}",
    disclaimer: "Visão educativa dos relatórios — não substitui o cuidado médico.",
    downloadPageKicker: "Instalação na tela inicial",
    downloadPageTitle: "No telefone e no computador",
    downloadPageLead:
      "O app roda em medscopeglobal.com/app/pacient — Chrome/Edge no computador e Safari/Chrome no telefone, com a mesma conta. A instalação é opcional.",
    downloadPageBack: "← Como o MeDipacient funciona",
  },
  en: {
    metaTitle: "MeDipacient — Medical reports, clearly at hand | MedScopeGlobal",
    metaDescription:
      "Photograph a PDF or a medical report — even offline. OCR extracts diagnoses, medicines and follow-ups. Not a substitute for care.",
    kicker: "Public app · medscopeglobal.com",
    title: "Medical reports, clearly at hand",
    pitch:
      "Photograph a PDF or a medical report — even offline. When you reconnect, OCR extracts diagnoses, medicines and follow-ups.",
    downloadCta: "Download MeDipacient",
    downloadGuideCta: "Installation guide",
    steps: [
      { n: "1 / 6", title: "After the visit, you upload the report.", cta: "Upload a report" },
      { n: "2 / 6", title: "AI reads, reviews and stores it." },
      { n: "3 / 6", title: "Nothing slips away." },
      { n: "4 / 6", title: "All your reports in one place.", cta: "Upload a report" },
      { n: "5 / 6", title: "Simple for everyone — students through later life." },
      { n: "6 / 6", title: "Premium keeps the thread. You live." },
    ],
    demoEyebrow: "Trial dashboard",
    demoTitle: "See what the app does",
    demoLead:
      "The dashboard shows how reports land on one timeline. Your uploads join the same view — this edition does not list Czech sample diagnoses.",
    demoOpen: "Open the full dashboard",
    freeTitle: "Free",
    freeItems: [
      "Report uploads",
      "Basic analysis and timeline",
      "Sample view in the dashboard",
    ],
    premiumTitle: "Premium from {price}",
    premiumItems: [
      "Advanced analysis and medicine plan",
      "Smart follow-up reminders",
      "The public magazine without ads",
    ],
    subscribeCta: "Subscription {price}",
    disclaimer: "An educational overview of reports — not a substitute for medical care.",
    downloadPageKicker: "Install to the home screen",
    downloadPageTitle: "On your phone and computer",
    downloadPageLead:
      "The app runs at medscopeglobal.com/app/pacient — Chrome/Edge on a computer and Safari/Chrome on a phone, with the same account. Installing to the home screen is optional.",
    downloadPageBack: "← How MeDipacient works",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function getMedipacientCopy(
  locale?: string | null,
  priced?: { premium: string }
): MedipacientCopy {
  const raw = PACK[chromePack(locale)];
  const premium = priced?.premium ?? "";
  return {
    ...raw,
    showDemoReports: chromePack(locale) === "cs",
    premiumTitle: fill(raw.premiumTitle, { price: premium }),
    subscribeCta: fill(raw.subscribeCta, { price: premium }),
  };
}
