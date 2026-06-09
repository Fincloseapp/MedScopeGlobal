import type { V23NewsletterItem } from "@/lib/v23/newsletter/types";

/** České kurátorské položky — použijí se, když DB sekce vrátí prázdno */
export const V23_NEWSLETTER_FALLBACKS = {
  articleSummary:
    "Odborný článek s českým shrnutím, klinickým dopadem a odkazy na ověřené zdroje MedScopeGlobal.",
  sectionEmpty:
    "Aktuální přehled připravujeme — sledujte MedScopeGlobal pro nejnovější odborný obsah v češtině.",
} as const;

export const V23_FALLBACK_ARTICLES: V23NewsletterItem[] = [
  {
    title: "Evidence-based medicína v každodenní praxi",
    summary:
      "Jak kriticky číst studie, hodnotit bias a aplikovat doporučení v ambulantní péči — praktický rámec pro lékaře i studenty.",
    href: "/articles",
  },
  {
    title: "Revmatologie: novinky z klinického výzkumu",
    summary:
      "Přehled aktuálních témat v revmatologii — biologická léčba, JAK inhibitory a personalizace terapie dle guideline.",
    href: "/studie",
  },
];

export const V23_FALLBACK_LEGISLATION: V23NewsletterItem[] = [
  {
    title: "Úhrady a metodiky MZČR — aktuální rámec",
    summary:
      "Přehled změn v úhradové politice, DRG a metodických pokynech relevantních pro ambulantní i hospitalizační péči.",
    href: "/legislativa",
  },
  {
    title: "SÚKL: bezpečnost léčiv a registrace",
    summary:
      "Novinky z registru léčivých přípravků, hodnocení rizik a bezpečnostní signály pro klinickou praxi v ČR.",
    href: "/legislativa",
  },
];

export const V23_FALLBACK_DRUGS: V23NewsletterItem[] = [
  {
    title: "Nové registrace a změny v SPC",
    summary:
      "Přehled schválených přípravků a aktualizací charakteristik přípravku se zaměřením na revmatologii a interní medicínu.",
    href: "/leky",
  },
  {
    title: "EMA a FDA: klíčové regulační novinky",
    summary:
      "Evropské a americké regulační rozhodnutí s dopadem na dostupnost terapií v České republice.",
    href: "/leky/novinky",
  },
];

export const V23_FALLBACK_UNIVERSITIES: V23NewsletterItem[] = [
  {
    title: "Výzkum na českých lékařských fakultách",
    summary:
      "Novinky z klinického a preklinického výzkumu — spolupráce univerzit, granty GAČR a transfer do praxe.",
    href: "/novinky/univerzity",
  },
  {
    title: "Vzdělávání a klinické dovednosti",
    summary:
      "Inovace ve výuce medicíny, simulační centra a příprava studentů na klinickou praxi.",
    href: "/medicina",
  },
];
