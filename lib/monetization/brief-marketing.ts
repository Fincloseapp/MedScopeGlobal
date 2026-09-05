import { MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";

export type BriefChrome = {
  edition: string;
  readStory: string;
  heroLabel: string;
  moreThisWeek: string;
  disclosure: string;
  welcomeExpect: string;
  welcomeKicker: string;
  preheader: string;
  openMagazine: string;
  brandLine: string;
};

const CHROME: Record<string, BriefChrome> = {
  cs: {
    edition: "Týdenní brief",
    readStory: "Číst článek",
    heroLabel: "Hlavní text týdne",
    moreThisWeek: "Další v tomto vydání",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Odkazy na produkty jsou dobrovolné — brief zůstává zdarma.",
    welcomeExpect:
      "Jednou týdně tři jasné texty o spánku, pohybu a dlouhověkosti. Zdarma. Bez nátlaku na předplatné.",
    welcomeKicker: "Vítejte",
    preheader: "Tři texty, které tento týden stojí za klidné čtení.",
    openMagazine: "Otevřít magazín",
    brandLine: "Žijte lépe a déle — v každém věku.",
  },
  sk: {
    edition: "Týždenný brief",
    readStory: "Čítať článok",
    heroLabel: "Hlavný text týždňa",
    moreThisWeek: "Ďalšie v tomto vydaní",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Odkazy na produkty sú dobrovoľné — brief ostáva zadarmo.",
    welcomeExpect:
      "Raz týždenne tri jasné texty o spánku, pohybe a dlhovekosti. Zadarmo. Bez nátlaku na predplatné.",
    welcomeKicker: "Vitajte",
    preheader: "Tri texty, ktoré tento týždeň stoja za pokojné čítanie.",
    openMagazine: "Otvoriť magazín",
    brandLine: "Žite lepšie a dlhšie — v každom veku.",
  },
  de: {
    edition: "Wöchentlicher Brief",
    readStory: "Artikel lesen",
    heroLabel: "Text der Woche",
    moreThisWeek: "Weiter in dieser Ausgabe",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Produktlinks sind freiwillig — der Brief bleibt kostenlos.",
    welcomeExpect:
      "Einmal pro Woche drei klare Texte zu Schlaf, Bewegung und Langlebigkeit. Kostenlos. Ohne Abo-Druck.",
    welcomeKicker: "Willkommen",
    preheader: "Drei Texte, die diese Woche ruhiges Lesen verdienen.",
    openMagazine: "Magazin öffnen",
    brandLine: "Besser und länger leben — in jedem Alter.",
  },
  fr: {
    edition: "Brief hebdomadaire",
    readStory: "Lire l’article",
    heroLabel: "Le texte de la semaine",
    moreThisWeek: "Aussi dans ce numéro",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Les liens produits sont facultatifs — le brief reste gratuit.",
    welcomeExpect:
      "Une fois par semaine, trois textes clairs sur le sommeil, le mouvement et la longévité. Gratuit. Sans pression d’abonnement.",
    welcomeKicker: "Bienvenue",
    preheader: "Trois textes qui méritent une lecture calme cette semaine.",
    openMagazine: "Ouvrir le magazine",
    brandLine: "Vivre mieux, plus longtemps — à tout âge.",
  },
  es: {
    edition: "Brief semanal",
    readStory: "Leer el artículo",
    heroLabel: "Texto de la semana",
    moreThisWeek: "También en este número",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Los enlaces son opcionales — el brief sigue siendo gratis.",
    welcomeExpect:
      "Una vez por semana, tres textos claros sobre sueño, movimiento y longevidad. Gratis. Sin presión de suscripción.",
    welcomeKicker: "Bienvenido",
    preheader: "Tres textos que merecen una lectura tranquila esta semana.",
    openMagazine: "Abrir la revista",
    brandLine: "Vive mejor y más tiempo — a cualquier edad.",
  },
  it: {
    edition: "Brief settimanale",
    readStory: "Leggi l’articolo",
    heroLabel: "Testo della settimana",
    moreThisWeek: "Anche in questo numero",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. I link sono facoltativi — il brief resta gratis.",
    welcomeExpect:
      "Una volta a settimana tre testi chiari su sonno, movimento e longevità. Gratis. Senza pressione sull’abbonamento.",
    welcomeKicker: "Benvenuto",
    preheader: "Tre testi che questa settimana meritano una lettura calma.",
    openMagazine: "Apri la rivista",
    brandLine: "Vivi meglio, più a lungo — a ogni età.",
  },
  pl: {
    edition: "Tygodniowy brief",
    readStory: "Czytaj artykuł",
    heroLabel: "Tekst tygodnia",
    moreThisWeek: "Także w tym wydaniu",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Linki są dobrowolne — brief zostaje darmowy.",
    welcomeExpect:
      "Raz w tygodniu trzy jasne teksty o śnie, ruchu i długowieczności. Za darmo. Bez naciągania na subskrypcję.",
    welcomeKicker: "Witamy",
    preheader: "Trzy teksty, które w tym tygodniu zasługują na spokojne czytanie.",
    openMagazine: "Otwórz magazyn",
    brandLine: "Żyj lepiej i dłużej — w każdym wieku.",
  },
  pt: {
    edition: "Brief semanal",
    readStory: "Ler o artigo",
    heroLabel: "Texto da semana",
    moreThisWeek: "Também nesta edição",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. As ligações são opcionais — o brief continua grátis.",
    welcomeExpect:
      "Uma vez por semana, três textos claros sobre sono, movimento e longevidade. Grátis. Sem pressão de subscrição.",
    welcomeKicker: "Bem-vindo",
    preheader: "Três textos que esta semana merecem uma leitura calma.",
    openMagazine: "Abrir a revista",
    brandLine: "Viva melhor e mais tempo — em qualquer idade.",
  },
  "pt-BR": {
    edition: "Brief semanal",
    readStory: "Ler o artigo",
    heroLabel: "Texto da semana",
    moreThisWeek: "Também nesta edição",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Os links são opcionais — o brief continua grátis.",
    welcomeExpect:
      "Uma vez por semana, três textos claros sobre sono, movimento e longevidade. Grátis. Sem pressão de assinatura.",
    welcomeKicker: "Bem-vindo",
    preheader: "Três textos que esta semana merecem uma leitura calma.",
    openMagazine: "Abrir a revista",
    brandLine: "Viva melhor e por mais tempo — em qualquer idade.",
  },
  en: {
    edition: "Weekly brief",
    readStory: "Read the piece",
    heroLabel: "This week’s lead",
    moreThisWeek: "Also in this issue",
    disclosure:
      "As an Amazon Associate I earn from qualifying purchases. Product links are optional — the brief stays free.",
    welcomeExpect:
      "Once a week: three clear pieces on sleep, movement and longevity. Free. No subscription pressure.",
    welcomeKicker: "Welcome",
    preheader: "Three pieces worth a quiet read this week.",
    openMagazine: "Open the magazine",
    brandLine: "Live well, longer — at every age.",
  },
};

export function briefChrome(locale: string): BriefChrome {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  return CHROME[locale] ?? CHROME[primary] ?? CHROME.en;
}

/** Editorial lead — never a comma-joined dump of titles. */
export function composeBriefLead(locale: string, _titles: string[]): string {
  return getNewsletterCopy(locale).briefIntro;
}

export function composeBriefSubject(locale: string, titles: string[]): string {
  const copy = getNewsletterCopy(locale);
  const first = titles.map((item) => item.trim()).find(Boolean);
  if (!first) return copy.briefSubject;
  const clipped = first.length > 58 ? `${first.slice(0, 55).trim()}…` : first;
  return `${MAGAZINE.name} · ${clipped}`;
}

export function composeBriefPreheader(locale: string, titles: string[]): string {
  const chrome = briefChrome(locale);
  const first = titles.map((item) => item.trim()).find(Boolean);
  if (!first) return chrome.preheader;
  return `${chrome.edition}: ${first}`;
}
