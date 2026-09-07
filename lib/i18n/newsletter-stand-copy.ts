import { MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export type NewsletterStandCopy = {
  kicker: string;
  title: string;
  lead: string;
  current: string;
  previous: string;
  upcoming: string;
  index: string;
  openIssue: string;
  readCurrent: string;
  subscribeRail: string;
  subscribeLead: string;
  editorialRail: string;
  editorialLead: string;
  adsRail: string;
  adsLead: string;
  adsCta: string;
  partner: string;
  emptyPrevious: string;
  emptyUpcoming: string;
};

const NAME = MAGAZINE.name;

const EN: NewsletterStandCopy = {
  kicker: `${NAME} · newsstand`,
  title: "Weekly brief — current, archive and upcoming",
  lead: "The same form as in your inbox: one lead piece and two shorter reads. The brief stays free. Editorial is the paid magazine. Advertising for companies is labeled.",
  current: "Current issue",
  previous: "Previous issues",
  upcoming: "Upcoming",
  index: "All issues",
  openIssue: "Open issue",
  readCurrent: "Read this issue",
  subscribeRail: "Free brief",
  subscribeLead: "Once a week, in your language. Cancel in every issue.",
  editorialRail: "Editorial",
  editorialLead: "The full magazine from 25 Kč / €1 / $1 / £1 a month. The brief stays free.",
  adsRail: "Advertising",
  adsLead: "Labeled slots in the brief and on the site. Editorial copy stays separate.",
  adsCta: "Advertising for companies",
  partner: "Partner (labeled)",
  emptyPrevious: "Older issues appear here after the next brief.",
  emptyUpcoming: "The next date appears here when that brief is ready. We do not invent issues ahead of time.",
};

const PACKS: Record<string, NewsletterStandCopy> = {
  en: EN,
  cs: {
    kicker: `${NAME} · newsstand`,
    title: "Týdenní brief — aktuální, archiv i připravovaná",
    lead: "Stejná forma jako v e-mailu: jedna hlavní stopa a dva kratší texty. Brief zůstává zdarma. Redakce je placený magazín. Reklama pro firmy je označená.",
    current: "Aktuální vydání",
    previous: "Předchozí vydání",
    upcoming: "Připravujeme",
    index: "Všechna vydání",
    openIssue: "Otevřít vydání",
    readCurrent: "Číst toto vydání",
    subscribeRail: "Brief zdarma",
    subscribeLead: "Jednou týdně, ve vašem jazyce. Odhlášení v každém vydání.",
    editorialRail: "Redakce",
    editorialLead: "Celý magazín od 25 Kč / €1 / $1 / £1 měsíčně. Brief zůstává zdarma.",
    adsRail: "Reklama",
    adsLead: "Označené sloty v briefu a na webu. Redakční text zůstává oddělený.",
    adsCta: "Inzerce pro firmy",
    partner: "Partner (označeno)",
    emptyPrevious: "Starší vydání se tu objeví po dalším briefu.",
    emptyUpcoming: "Další termín zveřejníme, až bude brief hotový. Nic nevymýšlíme dopředu.",
  },
  sk: {
    kicker: `${NAME} · newsstand`,
    title: "Týždenný brief — aktuálne, archív aj pripravované",
    lead: "Rovnaká forma ako v e-maile: jedna hlavná stopa a dva kratšie texty. Brief ostáva zadarmo. Redakcia je platený magazín. Reklama pre firmy je označená.",
    current: "Aktuálne vydanie",
    previous: "Predchádzajúce vydania",
    upcoming: "Pripravujeme",
    index: "Všetky vydania",
    openIssue: "Otvoriť vydanie",
    readCurrent: "Čítať toto vydanie",
    subscribeRail: "Brief zadarmo",
    subscribeLead: "Raz týždenne, vo vašom jazyku. Odhlásenie v každom vydaní.",
    editorialRail: "Redakcia",
    editorialLead: "Celý magazín od 25 Kč / €1 / $1 / £1 mesačne. Brief ostáva zadarmo.",
    adsRail: "Reklama",
    adsLead: "Označené sloty v briefe a na webe. Redakčný text ostáva oddelený.",
    adsCta: "Inzercia pre firmy",
    partner: "Partner (označené)",
    emptyPrevious: "Staršie vydania sa tu objavia po ďalšom briefe.",
    emptyUpcoming: "Ďalší termín zverejníme, keď bude brief hotový. Nič nevymýšľame vopred.",
  },
  de: {
    kicker: `${NAME} · Newsstand`,
    title: "Wöchentlicher Brief — aktuell, Archiv und Vorschau",
    lead: "Dieselbe Form wie im Postfach: ein Leittext und zwei kürzere. Der Brief bleibt kostenlos. Die Redaktion ist das bezahlte Magazin. Werbung für Firmen ist gekennzeichnet.",
    current: "Aktuelle Ausgabe",
    previous: "Frühere Ausgaben",
    upcoming: "In Vorbereitung",
    index: "Alle Ausgaben",
    openIssue: "Ausgabe öffnen",
    readCurrent: "Diese Ausgabe lesen",
    subscribeRail: "Brief kostenlos",
    subscribeLead: "Einmal pro Woche, in Ihrer Sprache. Abmeldung in jeder Ausgabe.",
    editorialRail: "Redaktion",
    editorialLead: "Das volle Magazin ab 25 Kč / €1 / $1 / £1 im Monat. Der Brief bleibt kostenlos.",
    adsRail: "Werbung",
    adsLead: "Gekennzeichnete Plätze im Brief und auf der Site. Redaktionstext bleibt getrennt.",
    adsCta: "Werbung für Firmen",
    partner: "Partner (gekennzeichnet)",
    emptyPrevious: "Ältere Ausgaben erscheinen hier nach dem nächsten Brief.",
    emptyUpcoming: "Das nächste Datum steht hier, sobald der Brief fertig ist. Wir erfinden keine Ausgaben.",
  },
  fr: {
    kicker: `${NAME} · kiosque`,
    title: "Brief hebdomadaire — en cours, archives et à paraître",
    lead: "La même forme que dans la boîte mail : un texte principal et deux plus courts. Le brief reste gratuit. La rédaction est le magazine payant. La publicité pour les entreprises est signalée.",
    current: "Numéro en cours",
    previous: "Numéros précédents",
    upcoming: "À paraître",
    index: "Tous les numéros",
    openIssue: "Ouvrir le numéro",
    readCurrent: "Lire ce numéro",
    subscribeRail: "Brief gratuit",
    subscribeLead: "Une fois par semaine, dans votre langue. Désinscription dans chaque numéro.",
    editorialRail: "Rédaction",
    editorialLead: "Le magazine complet dès 25 Kč / €1 / $1 / £1 par mois. Le brief reste gratuit.",
    adsRail: "Publicité",
    adsLead: "Emplacements signalés dans le brief et sur le site. Le texte rédactionnel reste séparé.",
    adsCta: "Publicité pour les entreprises",
    partner: "Partenaire (signalé)",
    emptyPrevious: "Les numéros plus anciens apparaissent ici après le prochain brief.",
    emptyUpcoming: "La prochaine date apparaît ici lorsque ce brief est prêt. Nous n’inventons pas les numéros.",
  },
};

function standKey(locale?: string | null): string {
  const raw = (locale ?? "en").trim();
  if (PACKS[raw]) return raw;
  try {
    const primary = primaryArticleLocale(normalizeLocale(raw));
    if (PACKS[primary]) return primary;
  } catch {
    /* fall through */
  }
  if (raw.startsWith("en")) return "en";
  return "en";
}

export function getNewsletterStandCopy(locale?: string | null): NewsletterStandCopy {
  return PACKS[standKey(locale)] ?? EN;
}
