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
  downloadClip: string;
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
    clipsEyebrow: "Reklamní shoty",
    clipsTitle: "Osm sekund ViaLongeVita",
    clipsLead: "Tři reklamy — muž, žena, stejná tvář. Starší čte o dlouhověkosti. Na záběru ViaLongeVita a medscopeglobal.com. Ne odborná lekce.",
    clipsSubscribe: "Otevřít tarif Redakce",
    clipsAds: "Inzerce pro firmy",
    clipsLibrary: "Všechny 3 shoty",
    downloadClip: "Stáhnout MP4 do sítě",
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
    clipsEyebrow: "Werbeshots",
    clipsTitle: "Acht Sekunden ViaLongeVita",
    clipsLead: "Drei Spots — ein Mann, eine Frau, dasselbe Gesicht. Der Ältere liest über Langlebigkeit. ViaLongeVita und medscopeglobal.com im Bild. Keine Fachlektion.",
    clipsSubscribe: "Redaktionsabo öffnen",
    clipsAds: "Werbung für Firmen",
    clipsLibrary: "Alle 3 Shots",
    downloadClip: "MP4 fürs Netz laden",
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
    clipsEyebrow: "Spots publicitaires",
    clipsTitle: "Huit secondes ViaLongeVita",
    clipsLead: "Trois spots — un homme, une femme, le même visage. L’aîné lit la longévité. ViaLongeVita et medscopeglobal.com à l’image. Pas une leçon.",
    clipsSubscribe: "Ouvrir la rédaction",
    clipsAds: "Publicité entreprises",
    clipsLibrary: "Les 3 spots",
    downloadClip: "Télécharger le MP4",
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
    clipsEyebrow: "Ad shots",
    clipsTitle: "Eight seconds of ViaLongeVita",
    clipsLead: "Three ads — a man, a woman, the same face. The older one reads about longevity. ViaLongeVita and medscopeglobal.com on screen. Not a lesson.",
    clipsSubscribe: "Open Editorial",
    clipsAds: "Advertise with us",
    clipsLibrary: "All 3 shots",
    downloadClip: "Download MP4 for social",
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
    clipsEyebrow: "Spot pubblicitari",
    clipsTitle: "Otto secondi di ViaLongeVita",
    clipsLead: "Tre spot — un uomo, una donna, lo stesso viso. Il più anziano legge la longevità. ViaLongeVita e medscopeglobal.com in quadro. Non una lezione.",
    clipsSubscribe: "Apri il piano Redazione",
    clipsAds: "Pubblicità per aziende",
    clipsLibrary: "I 3 spot",
    downloadClip: "Scarica l’MP4",
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
    clipsEyebrow: "Spots publicitarios",
    clipsTitle: "Ocho segundos de ViaLongeVita",
    clipsLead: "Tres spots — un hombre, una mujer, la misma cara. El mayor lee sobre longevidad. ViaLongeVita y medscopeglobal.com en pantalla. No es una lección.",
    clipsSubscribe: "Abrir el plan Redacción",
    clipsAds: "Publicidad para empresas",
    clipsLibrary: "Los 3 spots",
    downloadClip: "Descargar MP4",
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
    clipsEyebrow: "Spots publicitários",
    clipsTitle: "Oito segundos de ViaLongeVita",
    clipsLead: "Três spots — um homem, uma mulher, o mesmo rosto. O mais velho lê sobre longevidade. ViaLongeVita e medscopeglobal.com no ecrã. Não é uma lição.",
    clipsSubscribe: "Abrir o plano Editorial",
    clipsAds: "Publicidade para empresas",
    clipsLibrary: "Os 3 spots",
    downloadClip: "Descarregar MP4",
  },
};

export function getShareCopy(locale?: string | null): ShareCopy {
  return COPY[chromePack(locale)];
}
