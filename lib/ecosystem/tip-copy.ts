/**
 * User-facing tip / donation copy.
 * Tips and donations are voluntary support — never VIP / membership.
 * Czech copy is used only on the Czech edition; other languages never fall back to Czech.
 */

import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export type TipPack = "cs" | "de" | "fr" | "en";

export function tipLocale(locale?: string): TipPack {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  return "en";
}

type TipStrings = {
  title: (author?: string) => string;
  blurb: string;
  custom: string;
  unavailable: string;
  success: string;
  redirecting: string;
  minError: (amount: string, symbol: string) => string;
  lineItemName: (title?: string) => string;
  lineItemDescription: string;
  nudgeTip: string;
  nudgeLine: string;
  clarifying: string;
  tipSection: string;
  tipAction: string;
  donateSection: string;
  donateAction: string;
  loading: string;
  networkError: string;
  paymentError: string;
};

export const ARTICLE_TIP_COPY: Record<TipPack, TipStrings> = {
  cs: {
    title: (author?: string) =>
      author ? `Podpořit autora (${author}) · Příspěvek` : "Podpořit autora · Příspěvek",
    blurb:
      "Dobrovolný mikro-příspěvek — jako spropitné. Když přispějete, pomáháte, aby další čtenář dostal srozumitelný text o zdraví. Nejde o VIP ani předplatné.",
    custom: "Vlastní",
    unavailable: "Příspěvky momentálně nejsou k dispozici — Stripe není nakonfigurován (API 503).",
    success:
      "Děkujeme. Díky vám může další čtenář číst dál — udělali jste něco dobrého pro veřejné zdraví. Nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na Stripe…",
    minError: (amount: string, symbol: string) => `Minimální příspěvek je ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim() ? `Příspěvek: ${title.trim().slice(0, 80)}` : "Příspěvek pro autora",
    lineItemDescription: "Dobrovolný příspěvek autorovi článku (ne VIP / předplatné)",
    nudgeTip: "Přispět — další čtenář díky tomu čte dál",
    nudgeLine: "Pomohl vám tento článek?",
    clarifying:
      "Příspěvek není předplatné VIP a neodemkne placený obsah — je to dobrovolná podpora redakce.",
    tipSection: "Příspěvek",
    tipAction: "Přispět",
    donateSection: "Darovat",
    donateAction: "Darovat",
    loading: "Načítání příspěvků…",
    networkError: "Síťová chyba — zkontrolujte připojení a zkuste znovu.",
    paymentError: "Platbu se nepodařilo spustit. Zkuste to prosím znovu.",
  },
  de: {
    title: (author?: string) =>
      author ? `Autor unterstützen (${author}) · Beitrag` : "Autor unterstützen · Beitrag",
    blurb:
      "Freiwilliger Mikrobeitrag — wie ein Trinkgeld. Wenn Sie beitragen, kann die nächste Leserin denselben verständlichen Gesundheitstext lesen. Kein VIP, kein Abo.",
    custom: "Eigener Betrag",
    unavailable: "Beiträge sind derzeit nicht verfügbar — Stripe ist nicht konfiguriert.",
    success:
      "Danke. Dank Ihnen kann die nächste Person weiterlesen — Sie haben etwas Gutes für die öffentliche Gesundheit getan. Kein VIP, keine Mitgliedschaft, kein Abo.",
    redirecting: "Weiterleitung zu Stripe…",
    minError: (amount: string, symbol: string) => `Mindestbeitrag ist ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim() ? `Beitrag: ${title.trim().slice(0, 80)}` : "Beitrag für den Autor",
    lineItemDescription: "Freiwilliger Beitrag an den Autor (kein VIP / Abo)",
    nudgeTip: "Beitragen — die nächste Person liest dadurch weiter",
    nudgeLine: "Hat Ihnen dieser Artikel geholfen?",
    clarifying: "Ein Beitrag ist kein VIP-Abo und schaltet keine bezahlten Inhalte frei.",
    tipSection: "Beitrag",
    tipAction: "Beitragen",
    donateSection: "Spenden",
    donateAction: "Spenden",
    loading: "Beiträge werden geladen…",
    networkError: "Netzwerkfehler — bitte Verbindung prüfen und erneut versuchen.",
    paymentError: "Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.",
  },
  fr: {
    title: (author?: string) =>
      author ? `Soutenir l’auteur (${author}) · Contribution` : "Soutenir l’auteur · Contribution",
    blurb:
      "Micro-contribution facultative — comme un pourboire. En contribuant, vous aidez le prochain lecteur à recevoir le même texte de santé, clairement. Ni VIP ni abonnement.",
    custom: "Montant libre",
    unavailable: "Les contributions sont indisponibles — Stripe n’est pas configuré.",
    success:
      "Merci. Grâce à vous, quelqu’un d’autre peut continuer à lire — vous avez fait quelque chose de bien pour la santé publique. Ce n’est ni un VIP, ni un abonnement.",
    redirecting: "Redirection vers Stripe…",
    minError: (amount: string, symbol: string) => `Le minimum est ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim() ? `Contribution : ${title.trim().slice(0, 80)}` : "Contribution pour l’auteur",
    lineItemDescription: "Contribution facultative à l’auteur (pas VIP / abonnement)",
    nudgeTip: "Contribuer — le prochain lecteur continue grâce à vous",
    nudgeLine: "Cet article vous a aidé ?",
    clarifying: "Une contribution n’est pas un abonnement VIP et ne débloque pas de contenu payant.",
    tipSection: "Contribution",
    tipAction: "Contribuer",
    donateSection: "Donner",
    donateAction: "Donner",
    loading: "Chargement des contributions…",
    networkError: "Erreur réseau — vérifiez la connexion et réessayez.",
    paymentError: "Impossible de lancer le paiement. Réessayez.",
  },
  en: {
    title: (author?: string) =>
      author ? `Support the author (${author}) · Tip` : "Support the author · Tip",
    blurb:
      "Optional micro-contribution — like a tip. When you give, the next reader still gets a clear health text. Not VIP or a subscription.",
    custom: "Custom",
    unavailable: "Tips are unavailable — Stripe is not configured (API 503).",
    success:
      "Thank you. Because of you, the next reader can keep going — you did something good for public health. This is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to Stripe…",
    minError: (amount: string, symbol: string) => `Minimum tip is ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim() ? `Tip: ${title.trim().slice(0, 80)}` : "Tip for the author",
    lineItemDescription: "Optional contribution to the article author (not VIP / subscription)",
    nudgeTip: "Leave a tip — you keep the next reader reading",
    nudgeLine: "Did this article help?",
    clarifying: "A tip is not a VIP subscription and does not unlock paid content — it is optional support for the desk.",
    tipSection: "Contribution",
    tipAction: "Contribute",
    donateSection: "Donate",
    donateAction: "Donate",
    loading: "Loading contributions…",
    networkError: "Network error — check your connection and try again.",
    paymentError: "Could not start payment. Please try again.",
  },
};

