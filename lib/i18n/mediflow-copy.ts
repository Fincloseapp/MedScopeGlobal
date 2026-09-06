/**
 * /mediflow marketing + /mediflow/stahnout chrome.
 * VIP stays a secondary link — not a paid gate in the hero.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type MediflowDiaryRow = { label: string; detail: string };
export type MediflowPillar = { title: string; description: string };

export type MediflowCopy = {
  metaTitle: string;
  metaDescription: string;
  today: string;
  journal: string;
  diaryRows: MediflowDiaryRow[];
  lead: string;
  startCta: string;
  vipCta: string;
  previewTitle: string;
  mobileRows: MediflowDiaryRow[];
  pillarsTitle: string;
  pillarsLead: string;
  pillars: MediflowPillar[];
  disclaimer: string;
  tryCta: string;
  downloadPageKicker: string;
  downloadPageTitle: string;
  downloadPageLead: string;
  downloadPageSteps: string[];
  downloadPageBack: string;
};

const PACK: Record<ChromePack, MediflowCopy> = {
  cs: {
    metaTitle: "MediFlow — Váš osobní wellness deník | MedScopeGlobal",
    metaDescription:
      "Osobní wellness deník — články, symptomy a suplementy na jednom místě. MediFlow neslouží k diagnostice.",
    today: "Dnes",
    journal: "MediFlow deník",
    diaryRows: [
      { label: "Uloženo z ViaLongeVita", detail: "Spánek a HRV — přehled týdne" },
      { label: "Symptom", detail: "Energie · mírná · ráno" },
      { label: "Suplement", detail: "Magnesium glycinát · večer" },
      { label: "Poznámka", detail: "Chůze 35 min po obědě" },
      { label: "VIP sync", detail: "Protokol spánku · aktivní" },
    ],
    lead: "Osobní wellness deník — články, symptomy a suplementy na jednom místě.",
    startCta: "Spustit MediFlow",
    vipCta: "VIP protokoly",
    previewTitle: "Náhled deníku",
    mobileRows: [
      { label: "Článek", detail: "Spánek a HRV" },
      { label: "Symptom", detail: "Energie · mírná" },
      { label: "Suplement", detail: "Magnesium · večer" },
    ],
    pillarsTitle: "Tři věci, které MediFlow drží pohromadě",
    pillarsLead: "Jednoduchý deník napojený na ViaLongeVita — bez dashboardového šumu.",
    pillars: [
      {
        title: "Články z ViaLongeVita",
        description: "Uložte si longevity a lifestyle texty na jedno místo.",
      },
      {
        title: "Symptomy a suplementy",
        description: "Denní přehled pro vás — ne pro diagnostiku.",
      },
      {
        title: "Poznámky offline",
        description: "Zápisky vždy po ruce, sync až když jste online.",
      },
    ],
    disclaimer: "MediFlow neslouží k diagnostice. Obsah není lékařská rada.",
    tryCta: "Vyzkoušet zdarma",
    downloadPageKicker: "Instalace MediFlow",
    downloadPageTitle: "Wellness deník na ploše telefonu i PC",
    downloadPageLead:
      "MediFlow běží na medscopeglobal.com/app/mediflow — ukládejte články, sledujte symptomy a suplementy. Instalace na plochu je volitelná; po přihlášení stejným účtem funguje i v prohlížeči.",
    downloadPageSteps: [
      "1. Na tomto zařízení klepněte na „Nainstalovat MediFlow na plochu“.",
      "2. Chrome/Edge: ikona ⊕ v adresním řádku, nebo … → Aplikace → Instalovat.",
      "3. iPhone: Safari → Sdílet → Přidat na plochu.",
    ],
    downloadPageBack: "← Zpět na MediFlow",
  },
  de: {
    metaTitle: "MediFlow — Ihr persönliches Wellness-Tagebuch | MedScopeGlobal",
    metaDescription:
      "Persönliches Wellness-Tagebuch — Artikel, Symptome und Supplemente an einem Ort. MediFlow stellt keine Diagnose.",
    today: "Heute",
    journal: "MediFlow-Tagebuch",
    diaryRows: [
      { label: "Gespeichert aus ViaLongeVita", detail: "Schlaf und HRV — Wochenüberblick" },
      { label: "Symptom", detail: "Energie · leicht · morgens" },
      { label: "Supplement", detail: "Magnesiumglycinat · abends" },
      { label: "Notiz", detail: "35 Min. Gehen nach dem Mittagessen" },
      { label: "VIP-Sync", detail: "Schlafprotokoll · aktiv" },
    ],
    lead: "Persönliches Wellness-Tagebuch — Artikel, Symptome und Supplemente an einem Ort.",
    startCta: "MediFlow starten",
    vipCta: "VIP-Protokolle",
    previewTitle: "Tagebuchvorschau",
    mobileRows: [
      { label: "Artikel", detail: "Schlaf und HRV" },
      { label: "Symptom", detail: "Energie · leicht" },
      { label: "Supplement", detail: "Magnesium · abends" },
    ],
    pillarsTitle: "Drei Dinge, die MediFlow zusammenhält",
    pillarsLead: "Ein schlichtes Tagebuch an ViaLongeVita — ohne Dashboard-Lärm.",
    pillars: [
      {
        title: "Artikel aus ViaLongeVita",
        description: "Longevity- und Lifestyle-Texte an einem Ort speichern.",
      },
      {
        title: "Symptome und Supplemente",
        description: "Ein Tagesüberblick für Sie — nicht zur Diagnose.",
      },
      {
        title: "Notizen offline",
        description: "Notizen immer dabei, Sync erst wenn Sie online sind.",
      },
    ],
    disclaimer: "MediFlow dient nicht der Diagnose. Der Inhalt ist kein medizinischer Rat.",
    tryCta: "Kostenlos testen",
    downloadPageKicker: "MediFlow installieren",
    downloadPageTitle: "Wellness-Tagebuch auf Telefon und PC",
    downloadPageLead:
      "MediFlow läuft unter medscopeglobal.com/app/mediflow — Artikel speichern, Symptome und Supplemente im Blick. Die Installation ist optional; mit demselben Konto funktioniert es auch im Browser.",
    downloadPageSteps: [
      "1. Tippen Sie auf diesem Gerät auf „MediFlow auf den Homescreen“.",
      "2. Chrome/Edge: ⊕ in der Adressleiste oder … → Apps → Installieren.",
      "3. iPhone: Safari → Teilen → Zum Home-Bildschirm.",
    ],
    downloadPageBack: "← Zurück zu MediFlow",
  },
  fr: {
    metaTitle: "MediFlow — Votre journal wellness personnel | MedScopeGlobal",
    metaDescription:
      "Journal wellness — articles, symptômes et compléments au même endroit. MediFlow ne pose pas de diagnostic.",
    today: "Aujourd’hui",
    journal: "Journal MediFlow",
    diaryRows: [
      { label: "Enregistré depuis ViaLongeVita", detail: "Sommeil et HRV — aperçu de la semaine" },
      { label: "Symptôme", detail: "Énergie · légère · matin" },
      { label: "Complément", detail: "Glycinate de magnésium · soir" },
      { label: "Note", detail: "Marche 35 min après le déjeuner" },
      { label: "Sync VIP", detail: "Protocole sommeil · actif" },
    ],
    lead: "Journal wellness personnel — articles, symptômes et compléments au même endroit.",
    startCta: "Lancer MediFlow",
    vipCta: "Protocoles VIP",
    previewTitle: "Aperçu du journal",
    mobileRows: [
      { label: "Article", detail: "Sommeil et HRV" },
      { label: "Symptôme", detail: "Énergie · légère" },
      { label: "Complément", detail: "Magnésium · soir" },
    ],
    pillarsTitle: "Trois choses que MediFlow tient ensemble",
    pillarsLead: "Un journal simple branché sur ViaLongeVita — sans bruit de tableau de bord.",
    pillars: [
      {
        title: "Articles de ViaLongeVita",
        description: "Gardez les textes longévité et lifestyle au même endroit.",
      },
      {
        title: "Symptômes et compléments",
        description: "Un aperçu du jour pour vous — pas pour diagnostiquer.",
      },
      {
        title: "Notes hors ligne",
        description: "Les notes restent à portée ; la sync attend que vous soyez en ligne.",
      },
    ],
    disclaimer: "MediFlow ne sert pas à diagnostiquer. Le contenu n’est pas un avis médical.",
    tryCta: "Essayer gratuitement",
    downloadPageKicker: "Installer MediFlow",
    downloadPageTitle: "Journal wellness sur téléphone et PC",
    downloadPageLead:
      "MediFlow tourne sur medscopeglobal.com/app/mediflow — enregistrez des articles, suivez symptômes et compléments. L’installation est facultative ; avec le même compte, ça marche aussi dans le navigateur.",
    downloadPageSteps: [
      "1. Sur cet appareil, touchez « Installer MediFlow sur l’écran d’accueil ».",
      "2. Chrome/Edge : icône ⊕ dans la barre d’adresse, ou … → Applications → Installer.",
      "3. iPhone : Safari → Partager → Sur l’écran d’accueil.",
    ],
    downloadPageBack: "← Retour à MediFlow",
  },
  it: {
    metaTitle: "MediFlow — Il tuo diario wellness | MedScopeGlobal",
    metaDescription:
      "Diario wellness — articoli, sintomi e integratori in un solo posto. MediFlow non fa diagnosi.",
    today: "Oggi",
    journal: "Diario MediFlow",
    diaryRows: [
      { label: "Salvato da ViaLongeVita", detail: "Sonno e HRV — quadro della settimana" },
      { label: "Sintomo", detail: "Energia · lieve · mattina" },
      { label: "Integratore", detail: "Glicinato di magnesio · sera" },
      { label: "Nota", detail: "Camminata 35 min dopo pranzo" },
      { label: "Sync VIP", detail: "Protocollo sonno · attivo" },
    ],
    lead: "Diario wellness personale — articoli, sintomi e integratori in un solo posto.",
    startCta: "Avvia MediFlow",
    vipCta: "Protocolli VIP",
    previewTitle: "Anteprima del diario",
    mobileRows: [
      { label: "Articolo", detail: "Sonno e HRV" },
      { label: "Sintomo", detail: "Energia · lieve" },
      { label: "Integratore", detail: "Magnesio · sera" },
    ],
    pillarsTitle: "Tre cose che MediFlow tiene insieme",
    pillarsLead: "Un diario semplice legato a ViaLongeVita — senza rumore da dashboard.",
    pillars: [
      {
        title: "Articoli da ViaLongeVita",
        description: "Salva testi di longevità e lifestyle in un solo posto.",
      },
      {
        title: "Sintomi e integratori",
        description: "Un quadro del giorno per te — non per diagnosticare.",
      },
      {
        title: "Note offline",
        description: "Le note restano a portata; la sync aspetta che tu sia online.",
      },
    ],
    disclaimer: "MediFlow non serve a diagnosticare. Il contenuto non è un parere medico.",
    tryCta: "Prova gratis",
    downloadPageKicker: "Installa MediFlow",
    downloadPageTitle: "Diario wellness su telefono e PC",
    downloadPageLead:
      "MediFlow gira su medscopeglobal.com/app/mediflow — salva articoli, tieni sintomi e integratori. L’installazione è facoltativa; con lo stesso account funziona anche nel browser.",
    downloadPageSteps: [
      "1. Su questo dispositivo tocca « Installa MediFlow sulla schermata Home ».",
      "2. Chrome/Edge: icona ⊕ nella barra degli indirizzi, oppure … → App → Installa.",
      "3. iPhone: Safari → Condividi → Aggiungi a Home.",
    ],
    downloadPageBack: "← Torna a MediFlow",
  },
  es: {
    metaTitle: "MediFlow — Tu diario de bienestar | MedScopeGlobal",
    metaDescription:
      "Diario de bienestar — artículos, síntomas y suplementos en un solo sitio. MediFlow no diagnostica.",
    today: "Hoy",
    journal: "Diario MediFlow",
    diaryRows: [
      { label: "Guardado desde ViaLongeVita", detail: "Sueño y HRV — resumen de la semana" },
      { label: "Síntoma", detail: "Energía · leve · mañana" },
      { label: "Suplemento", detail: "Glicinato de magnesio · noche" },
      { label: "Nota", detail: "Caminar 35 min después de comer" },
      { label: "Sync VIP", detail: "Protocolo de sueño · activo" },
    ],
    lead: "Diario de bienestar personal — artículos, síntomas y suplementos en un solo sitio.",
    startCta: "Abrir MediFlow",
    vipCta: "Protocolos VIP",
    previewTitle: "Vista previa del diario",
    mobileRows: [
      { label: "Artículo", detail: "Sueño y HRV" },
      { label: "Síntoma", detail: "Energía · leve" },
      { label: "Suplemento", detail: "Magnesio · noche" },
    ],
    pillarsTitle: "Tres cosas que MediFlow mantiene juntas",
    pillarsLead: "Un diario simple unido a ViaLongeVita — sin ruido de panel.",
    pillars: [
      {
        title: "Artículos de ViaLongeVita",
        description: "Guarda textos de longevidad y estilo de vida en un solo sitio.",
      },
      {
        title: "Síntomas y suplementos",
        description: "Un resumen del día para ti — no para diagnosticar.",
      },
      {
        title: "Notas sin conexión",
        description: "Las notas van contigo; la sync espera a que estés en línea.",
      },
    ],
    disclaimer: "MediFlow no sirve para diagnosticar. El contenido no es consejo médico.",
    tryCta: "Probar gratis",
    downloadPageKicker: "Instalar MediFlow",
    downloadPageTitle: "Diario de bienestar en el teléfono y el PC",
    downloadPageLead:
      "MediFlow corre en medscopeglobal.com/app/mediflow — guarda artículos, sigue síntomas y suplementos. La instalación es opcional; con la misma cuenta también funciona en el navegador.",
    downloadPageSteps: [
      "1. En este dispositivo toca « Instalar MediFlow en la pantalla de inicio ».",
      "2. Chrome/Edge: icono ⊕ en la barra de direcciones, o … → Aplicaciones → Instalar.",
      "3. iPhone: Safari → Compartir → Añadir a pantalla de inicio.",
    ],
    downloadPageBack: "← Volver a MediFlow",
  },
  "pt-BR": {
    metaTitle: "MediFlow — Seu diário de bem-estar | MedScopeGlobal",
    metaDescription:
      "Diário de bem-estar — artigos, sintomas e suplementos num só lugar. O MediFlow não diagnostica.",
    today: "Hoje",
    journal: "Diário MediFlow",
    diaryRows: [
      { label: "Salvo de ViaLongeVita", detail: "Sono e HRV — panorama da semana" },
      { label: "Sintoma", detail: "Energia · leve · manhã" },
      { label: "Suplemento", detail: "Glicinato de magnésio · noite" },
      { label: "Nota", detail: "Caminhada 35 min depois do almoço" },
      { label: "Sync VIP", detail: "Protocolo de sono · ativo" },
    ],
    lead: "Diário pessoal de bem-estar — artigos, sintomas e suplementos num só lugar.",
    startCta: "Abrir o MediFlow",
    vipCta: "Protocolos VIP",
    previewTitle: "Prévia do diário",
    mobileRows: [
      { label: "Artigo", detail: "Sono e HRV" },
      { label: "Sintoma", detail: "Energia · leve" },
      { label: "Suplemento", detail: "Magnésio · noite" },
    ],
    pillarsTitle: "Três coisas que o MediFlow segura juntas",
    pillarsLead: "Um diário simples ligado à ViaLongeVita — sem ruído de painel.",
    pillars: [
      {
        title: "Artigos da ViaLongeVita",
        description: "Guarde textos de longevidade e estilo de vida num só lugar.",
      },
      {
        title: "Sintomas e suplementos",
        description: "Um panorama do dia para você — não para diagnosticar.",
      },
      {
        title: "Notas offline",
        description: "As notas ficam à mão; a sync espera você estar online.",
      },
    ],
    disclaimer: "O MediFlow não serve para diagnosticar. O conteúdo não é conselho médico.",
    tryCta: "Experimentar grátis",
    downloadPageKicker: "Instalar o MediFlow",
    downloadPageTitle: "Diário de bem-estar no telefone e no PC",
    downloadPageLead:
      "O MediFlow roda em medscopeglobal.com/app/mediflow — salve artigos, acompanhe sintomas e suplementos. A instalação é opcional; com a mesma conta também funciona no navegador.",
    downloadPageSteps: [
      "1. Neste aparelho, toque em « Instalar o MediFlow na tela inicial ».",
      "2. Chrome/Edge: ícone ⊕ na barra de endereços, ou … → Aplicativos → Instalar.",
      "3. iPhone: Safari → Compartilhar → Adicionar à Tela de Início.",
    ],
    downloadPageBack: "← Voltar ao MediFlow",
  },
  en: {
    metaTitle: "MediFlow — Your personal wellness journal | MedScopeGlobal",
    metaDescription:
      "A personal wellness journal — articles, symptoms and supplements in one place. MediFlow does not diagnose.",
    today: "Today",
    journal: "MediFlow journal",
    diaryRows: [
      { label: "Saved from ViaLongeVita", detail: "Sleep and HRV — week in view" },
      { label: "Symptom", detail: "Energy · mild · morning" },
      { label: "Supplement", detail: "Magnesium glycinate · evening" },
      { label: "Note", detail: "35 min walk after lunch" },
      { label: "VIP sync", detail: "Sleep protocol · active" },
    ],
    lead: "A personal wellness journal — articles, symptoms and supplements in one place.",
    startCta: "Open MediFlow",
    vipCta: "VIP protocols",
    previewTitle: "Journal preview",
    mobileRows: [
      { label: "Article", detail: "Sleep and HRV" },
      { label: "Symptom", detail: "Energy · mild" },
      { label: "Supplement", detail: "Magnesium · evening" },
    ],
    pillarsTitle: "Three things MediFlow holds together",
    pillarsLead: "A simple journal tied to ViaLongeVita — without dashboard noise.",
    pillars: [
      {
        title: "Articles from ViaLongeVita",
        description: "Keep longevity and lifestyle pieces in one place.",
      },
      {
        title: "Symptoms and supplements",
        description: "A daily view for you — not for diagnosis.",
      },
      {
        title: "Notes offline",
        description: "Notes stay with you; sync waits until you are online.",
      },
    ],
    disclaimer: "MediFlow is not for diagnosis. The content is not medical advice.",
    tryCta: "Try free",
    downloadPageKicker: "Install MediFlow",
    downloadPageTitle: "Wellness journal on phone and PC",
    downloadPageLead:
      "MediFlow runs at medscopeglobal.com/app/mediflow — save articles, track symptoms and supplements. Installing to the home screen is optional; with the same account it also works in the browser.",
    downloadPageSteps: [
      "1. On this device, tap “Install MediFlow to the home screen”.",
      "2. Chrome/Edge: ⊕ in the address bar, or … → Apps → Install.",
      "3. iPhone: Safari → Share → Add to Home Screen.",
    ],
    downloadPageBack: "← Back to MediFlow",
  },
};

export function getMediflowCopy(locale?: string | null): MediflowCopy {
  return PACK[chromePack(locale)];
}
