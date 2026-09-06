import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type LegalChromeCopy = {
  officialNote: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyLead: string;
  cookiesTitle: string;
  cookiesDescription: string;
  cookiesLead: string;
  termsTitle: string;
  termsDescription: string;
  termsLead: string;
  helpMetaTitle: string;
  helpMetaDescription: string;
  helpEyebrow: string;
  helpTitle: string;
  helpLead: string;
  helpContactCta: string;
  helpLinksTitle: string;
  helpAccount: string;
  faqs: { q: string; a: string }[];
  brandTitle: string;
  brandDescription: string;
  brandLead: string;
  gdprTitle: string;
  gdprDescription: string;
  gdprLead: string;
  noticeTitle: string;
  noticeDescription: string;
  noticeLead: string;
  checklistTitle: string;
  checklistDescription: string;
  checklistLead: string;
};

const PACK: Record<ChromePack, LegalChromeCopy> = {
  cs: {
    officialNote: "",
    privacyTitle: "Ochrana soukromí",
    privacyDescription:
      "Zásady ochrany osobních údajů, cookies, analytika, newsletter a AI zpracování dat na MedScopeGlobal.",
    privacyLead: "Informace o zpracování osobních údajů dle nařízení EU 2016/679 (GDPR).",
    cookiesTitle: "Cookies a preference",
    cookiesDescription: "Informace o cookies a centrum preferencí MedScopeGlobal.",
    cookiesLead: "Jak používáme cookies a jak spravovat své preference.",
    termsTitle: "Obchodní podmínky",
    termsDescription:
      "Obchodní podmínky MedScopeGlobal — předplatné, odpovědnost, záruky, reklamace a ukončení služby.",
    termsLead: "Platné pro všechny uživatele platformy MedScopeGlobal.",
    helpMetaTitle: "Nápověda",
    helpMetaDescription:
      "Časté dotazy k MedScopeGlobal — účet, předplatné, obsah, AI asistent a technická podpora.",
    helpEyebrow: "Nápověda",
    helpTitle: "Jak vám můžeme pomoci",
    helpLead: "Odpovědi na nejčastější dotazy k účtu, předplatnému a obsahu MedScopeGlobal.",
    helpContactCta: "Kontaktovat podporu",
    helpLinksTitle: "Užitečné odkazy",
    helpAccount: "Můj účet",
    faqs: [
      {
        q: "Jak se zaregistruji?",
        a: "Registraci spustíte na stránce Registrace. Po potvrzení e-mailu získáte přístup k veřejnému obsahu.",
      },
      {
        q: "Jak funguje předplatné?",
        a: "Tarify a platby najdete v sekci Předplatné. Předplatné spravujete ve svém účtu; platby zpracovává Stripe.",
      },
      {
        q: "Mohu používat obsah v praxi?",
        a: "Obsah slouží ke vzdělávání a informování. Nepředstavuje individuální lékařskou radu ani diagnózu.",
      },
      {
        q: "Jak kontaktovat podporu?",
        a: "Napište na info@medscopeglobal.com, volejte +420 736 532 952, nebo využijte kontaktní formulář.",
      },
    ],
    brandTitle: "Značka a ochrana duševního vlastnictví",
    brandDescription:
      "MedScopeGlobal — prohlášení o značce, autorských právech a nezávislosti na Medscape, WebMD a dalších zahraničních portálech.",
    brandLead: "Právní postavení značky MedScopeGlobal, domény medscopeglobal.com a oddělení od zahraničních medicínských portálů.",
    gdprTitle: "Ochrana osobních údajů (GDPR)",
    gdprDescription: "Zpracování osobních údajů, cookies, analytika, newsletter a AI zpracování dat na MedScopeGlobal.",
    gdprLead: "Informace o zpracování osobních údajů dle nařízení EU 2016/679.",
    noticeTitle: "Právní upozornění",
    noticeDescription: "Právní upozornění, licenční podmínky a podmínky pro AI obsah MedScopeGlobal.",
    noticeLead: "Licenční podmínky, disclaimer a pravidla pro AI generovaný obsah.",
    checklistTitle: "Právní checklist",
    checklistDescription: "Akční checklist ochrany značky MedScopeGlobal — imprint, ochranná známka ÚPV/EUIPO, monitoring.",
    checklistLead: "Co je hotové na webu a co zbývá u advokáta / registrátora.",
  },
  de: {
    officialNote:
      "Der verbindliche Rechtstext bleibt Tschechisch. Die Titelzeile folgt dieser Ausgabe.",
    privacyTitle: "Datenschutz",
    privacyDescription:
      "Datenschutz, Cookies, Analytik, Newsletter und KI-Verarbeitung auf MedScopeGlobal.",
    privacyLead: "Informationen zur Verarbeitung personenbezogener Daten nach der EU-DSGVO 2016/679.",
    cookiesTitle: "Cookies und Einstellungen",
    cookiesDescription: "Cookie-Hinweise und Präferenzcenter von MedScopeGlobal.",
    cookiesLead: "Wie wir Cookies nutzen und wie Sie Ihre Einstellungen ändern.",
    termsTitle: "Nutzungsbedingungen",
    termsDescription:
      "Nutzungsbedingungen von MedScopeGlobal — Abo, Haftung, Gewährleistung und Kündigung.",
    termsLead: "Gilt für alle Nutzer der Plattform MedScopeGlobal.",
    helpMetaTitle: "Hilfe",
    helpMetaDescription:
      "Häufige Fragen zu MedScopeGlobal — Konto, Abo, Inhalte, KI-Assistent und Support.",
    helpEyebrow: "Hilfe",
    helpTitle: "Wie wir helfen können",
    helpLead: "Antworten zu Konto, Abo und Inhalten von MedScopeGlobal.",
    helpContactCta: "Support kontaktieren",
    helpLinksTitle: "Nützliche Links",
    helpAccount: "Mein Konto",
    faqs: [
      {
        q: "Wie registriere ich mich?",
        a: "Die Registrierung starten Sie auf der Registrierungsseite. Nach der E-Mail-Bestätigung öffnet sich der öffentliche Inhalt.",
      },
      {
        q: "Wie funktioniert das Abo?",
        a: "Tarife und Zahlung stehen unter Abo. Sie verwalten es in Ihrem Konto; Zahlungen laufen über Stripe.",
      },
      {
        q: "Darf ich den Inhalt in der Praxis nutzen?",
        a: "Der Inhalt dient der Information und Fortbildung. Er ist keine individuelle medizinische Beratung und keine Diagnose.",
      },
      {
        q: "Wie erreiche ich den Support?",
        a: "Schreiben Sie an info@medscopeglobal.com, rufen Sie +420 736 532 952 an oder nutzen Sie das Kontaktformular.",
      },
    ],
    brandTitle: "Marke und geistiges Eigentum",
    brandDescription:
      "MedScopeGlobal — Markenerklärung, Urheberrecht und Unabhängigkeit von Medscape, WebMD und anderen Portalen.",
    brandLead: "Rechtliche Stellung der Marke MedScopeGlobal, der Domain medscopeglobal.com und die Trennung von ausländischen Medizinportalen.",
    gdprTitle: "Datenschutz (DSGVO)",
    gdprDescription: "Verarbeitung personenbezogener Daten, Cookies, Analytik, Newsletter und KI auf MedScopeGlobal.",
    gdprLead: "Informationen zur Verarbeitung personenbezogener Daten nach der EU-Verordnung 2016/679.",
    noticeTitle: "Rechtliche Hinweise",
    noticeDescription: "Rechtliche Hinweise, Lizenzbedingungen und Regeln für KI-Inhalte auf MedScopeGlobal.",
    noticeLead: "Lizenzbedingungen, Disclaimer und Regeln für KI-generierte Inhalte.",
    checklistTitle: "Rechtliche Checkliste",
    checklistDescription: "Checkliste zum Markenschutz von MedScopeGlobal — Impressum, Marke ÚPV/EUIPO, Monitoring.",
    checklistLead: "Was auf der Website steht und was beim Anwalt / Registrar bleibt.",
  },
  fr: {
    officialNote:
      "Le texte juridique contraignant reste en tchèque. Le bandeau suit cette édition.",
    privacyTitle: "Confidentialité",
    privacyDescription:
      "Confidentialité, cookies, analytique, newsletter et traitement IA sur MedScopeGlobal.",
    privacyLead: "Informations sur le traitement des données personnelles selon le RGPD UE 2016/679.",
    cookiesTitle: "Cookies et préférences",
    cookiesDescription: "Informations cookies et centre de préférences MedScopeGlobal.",
    cookiesLead: "Comment nous utilisons les cookies et comment gérer vos préférences.",
    termsTitle: "Conditions d’utilisation",
    termsDescription:
      "Conditions MedScopeGlobal — abonnement, responsabilité, garanties et résiliation.",
    termsLead: "Valable pour tous les utilisateurs de la plateforme MedScopeGlobal.",
    helpMetaTitle: "Aide",
    helpMetaDescription:
      "Questions fréquentes sur MedScopeGlobal — compte, abonnement, contenus, assistant IA et support.",
    helpEyebrow: "Aide",
    helpTitle: "Comment nous pouvons aider",
    helpLead: "Réponses sur le compte, l’abonnement et les contenus MedScopeGlobal.",
    helpContactCta: "Contacter le support",
    helpLinksTitle: "Liens utiles",
    helpAccount: "Mon compte",
    faqs: [
      {
        q: "Comment m’inscrire ?",
        a: "L’inscription se lance sur la page Inscription. Après confirmation de l’e-mail, le contenu public s’ouvre.",
      },
      {
        q: "Comment fonctionne l’abonnement ?",
        a: "Tarifs et paiement sont dans Abonnement. Vous le gérez dans votre compte ; Stripe traite les paiements.",
      },
      {
        q: "Puis-je utiliser le contenu en pratique ?",
        a: "Le contenu sert à l’information et à la formation. Ce n’est pas un avis médical individuel ni un diagnostic.",
      },
      {
        q: "Comment contacter le support ?",
        a: "Écrivez à info@medscopeglobal.com, appelez le +420 736 532 952 ou utilisez le formulaire de contact.",
      },
    ],
    brandTitle: "Marque et propriété intellectuelle",
    brandDescription:
      "MedScopeGlobal — déclaration de marque, droits d’auteur et indépendance vis-à-vis de Medscape, WebMD et d’autres portails.",
    brandLead: "Statut juridique de la marque MedScopeGlobal, du domaine medscopeglobal.com et séparation des portails médicaux étrangers.",
    gdprTitle: "Protection des données (RGPD)",
    gdprDescription: "Traitement des données, cookies, analytique, newsletter et IA sur MedScopeGlobal.",
    gdprLead: "Informations sur le traitement des données personnelles selon le règlement UE 2016/679.",
    noticeTitle: "Mentions légales",
    noticeDescription: "Mentions légales, licences et règles pour le contenu IA de MedScopeGlobal.",
    noticeLead: "Conditions de licence, disclaimer et règles pour le contenu généré par IA.",
    checklistTitle: "Checklist juridique",
    checklistDescription: "Checklist de protection de la marque MedScopeGlobal — mentions, marque ÚPV/EUIPO, suivi.",
    checklistLead: "Ce qui est en place sur le site et ce qui reste chez l’avocat / le registrar.",
  },
  en: {
    officialNote:
      "The binding legal text stays in Czech. The page title follows this edition.",
    privacyTitle: "Privacy",
    privacyDescription:
      "Privacy, cookies, analytics, newsletter and AI data processing on MedScopeGlobal.",
    privacyLead: "Information on personal-data processing under EU GDPR 2016/679.",
    cookiesTitle: "Cookies and preferences",
    cookiesDescription: "Cookie information and the MedScopeGlobal preference centre.",
    cookiesLead: "How we use cookies and how to manage your preferences.",
    termsTitle: "Terms of use",
    termsDescription:
      "MedScopeGlobal terms — subscription, liability, warranties and cancellation.",
    termsLead: "Applies to every user of the MedScopeGlobal platform.",
    helpMetaTitle: "Help",
    helpMetaDescription:
      "Common questions about MedScopeGlobal — account, subscription, content, AI assistant and support.",
    helpEyebrow: "Help",
    helpTitle: "How we can help",
    helpLead: "Answers about the MedScopeGlobal account, subscription and content.",
    helpContactCta: "Contact support",
    helpLinksTitle: "Useful links",
    helpAccount: "My account",
    faqs: [
      {
        q: "How do I register?",
        a: "Start on the Registration page. After you confirm the email, public content opens.",
      },
      {
        q: "How does the subscription work?",
        a: "Plans and payment are on Subscription. You manage it in your account; Stripe processes payments.",
      },
      {
        q: "May I use the content in practice?",
        a: "The content is for information and education. It is not individual medical advice or a diagnosis.",
      },
      {
        q: "How do I contact support?",
        a: "Write to info@medscopeglobal.com, call +420 736 532 952, or use the contact form.",
      },
    ],
    brandTitle: "Brand and intellectual property",
    brandDescription:
      "MedScopeGlobal — brand statement, copyright and independence from Medscape, WebMD and other portals.",
    brandLead: "Legal standing of the MedScopeGlobal brand, the medscopeglobal.com domain, and separation from foreign medical portals.",
    gdprTitle: "Personal-data protection (GDPR)",
    gdprDescription: "Personal-data processing, cookies, analytics, newsletter and AI on MedScopeGlobal.",
    gdprLead: "Information on personal-data processing under EU regulation 2016/679.",
    noticeTitle: "Legal notice",
    noticeDescription: "Legal notice, licence terms and rules for MedScopeGlobal AI content.",
    noticeLead: "Licence terms, disclaimer and rules for AI-generated content.",
    checklistTitle: "Legal checklist",
    checklistDescription: "Brand-protection checklist for MedScopeGlobal — imprint, ÚPV/EUIPO mark, monitoring.",
    checklistLead: "What is live on the site and what remains with counsel / the registrar.",
  },
  it: {
    officialNote:
      "Il testo giuridico vincolante resta in ceco. Il titolo segue questa edizione.",
    privacyTitle: "Privacy",
    privacyDescription:
      "Privacy, cookie, analitica, newsletter e trattamento IA su MedScopeGlobal.",
    privacyLead: "Informazioni sul trattamento dei dati personali secondo il GDPR UE 2016/679.",
    cookiesTitle: "Cookie e preferenze",
    cookiesDescription: "Informazioni sui cookie e centro preferenze MedScopeGlobal.",
    cookiesLead: "Come usiamo i cookie e come gestire le preferenze.",
    termsTitle: "Condizioni d’uso",
    termsDescription:
      "Condizioni MedScopeGlobal — abbonamento, responsabilità, garanzie e recesso.",
    termsLead: "Valide per tutti gli utenti della piattaforma MedScopeGlobal.",
    helpMetaTitle: "Aiuto",
    helpMetaDescription:
      "Domande frequenti su MedScopeGlobal — account, abbonamento, contenuti, assistente IA e supporto.",
    helpEyebrow: "Aiuto",
    helpTitle: "Come possiamo aiutare",
    helpLead: "Risposte su account, abbonamento e contenuti MedScopeGlobal.",
    helpContactCta: "Contatta il supporto",
    helpLinksTitle: "Link utili",
    helpAccount: "Il mio account",
    faqs: [
      {
        q: "Come mi registro?",
        a: "La registrazione parte dalla pagina Registrazione. Dopo la conferma e-mail si apre il contenuto pubblico.",
      },
      {
        q: "Come funziona l’abbonamento?",
        a: "Tariffe e pagamento sono in Abbonamento. Lo gestisci nell’account; i pagamenti passano da Stripe.",
      },
      {
        q: "Posso usare i contenuti nella pratica?",
        a: "I contenuti servono a informare e formare. Non sono un parere medico individuale né una diagnosi.",
      },
      {
        q: "Come contatto il supporto?",
        a: "Scrivi a info@medscopeglobal.com, chiama +420 736 532 952 o usa il modulo di contatto.",
      },
    ],
    brandTitle: "Marchio e proprietà intellettuale",
    brandDescription:
      "MedScopeGlobal — dichiarazione di marchio, diritti d’autore e indipendenza da Medscape, WebMD e altri portali.",
    brandLead: "Posizione giuridica del marchio MedScopeGlobal, del dominio medscopeglobal.com e separazione dai portali medici esteri.",
    gdprTitle: "Protezione dei dati (GDPR)",
    gdprDescription: "Trattamento dei dati, cookie, analitica, newsletter e IA su MedScopeGlobal.",
    gdprLead: "Informazioni sul trattamento dei dati personali ai sensi del regolamento UE 2016/679.",
    noticeTitle: "Avvertenze legali",
    noticeDescription: "Avvertenze, licenze e regole per i contenuti IA di MedScopeGlobal.",
    noticeLead: "Condizioni di licenza, disclaimer e regole per i contenuti generati da IA.",
    checklistTitle: "Checklist legale",
    checklistDescription: "Checklist di tutela del marchio MedScopeGlobal — imprint, marchio ÚPV/EUIPO, monitoraggio.",
    checklistLead: "Cosa è già sul sito e cosa resta all’avvocato / al registrar.",
  },
  es: {
    officialNote:
      "El texto legal vinculante sigue en checo. El título sigue esta edición.",
    privacyTitle: "Privacidad",
    privacyDescription:
      "Privacidad, cookies, analítica, boletín y tratamiento de IA en MedScopeGlobal.",
    privacyLead: "Información sobre el tratamiento de datos personales según el RGPD UE 2016/679.",
    cookiesTitle: "Cookies y preferencias",
    cookiesDescription: "Información de cookies y centro de preferencias de MedScopeGlobal.",
    cookiesLead: "Cómo usamos las cookies y cómo gestionar las preferencias.",
    termsTitle: "Condiciones de uso",
    termsDescription:
      "Condiciones de MedScopeGlobal — suscripción, responsabilidad, garantías y baja.",
    termsLead: "Aplican a todos los usuarios de la plataforma MedScopeGlobal.",
    helpMetaTitle: "Ayuda",
    helpMetaDescription:
      "Preguntas frecuentes sobre MedScopeGlobal — cuenta, suscripción, contenidos, asistente IA y soporte.",
    helpEyebrow: "Ayuda",
    helpTitle: "Cómo podemos ayudar",
    helpLead: "Respuestas sobre la cuenta, la suscripción y los contenidos de MedScopeGlobal.",
    helpContactCta: "Contactar con soporte",
    helpLinksTitle: "Enlaces útiles",
    helpAccount: "Mi cuenta",
    faqs: [
      {
        q: "¿Cómo me registro?",
        a: "El registro empieza en la página Registro. Tras confirmar el correo se abre el contenido público.",
      },
      {
        q: "¿Cómo funciona la suscripción?",
        a: "Tarifas y pago están en Suscripción. La gestiona en su cuenta; Stripe procesa los pagos.",
      },
      {
        q: "¿Puedo usar el contenido en la práctica?",
        a: "El contenido informa y forma. No es consejo médico individual ni un diagnóstico.",
      },
      {
        q: "¿Cómo contacto con soporte?",
        a: "Escriba a info@medscopeglobal.com, llame al +420 736 532 952 o use el formulario de contacto.",
      },
    ],
    brandTitle: "Marca y propiedad intelectual",
    brandDescription:
      "MedScopeGlobal — declaración de marca, derechos de autor e independencia de Medscape, WebMD y otros portales.",
    brandLead: "Posición jurídica de la marca MedScopeGlobal, el dominio medscopeglobal.com y la separación de portales médicos extranjeros.",
    gdprTitle: "Protección de datos (RGPD)",
    gdprDescription: "Tratamiento de datos, cookies, analítica, boletín e IA en MedScopeGlobal.",
    gdprLead: "Información sobre el tratamiento de datos personales según el reglamento UE 2016/679.",
    noticeTitle: "Aviso legal",
    noticeDescription: "Aviso legal, licencias y reglas para el contenido de IA de MedScopeGlobal.",
    noticeLead: "Condiciones de licencia, descargo y reglas para el contenido generado por IA.",
    checklistTitle: "Lista legal",
    checklistDescription: "Lista de protección de marca MedScopeGlobal — imprint, marca ÚPV/EUIPO, seguimiento.",
    checklistLead: "Lo que ya está en el sitio y lo que queda con el abogado / el registrador.",
  },
  "pt-BR": {
    officialNote:
      "O texto jurídico vinculativo permanece em checo. O título segue esta edição.",
    privacyTitle: "Privacidade",
    privacyDescription:
      "Privacidade, cookies, analítica, newsletter e tratamento de IA no MedScopeGlobal.",
    privacyLead: "Informação sobre o tratamento de dados pessoais ao abrigo do RGPD UE 2016/679.",
    cookiesTitle: "Cookies e preferências",
    cookiesDescription: "Informação de cookies e centro de preferências do MedScopeGlobal.",
    cookiesLead: "Como usamos cookies e como gerir as preferências.",
    termsTitle: "Condições de utilização",
    termsDescription:
      "Condições MedScopeGlobal — subscrição, responsabilidade, garantias e cancelamento.",
    termsLead: "Aplicam-se a todos os utilizadores da plataforma MedScopeGlobal.",
    helpMetaTitle: "Ajuda",
    helpMetaDescription:
      "Perguntas frequentes sobre o MedScopeGlobal — conta, subscrição, conteúdos, assistente IA e suporte.",
    helpEyebrow: "Ajuda",
    helpTitle: "Como podemos ajudar",
    helpLead: "Respostas sobre conta, subscrição e conteúdos do MedScopeGlobal.",
    helpContactCta: "Contactar o suporte",
    helpLinksTitle: "Ligações úteis",
    helpAccount: "A minha conta",
    faqs: [
      {
        q: "Como me registo?",
        a: "O registo começa na página Registo. Depois de confirmar o e-mail, o conteúdo público abre-se.",
      },
      {
        q: "Como funciona a subscrição?",
        a: "Planos e pagamento estão em Subscrição. Gere-a na conta; a Stripe processa os pagamentos.",
      },
      {
        q: "Posso usar o conteúdo na prática?",
        a: "O conteúdo informa e forma. Não é conselho médico individual nem um diagnóstico.",
      },
      {
        q: "Como contacto o suporte?",
        a: "Escreva para info@medscopeglobal.com, ligue +420 736 532 952 ou use o formulário de contacto.",
      },
    ],
    brandTitle: "Marca e propriedade intelectual",
    brandDescription:
      "MedScopeGlobal — declaração de marca, direitos de autor e independência face a Medscape, WebMD e outros portais.",
    brandLead: "Posição jurídica da marca MedScopeGlobal, do domínio medscopeglobal.com e separação dos portais médicos estrangeiros.",
    gdprTitle: "Proteção de dados (RGPD)",
    gdprDescription: "Tratamento de dados, cookies, analítica, newsletter e IA no MedScopeGlobal.",
    gdprLead: "Informação sobre o tratamento de dados pessoais ao abrigo do regulamento UE 2016/679.",
    noticeTitle: "Aviso legal",
    noticeDescription: "Aviso legal, licenças e regras para conteúdos de IA do MedScopeGlobal.",
    noticeLead: "Condições de licença, disclaimer e regras para conteúdos gerados por IA.",
    checklistTitle: "Lista jurídica",
    checklistDescription: "Lista de proteção da marca MedScopeGlobal — imprint, marca ÚPV/EUIPO, monitorização.",
    checklistLead: "O que já está no sítio e o que fica com o advogado / o registador.",
  },
};

export function getLegalChromeCopy(locale?: string | null): LegalChromeCopy {
  return PACK[chromePack(locale)];
}