export const DONATION_COPY = {
  cs: {
    title: (author?: string) =>
      author ? `Podpořit autora (${author}) · Dar` : "Podpořit autora · Dar",
    blurb:
      "Mikro-dar drží srozumitelné texty o zdraví přístupné dalšímu člověku. Nejde o VIP ani předplatné.",
    unavailable: "Dary momentálně nejsou k dispozici — Stripe není nakonfigurován (API 503).",
    success:
      "Děkujeme. Dar drží další článek přístupný — udělali jste něco dobrého. Nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na Stripe…",
    lineItemName: (title?: string) =>
      title?.trim() ? `Dar autorovi: ${title.trim().slice(0, 80)}` : "Podpora MedScopeGlobal",
    lineItemDescription: "Mikro-dar pro podporu tvorby obsahu",
  },
  de: {
    title: (author?: string) =>
      author ? `Autor unterstützen (${author}) · Spende` : "Autor unterstützen · Spende",
    blurb:
      "Eine Mikrospende hält verständliche Gesundheitstexte für die nächste Person offen. Kein VIP, kein Abo.",
    unavailable: "Spenden sind derzeit nicht verfügbar — Stripe ist nicht konfiguriert.",
    success:
      "Danke. Ihre Spende hält den nächsten Text offen — Sie haben etwas Gutes getan. Kein VIP, keine Mitgliedschaft, kein Abo.",
    redirecting: "Weiterleitung zu Stripe…",
    lineItemName: (title?: string) =>
      title?.trim() ? `Spende: ${title.trim().slice(0, 80)}` : "Unterstützung für MedScopeGlobal",
    lineItemDescription: "Mikrospende zur Unterstützung der Inhalte",
  },
  fr: {
    title: (author?: string) =>
      author ? `Soutenir l’auteur (${author}) · Don` : "Soutenir l’auteur · Don",
    blurb:
      "Un micro-don garde des textes de santé clairs ouverts pour la personne suivante. Ni VIP ni abonnement.",
    unavailable: "Les dons sont indisponibles — Stripe n’est pas configuré.",
    success:
      "Merci. Votre don garde le prochain texte ouvert — vous avez fait quelque chose de bien. Ce n’est ni un VIP, ni un abonnement.",
    redirecting: "Redirection vers Stripe…",
    lineItemName: (title?: string) =>
      title?.trim() ? `Don : ${title.trim().slice(0, 80)}` : "Soutien à MedScopeGlobal",
    lineItemDescription: "Micro-don pour soutenir la création de contenus",
  },
  en: {
    title: (author?: string) =>
      author ? `Support the author (${author}) · Donation` : "Support the author · Donation",
    blurb:
      "A micro-donation keeps clear health writing open for the next person. Not VIP or a subscription.",
    unavailable: "Donations are unavailable — Stripe is not configured (API 503).",
    success:
      "Thank you. Your gift keeps the next piece open — you did something good. This is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to Stripe…",
    lineItemName: (title?: string) =>
      title?.trim() ? `Donation: ${title.trim().slice(0, 80)}` : "Support MedScopeGlobal",
    lineItemDescription: "Micro-donation to support editorial work",
  },
} as const;

export const VIP_CTA_COPY = {
  cs: {
    nudgeExplore: "VIP Longevity je placené předplatné — prozkoumejte protokoly",
    label: "VIP Longevity protokoly",
  },
  en: {
    nudgeExplore: "VIP Longevity is a paid subscription — explore protocols",
    label: "VIP Longevity protocols",
  },
} as const;

export function isArticleTipUiEnabled(_locked?: boolean): boolean {
  return true;
}
