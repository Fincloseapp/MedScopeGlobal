import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

type Pack = "cs" | "de" | "fr" | "en";

export function revenueCopyLocale(locale?: string | null): Pack {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  return "en";
}

export type RevenueCopy = {
  partnerKicker: string;
  partnerTitle: string;
  partnerBody: string;
  partnerCta: string;
  partnerPrice: string;
  subscribeKicker: string;
  subscribeTitle: string;
  subscribeBody: string;
  subscribeCta: string;
  subscribeHint: string;
  newsletterKicker: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterPrivacy: string;
  newsletterSuccess: string;
  newsletterDuplicate: string;
  newsletterError: string;
  newsletterInvalid: string;
  affiliateKicker: string;
  affiliateTitle: string;
  affiliateDisclosure: string;
  tipsFollowup: string;
  mediaKitEyebrow: string;
  mediaKitTitle: string;
  mediaKitLead: string;
  mediaKitReach: string;
  mediaKitAudience: string;
  mediaKitCta: string;
  bannerName: string;
  sponsoredName: string;
  newsletterName: string;
};

const COPY: Record<Pack, RevenueCopy> = {
  cs: {
    partnerKicker: "Inzerce",
    partnerTitle: "Tento prostor je k rezervaci",
    partnerBody:
      "Native banner u čtenářů dlouhověkosti — od 5 000 Kč/měsíc. Sponzorovaný článek od 15 000 Kč, vždy označený.",
    partnerCta: "Rezervovat inzerci",
    partnerPrice: "od 5 000 Kč/měsíc",
    subscribeKicker: "Volitelné předplatné",
    subscribeTitle: "Číst dál bez reklam",
    subscribeBody:
      "14 dní zdarma, potom tarif Veřejnost. Tipy v článcích zůstávají dobrovolné — toto není VIP členství.",
    subscribeCta: "Vyzkoušet 14 dní",
    subscribeHint: "Zrušíte kdykoli před koncem zkušební doby.",
    newsletterKicker: "Týdenní brief",
    newsletterTitle: "Longevity brief do e-mailu",
    newsletterBody:
      "Jednou týdně spánek, pohyb, výživa a novinky z výzkumu. Zdarma, bez předplatného.",
    newsletterPlaceholder: "váš@email.cz",
    newsletterCta: "Přihlásit k odběru",
    newsletterPrivacy: "E-mail použijeme jen na brief. Odhlášení v každém vydání.",
    newsletterSuccess: "Děkujeme — brief přijde na váš e-mail.",
    newsletterDuplicate: "Tento e-mail už v briefu je.",
    newsletterError: "Odeslání se nepovedlo. Zkuste to znovu.",
    newsletterInvalid: "Zadejte platný e-mail.",
    affiliateKicker: "Doporučené · Affiliate",
    affiliateTitle: "Související produkty",
    affiliateDisclosure:
      "Odkazy mohou být affiliate. Nakupujete u prodejce, ne u redakce. Nejde o lékařské doporučení.",
    tipsFollowup: "Chcete dostávat podobné texty e-mailem?",
    mediaKitEyebrow: "ViaLongeVita · mediakit",
    mediaKitTitle: "Inzerce u čtenářů dlouhověkosti",
    mediaKitLead:
      "Magazín čte zhruba 1 300–1 900 lidí denně (špičky přes 3 000). Reálná longevity audience 40+, ne boti.",
    mediaKitReach: "~1 500 unique / den",
    mediaKitAudience: "Prevence, spánek, pohyb, výživa",
    mediaKitCta: "Objednat kampaň",
    bannerName: "Native banner",
    sponsoredName: "Sponzorovaný článek",
    newsletterName: "Mention v newsletteru",
  },
  de: {
    partnerKicker: "Werbung",
    partnerTitle: "Dieser Platz ist buchbar",
    partnerBody:
      "Native Banner bei Longevity-Lesern — ab 5 000 Kč/Monat. Gesponserter Artikel ab 15 000 Kč, immer gekennzeichnet.",
    partnerCta: "Werbung buchen",
    partnerPrice: "ab 5 000 Kč/Monat",
    subscribeKicker: "Optionales Abo",
    subscribeTitle: "Weiterlesen ohne Werbung",
    subscribeBody:
      "14 Tage kostenlos, danach der Tarif für Leser. Trinkgelder in Artikeln bleiben freiwillig — kein VIP-Zwang.",
    subscribeCta: "14 Tage testen",
    subscribeHint: "Jederzeit vor Ende der Testphase kündbar.",
    newsletterKicker: "Wöchentlicher Brief",
    newsletterTitle: "Longevity-Brief per E-Mail",
    newsletterBody:
      "Einmal pro Woche Schlaf, Bewegung, Ernährung und Forschung. Kostenlos, ohne Abo.",
    newsletterPlaceholder: "ihre@email.de",
    newsletterCta: "Anmelden",
    newsletterPrivacy: "Nur für den Brief. Abmeldung in jeder Ausgabe.",
    newsletterSuccess: "Danke — der Brief kommt in Ihr Postfach.",
    newsletterDuplicate: "Diese Adresse ist bereits angemeldet.",
    newsletterError: "Senden fehlgeschlagen. Bitte erneut versuchen.",
    newsletterInvalid: "Bitte eine gültige E-Mail eingeben.",
    affiliateKicker: "Empfohlen · Affiliate",
    affiliateTitle: "Passende Produkte",
    affiliateDisclosure:
      "Links können Affiliate-Links sein. Kauf beim Händler, nicht bei der Redaktion. Keine medizinische Empfehlung.",
    tipsFollowup: "Ähnliche Texte per E-Mail?",
    mediaKitEyebrow: "ViaLongeVita · Media-Kit",
    mediaKitTitle: "Werbung bei Longevity-Lesern",
    mediaKitLead:
      "Etwa 1 300–1 900 Menschen pro Tag (Spitzen über 3 000). Echte Longevity-Leser 40+, keine Bots.",
    mediaKitReach: "~1 500 Unique / Tag",
    mediaKitAudience: "Prävention, Schlaf, Bewegung, Ernährung",
    mediaKitCta: "Kampagne anfragen",
    bannerName: "Native Banner",
    sponsoredName: "Gesponserter Artikel",
    newsletterName: "Newsletter-Mention",
  },
  fr: {
    partnerKicker: "Publicité",
    partnerTitle: "Cet emplacement est à réserver",
    partnerBody:
      "Bannière native auprès des lecteurs longévité — dès 5 000 Kč/mois. Article sponsorisé dès 15 000 Kč, toujours signalé.",
    partnerCta: "Réserver un espace",
    partnerPrice: "dès 5 000 Kč/mois",
    subscribeKicker: "Abonnement facultatif",
    subscribeTitle: "Lire sans publicité",
    subscribeBody:
      "14 jours offerts, puis le tarif grand public. Les pourboires restent volontaires — ce n’est pas un club VIP.",
    subscribeCta: "Essayer 14 jours",
    subscribeHint: "Résiliable avant la fin de l’essai.",
    newsletterKicker: "Brief hebdomadaire",
    newsletterTitle: "Brief longévité par e-mail",
    newsletterBody:
      "Une fois par semaine : sommeil, mouvement, alimentation et recherche. Gratuit, sans abonnement.",
    newsletterPlaceholder: "vous@email.fr",
    newsletterCta: "S’inscrire",
    newsletterPrivacy: "E-mail utilisé uniquement pour le brief. Désinscription dans chaque numéro.",
    newsletterSuccess: "Merci — le brief arrivera dans votre boîte.",
    newsletterDuplicate: "Cette adresse est déjà inscrite.",
    newsletterError: "Envoi impossible. Réessayez.",
    newsletterInvalid: "Indiquez un e-mail valide.",
    affiliateKicker: "Recommandé · Affiliation",
    affiliateTitle: "Produits liés",
    affiliateDisclosure:
      "Les liens peuvent être affiliés. Achat chez le marchand, pas chez la rédaction. Pas un avis médical.",
    tipsFollowup: "Recevoir des textes similaires par e-mail ?",
    mediaKitEyebrow: "ViaLongeVita · kit média",
    mediaKitTitle: "Publicité auprès des lecteurs longévité",
    mediaKitLead:
      "Environ 1 300–1 900 personnes par jour (pics au-delà de 3 000). Audience longévité réelle 40+, pas des bots.",
    mediaKitReach: "~1 500 unique / jour",
    mediaKitAudience: "Prévention, sommeil, mouvement, alimentation",
    mediaKitCta: "Commander une campagne",
    bannerName: "Bannière native",
    sponsoredName: "Article sponsorisé",
    newsletterName: "Mention newsletter",
  },
  en: {
    partnerKicker: "Advertising",
    partnerTitle: "This slot is available",
    partnerBody:
      "Native banner with longevity readers — from CZK 5,000/month. Sponsored article from CZK 15,000, always labelled.",
    partnerCta: "Book this space",
    partnerPrice: "from CZK 5,000/month",
    subscribeKicker: "Optional subscription",
    subscribeTitle: "Keep reading without ads",
    subscribeBody:
      "14 days free, then the public plan. Article tips stay voluntary — this is not a VIP club.",
    subscribeCta: "Try 14 days",
    subscribeHint: "Cancel any time before the trial ends.",
    newsletterKicker: "Weekly brief",
    newsletterTitle: "Longevity brief by email",
    newsletterBody:
      "Once a week: sleep, movement, food and research news. Free, no subscription.",
    newsletterPlaceholder: "you@email.com",
    newsletterCta: "Subscribe to the brief",
    newsletterPrivacy: "We use the address only for the brief. Unsubscribe in every issue.",
    newsletterSuccess: "Thank you — the brief will arrive in your inbox.",
    newsletterDuplicate: "This email is already on the list.",
    newsletterError: "Could not send. Please try again.",
    newsletterInvalid: "Enter a valid email.",
    affiliateKicker: "Recommended · Affiliate",
    affiliateTitle: "Related products",
    affiliateDisclosure:
      "Links may be affiliate. You buy from the retailer, not the newsroom. Not medical advice.",
    tipsFollowup: "Want similar pieces by email?",
    mediaKitEyebrow: "ViaLongeVita · media kit",
    mediaKitTitle: "Advertise to longevity readers",
    mediaKitLead:
      "About 1,300–1,900 people a day (peaks above 3,000). Real longevity readers 40+, not bots.",
    mediaKitReach: "~1,500 uniques / day",
    mediaKitAudience: "Prevention, sleep, movement, nutrition",
    mediaKitCta: "Book a campaign",
    bannerName: "Native banner",
    sponsoredName: "Sponsored article",
    newsletterName: "Newsletter mention",
  },
};

export function getRevenueCopy(locale?: string | null): RevenueCopy {
  return COPY[revenueCopyLocale(locale)];
}
