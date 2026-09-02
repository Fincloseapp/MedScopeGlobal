import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";

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
  affiliateShelfKicker: string;
  affiliateShelfTitle: string;
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
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita do schránky",
    newsletterBody:
      "Jednou týdně jasně o spánku, pohybu, výživě a dlouhověkosti — v češtině, zdarma.",
    newsletterPlaceholder: "váš@email.cz",
    newsletterCta: "Chci brief",
    newsletterPrivacy: "E-mail použijeme jen na brief ViaLongeVita. Odhlášení v každém vydání.",
    newsletterSuccess: "Děkujeme — ViaLongeVita brief přijde ve vašem jazyce.",
    newsletterDuplicate: "Tento e-mail už brief odebírá.",
    newsletterError: "Odeslání se nepovedlo. Zkuste to znovu.",
    newsletterInvalid: "Zadejte platný e-mail.",
    affiliateKicker: "K tomuto textu se hodí",
    affiliateTitle: "Čtenáři u tohoto tématu často hledají",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Co čtenáři berou dál",
    affiliateDisclosure:
      "Odkazy mohou být affiliate (Heureka / Amazon). Nakupujete u prodejce, ne u redakce. Nejde o lékařské doporučení. As an Amazon Associate I earn from qualifying purchases.",
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
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita in Ihrem Postfach",
    newsletterBody:
      "Einmal pro Woche klar zu Schlaf, Bewegung, Ernährung und Langlebigkeit — auf Deutsch, kostenlos.",
    newsletterPlaceholder: "ihre@email.de",
    newsletterCta: "Brief erhalten",
    newsletterPrivacy: "Nur für den ViaLongeVita-Brief. Abmeldung in jeder Ausgabe.",
    newsletterSuccess: "Danke — der ViaLongeVita-Brief kommt in Ihrer Sprache.",
    newsletterDuplicate: "Diese Adresse ist bereits angemeldet.",
    newsletterError: "Senden fehlgeschlagen. Bitte erneut versuchen.",
    newsletterInvalid: "Bitte eine gültige E-Mail eingeben.",
    affiliateKicker: "Passend zu diesem Text",
    affiliateTitle: "Wonach Leser bei diesem Thema greifen",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Wonach Leser als Nächstes greifen",
    affiliateDisclosure:
      "Links können Affiliate-Links sein. Kauf beim Händler, nicht bei der Redaktion. Keine medizinische Empfehlung. As an Amazon Associate I earn from qualifying purchases.",
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
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita dans votre boîte",
    newsletterBody:
      "Une fois par semaine : sommeil, mouvement, alimentation et longévité — en français, gratuit.",
    newsletterPlaceholder: "vous@email.fr",
    newsletterCta: "Recevoir le brief",
    newsletterPrivacy: "E-mail utilisé uniquement pour le brief ViaLongeVita. Désinscription dans chaque numéro.",
    newsletterSuccess: "Merci — le brief ViaLongeVita arrivera dans votre langue.",
    newsletterDuplicate: "Cette adresse est déjà inscrite.",
    newsletterError: "Envoi impossible. Réessayez.",
    newsletterInvalid: "Indiquez un e-mail valide.",
    affiliateKicker: "Dans le prolongement de ce texte",
    affiliateTitle: "Ce que les lecteurs cherchent sur ce sujet",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Ce que les lecteurs cherchent ensuite",
    affiliateDisclosure:
      "Les liens peuvent être affiliés. Achat chez le marchand, pas chez la rédaction. Pas un avis médical. As an Amazon Associate I earn from qualifying purchases.",
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
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita in your inbox",
    newsletterBody:
      "Once a week: sleep, movement, food and longevity — in your language, free.",
    newsletterPlaceholder: "you@email.com",
    newsletterCta: "Send me the brief",
    newsletterPrivacy: "We use the address only for the ViaLongeVita brief. Unsubscribe in every issue.",
    newsletterSuccess: "Thank you — the ViaLongeVita brief will arrive in your language.",
    newsletterDuplicate: "This email is already on the list.",
    newsletterError: "Could not send. Please try again.",
    newsletterInvalid: "Enter a valid email.",
    affiliateKicker: "A natural next step",
    affiliateTitle: "What readers look up after this piece",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "What readers reach for next",
    affiliateDisclosure:
      "Links may be affiliate. You buy from the retailer, not the newsroom. Not medical advice. As an Amazon Associate I earn from qualifying purchases.",
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
  const base = COPY[revenueCopyLocale(locale)];
  const nl = getNewsletterCopy(locale);
  const overlay = affiliateOverlay(locale);
  return {
    ...base,
    ...overlay,
    newsletterKicker: nl.kicker,
    newsletterTitle: nl.title,
    newsletterBody: nl.body,
    newsletterPlaceholder: nl.placeholder,
    newsletterCta: nl.cta,
    newsletterPrivacy: nl.privacy,
    newsletterSuccess: nl.success,
    newsletterDuplicate: nl.duplicate,
    newsletterError: nl.error,
    newsletterInvalid: nl.invalid,
  };
}

function affiliateOverlay(
  locale?: string | null
): Partial<Pick<RevenueCopy, "affiliateKicker" | "affiliateTitle" | "affiliateShelfKicker" | "affiliateShelfTitle">> {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "en"));
  if (primary === "sk") {
    return {
      affiliateKicker: "K tomuto textu sa hodí",
      affiliateTitle: "Čitatelia pri tejto téme často hľadajú",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Čo čitatelia berú ďalej",
    };
  }
  if (primary === "pl") {
    return {
      affiliateKicker: "Pasuje do tego tekstu",
      affiliateTitle: "Czego szukają czytelnicy przy tym temacie",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Po co sięgają czytelnicy dalej",
    };
  }
  if (primary === "it") {
    return {
      affiliateKicker: "In linea con questo testo",
      affiliateTitle: "Cosa cercano i lettori su questo tema",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Cosa scelgono i lettori dopo",
    };
  }
  if (primary === "es") {
    return {
      affiliateKicker: "En la línea de este texto",
      affiliateTitle: "Lo que buscan los lectores en este tema",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Lo que los lectores eligen después",
    };
  }
  if (primary === "ja") {
    return {
      affiliateKicker: "この記事の続きとして",
      affiliateTitle: "読者がこのテーマでよく探すもの",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "読者が次に手に取るもの",
    };
  }
  return {};
}
