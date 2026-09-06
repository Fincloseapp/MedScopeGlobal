/**
 * /ordizaznam marketing page. Product name stays OrdiZapis on non-CS;
 * Czech edition keeps the existing OrdiZáznam lockup.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type OrdiZaznamBenefit = {
  title: string;
  description: string;
};

export type OrdiZaznamCopy = {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  hero: string;
  tryDemo: string;
  trialCta: string;
  whyTitle: string;
  benefits: OrdiZaznamBenefit[];
  priceEyebrow: string;
  priceTitle: (clinic: string) => string;
  priceNote: (physician: string) => string;
  choosePlan: string;
  demoFirst: string;
  legalTitle: string;
  legal: string;
  closeTitle: string;
  closeLead: string;
  launch: string;
};

type PackCopy = Omit<OrdiZaznamCopy, "priceTitle" | "priceNote"> & {
  priceTitle: string;
  priceNote: string;
};

const PACK: Record<ChromePack, PackCopy> = {
  cs: {
    metaTitle: "OrdiZáznam — Profesionální nástroj pro lékaře | MedScopeGlobal",
    metaDescription:
      "OrdiZáznam: nahrávejte v mobilu diktát nebo konzultaci → odborná anamnéza a klinický zápis. GDPR, šifrování, 14 dní zdarma.",
    brand: "OrdiZáznam",
    hero: "Nahrajte diktát nebo konzultaci — hotový klinický zápis za minuty, ne za čtvrt hodiny.",
    tryDemo: "Vyzkoušet demo",
    trialCta: "14 dní zdarma",
    whyTitle: "Proč lékaři přecházejí na OrdiZáznam",
    benefits: [
      {
        title: "Diktát → strukturovaný zápis",
        description: "Nahrajte konzultaci v telefonu. OrdiZáznam sestaví anamnézu a klinický zápis.",
      },
      {
        title: "Mobil a web v synchronu",
        description: "Stejná historie zápisů v ordinaci i cestou — bez přepisování.",
      },
      {
        title: "GDPR a šifrování v EU",
        description: "Data v klidu i při přenosu. Nástroj pro dokumentaci, ne náhrada úsudku.",
      },
    ],
    priceEyebrow: "Ceník",
    priceTitle: "{clinic} / měsíc",
    priceNote:
      "Neomezené zápisy, všechny šablony, mobil + web. 14 dní zdarma. Tarif Lékař v praxi ({physician}) přidá guidelines, CME a klinického AI asistenta.",
    choosePlan: "Vybrat tarif",
    demoFirst: "Nejdřív demo",
    legalTitle: "Právní upozornění.",
    legal:
      "OrdiZáznam je nástroj pro dokumentaci, nikoli náhrada klinického úsudku. Lékař nese plnou odpovědnost za obsah a správnost zápisu. Data jsou zpracovávána v souladu s GDPR (EU). OrdiZáznam není certifikován jako zdravotnický prostředek.",
    closeTitle: "Začněte ještě dnes",
    closeLead: "14 dní zdarma · Bez závazků · Zrušení kdykoliv",
    launch: "Spustit OrdiZáznam",
  },
  de: {
    metaTitle: "OrdiZapis — Dokumentation für die Praxis | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: Diktat oder Gespräch aufnehmen — strukturierte Anamnese und klinische Notiz. DSGVO, EU-Hosting, 14 Tage testen.",
    brand: "OrdiZapis",
    hero: "Diktat oder Gespräch aufnehmen — die klinische Notiz in Minuten, nicht in einer Viertelstunde.",
    tryDemo: "Demo starten",
    trialCta: "14 Tage kostenlos",
    whyTitle: "Warum Praxen auf OrdiZapis wechseln",
    benefits: [
      {
        title: "Diktat → strukturierte Notiz",
        description: "Gespräch am Telefon aufnehmen. OrdiZapis entwirft Anamnese und klinische Notiz.",
      },
      {
        title: "Handy und Web im Gleichstand",
        description: "Dieselbe Notizhistorie in der Praxis und unterwegs — ohne Abtippen.",
      },
      {
        title: "DSGVO und Verschlüsselung in der EU",
        description: "Ruhende und übertragene Daten. Ein Dokumentationswerkzeug, kein Ersatz für Urteil.",
      },
    ],
    priceEyebrow: "Preis",
    priceTitle: "{clinic} / Monat",
    priceNote:
      "Unbegrenzte Notizen, alle Vorlagen, Mobil + Web. 14 Tage kostenlos. Der Praxis-Tarif ({physician}) ergänzt Leitlinien, CME und einen klinischen KI-Assistenten.",
    choosePlan: "Tarif wählen",
    demoFirst: "Zuerst die Demo",
    legalTitle: "Rechtlicher Hinweis.",
    legal:
      "OrdiZapis ist ein Dokumentationswerkzeug, kein Ersatz für klinisches Urteil. Die Ärztin oder der Arzt bleibt für Inhalt und Richtigkeit verantwortlich. Datenverarbeitung nach DSGVO (EU). OrdiZapis ist kein zertifiziertes Medizinprodukt.",
    closeTitle: "Heute beginnen",
    closeLead: "14 Tage kostenlos · Ohne Bindung · Jederzeit kündbar",
    launch: "OrdiZapis öffnen",
  },
  fr: {
    metaTitle: "OrdiZapis — Documentation pour le cabinet | MedScopeGlobal",
    metaDescription:
      "OrdiZapis : dictez ou enregistrez une consultation — anamnèse et note clinique structurées. RGPD, hébergement UE, 14 jours d’essai.",
    brand: "OrdiZapis",
    hero: "Dictez ou enregistrez une consultation — une note clinique en quelques minutes, pas en un quart d’heure.",
    tryDemo: "Essayer la démo",
    trialCta: "14 jours gratuits",
    whyTitle: "Pourquoi les cabinets passent à OrdiZapis",
    benefits: [
      {
        title: "Dictée → note structurée",
        description: "Enregistrez la consultation sur le téléphone. OrdiZapis prépare l’anamnèse et la note.",
      },
      {
        title: "Mobile et web alignés",
        description: "Le même historique au cabinet et en déplacement — sans retaper.",
      },
      {
        title: "RGPD et chiffrement dans l’UE",
        description: "Données au repos et en transit. Un outil de documentation, pas un substitut au jugement.",
      },
    ],
    priceEyebrow: "Tarif",
    priceTitle: "{clinic} / mois",
    priceNote:
      "Notes illimitées, tous les modèles, mobile + web. 14 jours gratuits. L’offre médecin en exercice ({physician}) ajoute recommandations, FMC et un assistant IA clinique.",
    choosePlan: "Choisir une offre",
    demoFirst: "D’abord la démo",
    legalTitle: "Mention légale.",
    legal:
      "OrdiZapis est un outil de documentation, pas un substitut au jugement clinique. Le médecin reste responsable du contenu et de l’exactitude. Traitement des données selon le RGPD (UE). OrdiZapis n’est pas un dispositif médical certifié.",
    closeTitle: "Commencer aujourd’hui",
    closeLead: "14 jours gratuits · Sans engagement · Annulation à tout moment",
    launch: "Ouvrir OrdiZapis",
  },
  it: {
    metaTitle: "OrdiZapis — Documentazione per lo studio | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dettate o registrate una visita — anamnesi e nota clinica strutturate. GDPR, hosting UE, 14 giorni di prova.",
    brand: "OrdiZapis",
    hero: "Dettate o registrate una visita — nota clinica in pochi minuti, non in un quarto d’ora.",
    tryDemo: "Prova la demo",
    trialCta: "14 giorni gratis",
    whyTitle: "Perché gli studi passano a OrdiZapis",
    benefits: [
      {
        title: "Detta → nota strutturata",
        description: "Registrate la visita sul telefono. OrdiZapis prepara anamnesi e nota clinica.",
      },
      {
        title: "Mobile e web allineati",
        description: "Lo stesso storico in ambulatorio e in movimento — senza ribattere.",
      },
      {
        title: "GDPR e cifratura nell’UE",
        description: "Dati a riposo e in transito. Uno strumento di documentazione, non un sostituto del giudizio.",
      },
    ],
    priceEyebrow: "Prezzo",
    priceTitle: "{clinic} / mese",
    priceNote:
      "Note illimitate, tutti i modelli, mobile + web. 14 giorni gratis. Il piano medico in pratica ({physician}) aggiunge linee guida, ECM e un assistente IA clinico.",
    choosePlan: "Scegli un piano",
    demoFirst: "Prima la demo",
    legalTitle: "Avvertenza legale.",
    legal:
      "OrdiZapis è uno strumento di documentazione, non un sostituto del giudizio clinico. Il medico resta responsabile di contenuto e correttezza. Trattamento dati secondo il GDPR (UE). OrdiZapis non è un dispositivo medico certificato.",
    closeTitle: "Inizia oggi",
    closeLead: "14 giorni gratis · Senza vincoli · Disdici quando vuoi",
    launch: "Apri OrdiZapis",
  },
  es: {
    metaTitle: "OrdiZapis — Documentación para la consulta | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dicte o grabe una consulta — anamnesis y nota clínica estructuradas. RGPD, alojamiento en la UE, 14 días de prueba.",
    brand: "OrdiZapis",
    hero: "Dicte o grabe una consulta — una nota clínica en minutos, no en un cuarto de hora.",
    tryDemo: "Probar la demo",
    trialCta: "14 días gratis",
    whyTitle: "Por qué las consultas pasan a OrdiZapis",
    benefits: [
      {
        title: "Dictado → nota estructurada",
        description: "Grabe la consulta en el teléfono. OrdiZapis prepara la anamnesis y la nota.",
      },
      {
        title: "Móvil y web alineados",
        description: "El mismo historial en consulta y de camino — sin volver a teclear.",
      },
      {
        title: "RGPD y cifrado en la UE",
        description: "Datos en reposo y en tránsito. Una herramienta de documentación, no un sustituto del juicio.",
      },
    ],
    priceEyebrow: "Precio",
    priceTitle: "{clinic} / mes",
    priceNote:
      "Notas ilimitadas, todas las plantillas, móvil + web. 14 días gratis. El plan de médico en ejercicio ({physician}) añade guías, FMC y un asistente de IA clínica.",
    choosePlan: "Elegir un plan",
    demoFirst: "Primero la demo",
    legalTitle: "Aviso legal.",
    legal:
      "OrdiZapis es una herramienta de documentación, no un sustituto del juicio clínico. El médico sigue siendo responsable del contenido y de su exactitud. Tratamiento de datos según el RGPD (UE). OrdiZapis no es un producto sanitario certificado.",
    closeTitle: "Empiece hoy",
    closeLead: "14 días gratis · Sin compromiso · Cancele cuando quiera",
    launch: "Abrir OrdiZapis",
  },
  "pt-BR": {
    metaTitle: "OrdiZapis — Documentação para o consultório | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: dite ou grave uma consulta — anamnese e nota clínica estruturadas. LGPD/GDPR, hospedagem na UE, 14 dias grátis.",
    brand: "OrdiZapis",
    hero: "Dite ou grave uma consulta — nota clínica em minutos, não em um quarto de hora.",
    tryDemo: "Experimentar a demo",
    trialCta: "14 dias grátis",
    whyTitle: "Por que os consultórios passam para o OrdiZapis",
    benefits: [
      {
        title: "Ditado → nota estruturada",
        description: "Grave a consulta no telefone. O OrdiZapis prepara anamnese e nota clínica.",
      },
      {
        title: "Celular e web alinhados",
        description: "O mesmo histórico no consultório e no caminho — sem redigitar.",
      },
      {
        title: "LGPD/GDPR e criptografia na UE",
        description: "Dados em repouso e em trânsito. Ferramenta de documentação, não substituto do julgamento.",
      },
    ],
    priceEyebrow: "Preço",
    priceTitle: "{clinic} / mês",
    priceNote:
      "Notas ilimitadas, todos os modelos, celular + web. 14 dias grátis. O plano médico em prática ({physician}) acrescenta diretrizes, educação continuada e um assistente de IA clínica.",
    choosePlan: "Escolher um plano",
    demoFirst: "Primeiro a demo",
    legalTitle: "Aviso legal.",
    legal:
      "O OrdiZapis é uma ferramenta de documentação, não um substituto do julgamento clínico. O médico permanece responsável pelo conteúdo e pela exatidão. Tratamento de dados conforme o GDPR (UE). O OrdiZapis não é um dispositivo médico certificado.",
    closeTitle: "Comece hoje",
    closeLead: "14 dias grátis · Sem fidelidade · Cancele quando quiser",
    launch: "Abrir o OrdiZapis",
  },
  en: {
    metaTitle: "OrdiZapis — Clinical documentation for the practice | MedScopeGlobal",
    metaDescription:
      "OrdiZapis: record a dictation or consult — structured history and clinical note. GDPR, EU hosting, 14-day trial.",
    brand: "OrdiZapis",
    hero: "Record a dictation or consult — a clinical note in minutes, not a quarter-hour.",
    tryDemo: "Try the demo",
    trialCta: "14 days free",
    whyTitle: "Why clinics switch to OrdiZapis",
    benefits: [
      {
        title: "Dictation → structured note",
        description: "Record the consult on your phone. OrdiZapis drafts the history and the clinical note.",
      },
      {
        title: "Phone and web in sync",
        description: "The same note history in clinic and on the move — no retyping.",
      },
      {
        title: "GDPR and encryption in the EU",
        description: "Data at rest and in transit. A documentation tool, not a substitute for judgment.",
      },
    ],
    priceEyebrow: "Pricing",
    priceTitle: "{clinic} / month",
    priceNote:
      "Unlimited notes, all templates, mobile + web. 14 days free. The practicing-physician plan ({physician}) adds guidelines, CME, and a clinical AI assistant.",
    choosePlan: "Choose a plan",
    demoFirst: "Start with the demo",
    legalTitle: "Legal notice.",
    legal:
      "OrdiZapis is a documentation tool, not a substitute for clinical judgment. The clinician remains responsible for the content and accuracy of the note. Data is processed under the GDPR (EU). OrdiZapis is not a certified medical device.",
    closeTitle: "Start today",
    closeLead: "14 days free · No commitment · Cancel anytime",
    launch: "Open OrdiZapis",
  },
};

export function getOrdiZaznamCopy(locale?: string | null): OrdiZaznamCopy {
  const raw = PACK[chromePack(locale)];
  return {
    ...raw,
    priceTitle: (clinic) => raw.priceTitle.replace("{clinic}", clinic),
    priceNote: (physician) => raw.priceNote.replace("{physician}", physician),
  };
}
