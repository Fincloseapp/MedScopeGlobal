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
  },
};

export function getLegalChromeCopy(locale?: string | null): LegalChromeCopy {
  return PACK[chromePack(locale)];
}
