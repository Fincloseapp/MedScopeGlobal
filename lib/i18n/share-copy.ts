import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type ShareCopy = {
  aria: string;
  facebook: string;
  whatsapp: string;
  linkedin: string;
  instagram: string;
  instagramHint: string;
  instagramCopied: string;
  youtube: string;
  native: string;
  copyLink: string;
  copied: string;
  profilesTitle: string;
  clipsEyebrow: string;
  clipsTitle: string;
  clipsLead: string;
  clipsSubscribe: string;
  clipsAds: string;
  clipsLibrary: string;
};

const COPY: Record<ChromePack, ShareCopy> = {
  cs: {
    aria: "Sdílet",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — zkopírovat odkaz",
    instagramHint: "Instagram nemá webový share — vložte odkaz do Stories nebo zprávy.",
    instagramCopied: "Odkaz zkopírován. Vložte ho do Instagramu.",
    youtube: "YouTube",
    native: "Sdílet",
    copyLink: "Kopírovat odkaz",
    copied: "Zkopírováno",
    profilesTitle: "ViaLongeVita na sítích",
    clipsEyebrow: "Krátké klipy",
    clipsTitle: "Minuta prevence, ne zázrak",
    clipsLead: "Skutečné lekce z Osvěty. Sdílejte odkaz — Instagram, Facebook, WhatsApp. Tarif Redakce a inzerce jsou vedle.",
    clipsSubscribe: "Otevřít tarif Redakce",
    clipsAds: "Inzerce pro firmy",
    clipsLibrary: "Další klipy",
  },
  de: {
    aria: "Teilen",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — Link kopieren",
    instagramHint: "Instagram hat keinen Web-Share — Link in Story oder Nachricht einfügen.",
    instagramCopied: "Link kopiert. In Instagram einfügen.",
    youtube: "YouTube",
    native: "Teilen",
    copyLink: "Link kopieren",
    copied: "Kopiert",
    profilesTitle: "ViaLongeVita in den Netzen",
    clipsEyebrow: "Kurze Clips",
    clipsTitle: "Eine Minute Prävention, kein Wunder",
    clipsLead: "Echte Tageslektionen. Link teilen — Instagram, Facebook, WhatsApp. Redaktion und Werbung daneben.",
    clipsSubscribe: "Redaktionsabo öffnen",
    clipsAds: "Werbung für Firmen",
    clipsLibrary: "Weitere Clips",
  },
  fr: {
    aria: "Partager",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — copier le lien",
    instagramHint: "Instagram n’a pas de partage web — collez le lien dans une story ou un message.",
    instagramCopied: "Lien copié. Collez-le dans Instagram.",
    youtube: "YouTube",
    native: "Partager",
    copyLink: "Copier le lien",
    copied: "Copié",
    profilesTitle: "ViaLongeVita sur les réseaux",
    clipsEyebrow: "Courts clips",
    clipsTitle: "Une minute de prévention, pas un miracle",
    clipsLead: "De vraies leçons du jour. Partagez le lien — Instagram, Facebook, WhatsApp. Rédaction et publicité à côté.",
    clipsSubscribe: "Ouvrir la rédaction",
    clipsAds: "Publicité entreprises",
    clipsLibrary: "Autres clips",
  },
  en: {
    aria: "Share",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — copy link",
    instagramHint: "Instagram has no web share — paste the link into a story or message.",
    instagramCopied: "Link copied. Paste it into Instagram.",
    youtube: "YouTube",
    native: "Share",
    copyLink: "Copy link",
    copied: "Copied",
    profilesTitle: "ViaLongeVita on social",
    clipsEyebrow: "Short clips",
    clipsTitle: "A minute of prevention, not a miracle",
    clipsLead: "Real daily lessons. Share the link — Instagram, Facebook, WhatsApp. Editorial and ads sit next to it.",
    clipsSubscribe: "Open Editorial",
    clipsAds: "Advertise with us",
    clipsLibrary: "More clips",
  },
  it: {
    aria: "Condividi",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — copia il link",
    instagramHint: "Instagram non ha lo share web — incolla il link in una storia o in un messaggio.",
    instagramCopied: "Link copiato. Incollalo su Instagram.",
    youtube: "YouTube",
    native: "Condividi",
    copyLink: "Copia link",
    copied: "Copiato",
    profilesTitle: "ViaLongeVita sui social",
    clipsEyebrow: "Clip brevi",
    clipsTitle: "Un minuto di prevenzione, non un miracolo",
    clipsLead: "Lezioni vere del giorno. Condividi il link — Instagram, Facebook, WhatsApp. Redazione e annunci accanto.",
    clipsSubscribe: "Apri il piano Redazione",
    clipsAds: "Pubblicità per aziende",
    clipsLibrary: "Altre clip",
  },
  es: {
    aria: "Compartir",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — copiar enlace",
    instagramHint: "Instagram no tiene share web — pega el enlace en una historia o mensaje.",
    instagramCopied: "Enlace copiado. Pégalo en Instagram.",
    youtube: "YouTube",
    native: "Compartir",
    copyLink: "Copiar enlace",
    copied: "Copiado",
    profilesTitle: "ViaLongeVita en redes",
    clipsEyebrow: "Clips cortos",
    clipsTitle: "Un minuto de prevención, no un milagro",
    clipsLead: "Lecciones reales del día. Comparte el enlace — Instagram, Facebook, WhatsApp. Redacción y anuncios al lado.",
    clipsSubscribe: "Abrir el plan Redacción",
    clipsAds: "Publicidad para empresas",
    clipsLibrary: "Más clips",
  },
  "pt-BR": {
    aria: "Compartilhar",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    instagram: "Instagram — copiar link",
    instagramHint: "O Instagram não tem share na web — cole o link no story ou na mensagem.",
    instagramCopied: "Link copiado. Cole no Instagram.",
    youtube: "YouTube",
    native: "Compartilhar",
    copyLink: "Copiar link",
    copied: "Copiado",
    profilesTitle: "ViaLongeVita nas redes",
    clipsEyebrow: "Clipes curtos",
    clipsTitle: "Um minuto de prevenção, não um milagre",
    clipsLead: "Lições reais do dia. Partilhe o link — Instagram, Facebook, WhatsApp. Redação e anúncios ao lado.",
    clipsSubscribe: "Abrir o plano Editorial",
    clipsAds: "Publicidade para empresas",
    clipsLibrary: "Mais clipes",
  },
};

export function getShareCopy(locale?: string | null): ShareCopy {
  return COPY[chromePack(locale)];
}
