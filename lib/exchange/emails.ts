import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type ExchangeMailKind = "registration" | "subscription" | "inquiry";

export type ExchangeMailTemplate = {
  kind: ExchangeMailKind;
  subject: string;
  preview: string;
  html: string;
  text: string;
};

const PACK: Record<ChromePack, Record<ExchangeMailKind, Omit<ExchangeMailTemplate, "kind" | "html" | "text">>> = {
  cs: {
    registration: {
      subject: "MedScope B2B Exchange — účet firmy je založen",
      preview: "Ověřte e-mail a zveřejněte první nabídku. Poptávky uvidíte až v tarifu Pro.",
    },
    subscription: {
      subject: "Předplatné Pro / Enterprise je aktivní",
      preview: "Kontakty z poptávek jsou odemčené. Můžete odpovídat napřímo.",
    },
    inquiry: {
      subject: "Nová B2B poptávka na MedScope Exchange",
      preview: "Platící inzerent vidí jméno, e-mail a telefon kupujícího.",
    },
  },
  en: {
    registration: {
      subject: "MedScope B2B Exchange — organisation account created",
      preview: "Verify email and publish a listing. Inquiries unlock on Pro.",
    },
    subscription: {
      subject: "Your Pro / Enterprise subscription is active",
      preview: "Inquiry contacts are unlocked. Reply directly.",
    },
    inquiry: {
      subject: "New B2B inquiry on MedScope Exchange",
      preview: "Paying advertisers see the buyer’s name, email and phone.",
    },
  },
  de: {
    registration: {
      subject: "MedScope B2B Exchange — Organisationskonto angelegt",
      preview: "E-Mail bestätigen. Anfragen erst ab Pro.",
    },
    subscription: {
      subject: "Pro- / Enterprise-Abo ist aktiv",
      preview: "Kontakte sind freigeschaltet.",
    },
    inquiry: {
      subject: "Neue B2B-Anfrage auf MedScope Exchange",
      preview: "Zahlende Inserenten sehen Kontaktdaten.",
    },
  },
  fr: {
    registration: {
      subject: "MedScope B2B Exchange — compte organisation créé",
      preview: "Vérifiez l’e-mail. Les demandes s’ouvrent avec Pro.",
    },
    subscription: {
      subject: "Abonnement Pro / Enterprise actif",
      preview: "Les contacts sont déverrouillés.",
    },
    inquiry: {
      subject: "Nouvelle demande B2B sur MedScope Exchange",
      preview: "Les annonceurs payants voient e-mail et téléphone.",
    },
  },
  it: {
    registration: {
      subject: "MedScope B2B Exchange — account organizzazione creato",
      preview: "Verifica e-mail. Le richieste si sbloccano con Pro.",
    },
    subscription: {
      subject: "Abbonamento Pro / Enterprise attivo",
      preview: "I contatti sono sbloccati.",
    },
    inquiry: {
      subject: "Nuova richiesta B2B su MedScope Exchange",
      preview: "Gli inserzionisti paganti vedono email e telefono.",
    },
  },
  es: {
    registration: {
      subject: "MedScope B2B Exchange — cuenta de organización creada",
      preview: "Verifique el correo. Las solicitudes se abren con Pro.",
    },
    subscription: {
      subject: "Suscripción Pro / Enterprise activa",
      preview: "Los contactos están desbloqueados.",
    },
    inquiry: {
      subject: "Nueva solicitud B2B en MedScope Exchange",
      preview: "Los anunciantes de pago ven correo y teléfono.",
    },
  },
  "pt-BR": {
    registration: {
      subject: "MedScope B2B Exchange — conta da organização criada",
      preview: "Confirme o e-mail. Pedidos abrem no Pro.",
    },
    subscription: {
      subject: "Assinatura Pro / Enterprise ativa",
      preview: "Contactos desbloqueados.",
    },
    inquiry: {
      subject: "Novo pedido B2B no MedScope Exchange",
      preview: "Anunciantes pagantes vêem e-mail e telefone.",
    },
  },
};

const BODY: Record<ExchangeMailKind, { cs: string; en: string }> = {
  registration: {
    cs: "Dobrý den,\n\núčet organizace na MedScope B2B Exchange je založen. Ověřte e-mail, odsouhlaste právní dokumenty a vložte první nabídku s povinným polem availability_region (EU / USA / Asia / Global).\n\nTarif Basic je zdarma: nabídky zveřejníte, poptávky a kontakty kupujících ale neuvidíte. Pro odemkne poptávky, kontakty, odpovědi, zvýraznění a statistiky.\n\nMedScopeGlobal nezpracovává platby mezi stranami.\n\nMedScope B2B Exchange",
    en: "Hello,\n\nyour organisation account on MedScope B2B Exchange is created. Verify email, accept the legal documents and publish a first listing with mandatory availability_region (EU / USA / Asia / Global).\n\nBasic is free: you may list, but you will not receive inquiries or buyer contacts. Pro unlocks inquiries, contacts, replies, featuring and statistics.\n\nMedScopeGlobal does not process payments between the parties.\n\nMedScope B2B Exchange",
  },
  subscription: {
    cs: "Dobrý den,\n\npředplatné je aktivní. Od teď vidíte jméno, e-mail a telefon u poptávek a můžete odpovídat napřímo. Marketplace si z obchodu nebere provizi — jediný poplatek je toto předplatné.\n\nDashboard: /exchange/dashboard\nPoptávky: /exchange/inquiries\n\nMedScope B2B Exchange",
    en: "Hello,\n\nyour subscription is active. You now see name, email and phone on inquiries and can reply directly. The marketplace takes no deal commission — the subscription is the only fee.\n\nDashboard: /exchange/dashboard\nInquiries: /exchange/inquiries\n\nMedScope B2B Exchange",
  },
  inquiry: {
    cs: "Dobrý den,\n\nna vaši nabídku přišla nová B2B poptávka. Pokud máte Pro nebo Enterprise, kontakty kupujícího jsou v /exchange/inquiries. Tarif Basic ukáže jen anonymní náhled bez e-mailu a telefonu.\n\nNezasílejte zdravotní údaje pacientů.\n\nMedScope B2B Exchange",
    en: "Hello,\n\na new B2B inquiry arrived on your listing. With Pro or Enterprise, buyer contacts are in /exchange/inquiries. Basic shows an anonymous teaser without email or phone.\n\nDo not send patient health data.\n\nMedScope B2B Exchange",
  },
};

export function exchangeMailTemplate(kind: ExchangeMailKind, locale?: string | null): ExchangeMailTemplate {
  const pack = chromePack(locale);
  const meta = PACK[pack][kind];
  const body = pack === "cs" ? BODY[kind].cs : BODY[kind].en;
  return {
    kind,
    subject: meta.subject,
    preview: meta.preview,
    text: body,
    html: `<p>${body.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
  };
}

export function listExchangeMailTemplates(locale?: string | null): ExchangeMailTemplate[] {
  return (["registration", "subscription", "inquiry"] as ExchangeMailKind[]).map((kind) =>
    exchangeMailTemplate(kind, locale)
  );
}
