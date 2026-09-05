import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type PhysicianDashboardCopy = {
  kicker: string;
  title: [string, string];
  lead: string;
  trial: string;
  openOrdi: string;
  physicianPlan: string;
  desk: string;
  methodKicker: string;
  methodTitle: string;
  method: [string, string][];
  roomsKicker: string;
  roomsTitle: string;
  roomsLead: string;
  adsNote: string;
  footnote: string;
};

const PACK: Record<ChromePack, PhysicianDashboardCopy> = {
  cs: {
    kicker: "Lékařský desk · MedScopeGlobal",
    title: ["Klinická práce.", "Zápis, evidence, žádné reklamy v zóně."],
    lead: "OrdiZapis na diktát, guidelines s DOI/PMID a odborná sekce. 14 dní zdarma. Lékařská zóna zůstává bez AdSense i affiliate. Firmy inzerují na magazínu ViaLongeVita — s označením, ne v ordinaci.",
    trial: "14 dní zdarma",
    openOrdi: "Vyzkoušet OrdiZapis",
    physicianPlan: "Lékař v praxi",
    desk: "Odborná sekce",
    methodKicker: "Proč sem lékaři chodí",
    methodTitle: "Dokumentace, evidence, rozhodnutí — v tomto pořadí.",
    method: [
      ["01  Dokumentace", "OrdiZapis: nahrávka v mobilu → strukturovaný zápis. Stejný účet na telefonu i webu."],
      ["02  Evidence", "Studie a guidelines s DOI nebo PMID. Peer-review standard, ne generické shrnutí."],
      ["03  Rozhodování", "Klinický AI a léky jako kontext k praxi — ne chatbot a ne diagnóza."],
    ],
    roomsKicker: "Pracovní plochy",
    roomsTitle: "Stejný desk, který používáte po trialu.",
    roomsLead: "Žádné vymyšlené recenze ani počty čtenářů. CME v Česku je zatím revmatologie — ostatní obory nepřidáváme, dokud akreditace není.",
    adsNote: "Reklama zdravotnických firem patří na ViaLongeVita, ne sem.",
    footnote: "14 dní zdarma · OrdiZapis 390 Kč/měs. · Lékař v praxi 490 Kč/měs.",
  },
  en: {
    kicker: "Physician desk · MedScopeGlobal",
    title: ["Clinic work.", "Notes, evidence, no ads in this zone."],
    lead: "OrdiZapis for dictation, guidelines with DOI/PMID, and a professional desk. 14 days free. The physician zone stays free of AdSense and affiliates. Health companies advertise on ViaLongeVita — labelled, not inside the clinic tools.",
    trial: "14 days free",
    openOrdi: "Try OrdiZapis",
    physicianPlan: "Physician in practice",
    desk: "Professional desk",
    methodKicker: "Why clinicians open this",
    methodTitle: "Documentation, evidence, decisions — in that order.",
    method: [
      ["01  Documentation", "OrdiZapis: record on the phone → structured note. Same account on mobile and web."],
      ["02  Evidence", "Studies and guidelines with a DOI or PMID. Peer-review standard, not a generic summary."],
      ["03  Decisions", "Clinical AI and medicines as practice context — not a chatbot and not a diagnosis."],
    ],
    roomsKicker: "Workspaces",
    roomsTitle: "The same desk you keep after the trial.",
    roomsLead: "No invented reviews or traffic counts. Rheumatology CME is Czech-only; we do not invent accreditation for other boards.",
    adsNote: "Health-company ads sit on ViaLongeVita, not here.",
    footnote: "14 days free · OrdiZapis · Physician in practice",
  },
  de: {
    kicker: "Arzt-Desk · MedScopeGlobal",
    title: ["Praxisarbeit.", "Notiz, Evidenz, keine Werbung in dieser Zone."],
    lead: "OrdiZapis für Diktat, Leitlinien mit DOI/PMID und Fachbereich. 14 Tage kostenlos. Die Arztzone bleibt ohne AdSense und Affiliate. Firmen werben auf ViaLongeVita — gekennzeichnet, nicht in den Kliniktools.",
    trial: "14 Tage kostenlos",
    openOrdi: "OrdiZapis testen",
    physicianPlan: "Arzt in der Praxis",
    desk: "Fachbereich",
    methodKicker: "Warum Ärztinnen das öffnen",
    methodTitle: "Dokumentation, Evidenz, Entscheidung — in dieser Reihenfolge.",
    method: [
      ["01  Dokumentation", "OrdiZapis: am Handy aufnehmen → strukturierte Notiz. Dasselbe Konto auf Handy und Web."],
      ["02  Evidenz", "Studien und Leitlinien mit DOI oder PMID. Peer-Review, keine generische Kurzfassung."],
      ["03  Entscheidung", "Klinische KI und Arzneimittel als Kontext — kein Chatbot, keine Diagnose."],
    ],
    roomsKicker: "Arbeitsflächen",
    roomsTitle: "Derselbe Desk nach dem Testzeitraum.",
    roomsLead: "Keine erfundenen Rezensionen oder Reichweiten. CME-Rheumatologie bleibt tschechisch — wir erfinden keine Akkreditierung.",
    adsNote: "Werbung von Gesundheitsfirmen steht auf ViaLongeVita, nicht hier.",
    footnote: "14 Tage kostenlos · OrdiZapis · Arzt in der Praxis",
  },
  fr: {
    kicker: "Bureau médecin · MedScopeGlobal",
    title: ["Travail clinique.", "Note, preuves, pas de pub ici."],
    lead: "OrdiZapis pour la dictée, guidelines avec DOI/PMID et espace professionnel. 14 jours gratuits. L’espace médecins reste sans AdSense ni affiliation. Les entreprises annoncent sur ViaLongeVita — marquées, pas dans les outils de cabinet.",
    trial: "14 jours gratuits",
    openOrdi: "Essayer OrdiZapis",
    physicianPlan: "Médecin en exercice",
    desk: "Espace professionnel",
    methodKicker: "Pourquoi les médecins l’ouvrent",
    methodTitle: "Documentation, preuves, décisions — dans cet ordre.",
    method: [
      ["01  Documentation", "OrdiZapis : enregistrer sur mobile → note structurée. Même compte téléphone et web."],
      ["02  Preuves", "Études et guidelines avec DOI ou PMID. Standard peer review, pas un résumé générique."],
      ["03  Décisions", "IA clinique et médicaments comme contexte — pas un chatbot, pas un diagnostic."],
    ],
    roomsKicker: "Espaces de travail",
    roomsTitle: "Le même bureau après l’essai.",
    roomsLead: "Pas d’avis inventés ni de chiffres d’audience. La FMC rhumatologie reste tchèque — nous n’inventons pas d’accréditation.",
    adsNote: "La publicité des entreprises de santé est sur ViaLongeVita, pas ici.",
    footnote: "14 jours gratuits · OrdiZapis · Médecin en exercice",
  },
  it: {
    kicker: "Desk medico · MedScopeGlobal",
    title: ["Lavoro clinico.", "Nota, evidenze, nessuna pubblicità qui."],
    lead: "OrdiZapis per il dettato, linee guida con DOI/PMID e area professionale. 14 giorni gratis. La zona medici resta senza AdSense e affiliate. Le aziende pubblicano su ViaLongeVita — etichettate, non negli strumenti di ambulatorio.",
    trial: "14 giorni gratis",
    openOrdi: "Prova OrdiZapis",
    physicianPlan: "Medico in pratica",
    desk: "Area professionale",
    methodKicker: "Perché i medici lo aprono",
    methodTitle: "Documentazione, evidenze, decisioni — in quest’ordine.",
    method: [
      ["01  Documentazione", "OrdiZapis: registra sul telefono → nota strutturata. Stesso account su mobile e web."],
      ["02  Evidenze", "Studi e linee guida con DOI o PMID. Standard peer review, non un riassunto generico."],
      ["03  Decisioni", "IA clinica e farmaci come contesto — non un chatbot e non una diagnosi."],
    ],
    roomsKicker: "Aree di lavoro",
    roomsTitle: "Lo stesso desk dopo la prova.",
    roomsLead: "Niente recensioni inventate né numeri di traffico. L’ECM di reumatologia resta ceca — non inventiamo accreditamenti.",
    adsNote: "La pubblicità delle aziende sanitarie sta su ViaLongeVita, non qui.",
    footnote: "14 giorni gratis · OrdiZapis · Medico in pratica",
  },
  es: {
    kicker: "Escritorio médico · MedScopeGlobal",
    title: ["Trabajo clínico.", "Nota, evidencia, sin anuncios aquí."],
    lead: "OrdiZapis para el dictado, guías con DOI/PMID y área profesional. 14 días gratis. La zona médica sigue sin AdSense ni afiliados. Las empresas anuncian en ViaLongeVita — etiquetadas, no dentro de las herramientas de consulta.",
    trial: "14 días gratis",
    openOrdi: "Probar OrdiZapis",
    physicianPlan: "Médico en ejercicio",
    desk: "Área profesional",
    methodKicker: "Por qué lo abren los médicos",
    methodTitle: "Documentación, evidencia, decisiones — en ese orden.",
    method: [
      ["01  Documentación", "OrdiZapis: grabe en el móvil → nota estructurada. La misma cuenta en teléfono y web."],
      ["02  Evidencia", "Estudios y guías con DOI o PMID. Estándar peer review, no un resumen genérico."],
      ["03  Decisiones", "IA clínica y medicamentos como contexto — no un chatbot ni un diagnóstico."],
    ],
    roomsKicker: "Espacios de trabajo",
    roomsTitle: "El mismo escritorio después de la prueba.",
    roomsLead: "Sin reseñas inventadas ni cifras de audiencia. La FMC de reumatología es checa; no inventamos acreditación.",
    adsNote: "La publicidad de empresas sanitarias está en ViaLongeVita, no aquí.",
    footnote: "14 días gratis · OrdiZapis · Médico en ejercicio",
  },
  "pt-BR": {
    kicker: "Desk médico · MedScopeGlobal",
    title: ["Trabalho clínico.", "Nota, evidência, sem anúncios aqui."],
    lead: "OrdiZapis para ditado, guidelines com DOI/PMID e área profissional. 14 dias grátis. A zona médica fica sem AdSense e afiliados. Empresas anunciam na ViaLongeVita — identificadas, não nas ferramentas do consultório.",
    trial: "14 dias grátis",
    openOrdi: "Experimentar OrdiZapis",
    physicianPlan: "Médico em exercício",
    desk: "Área profissional",
    methodKicker: "Por que os médicos abrem isto",
    methodTitle: "Documentação, evidência, decisões — nessa ordem.",
    method: [
      ["01  Documentação", "OrdiZapis: grave no celular → nota estruturada. A mesma conta no telefone e na web."],
      ["02  Evidência", "Estudos e guidelines com DOI ou PMID. Padrão peer review, não um resumo genérico."],
      ["03  Decisões", "IA clínica e medicamentos como contexto — não um chatbot e não um diagnóstico."],
    ],
    roomsKicker: "Áreas de trabalho",
    roomsTitle: "O mesmo desk depois do teste.",
    roomsLead: "Sem avaliações inventadas nem números de audiência. A CME de reumatologia é tcheca — não inventamos credenciamento.",
    adsNote: "A publicidade de empresas de saúde fica na ViaLongeVita, não aqui.",
    footnote: "14 dias grátis · OrdiZapis · Médico em exercício",
  },
};

export function getPhysicianHubDashboardCopy(locale?: string | null): PhysicianDashboardCopy {
  return PACK[chromePack(locale)];
}
