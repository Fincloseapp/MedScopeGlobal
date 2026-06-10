import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

export type V21StudiumTopic = {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  tips: string[];
};

export const V21_STUDIUM_TOPICS: V21StudiumTopic[] = [
  {
    slug: "univerzity",
    title: "Lékařské fakulty v ČR",
    description:
      "Přehled všech 8 českých LF — Praha, Brno, Olomouc, Ostrava, Plzeň, Hradec Králové. Odkazy na oficiální weby a přijímačky.",
    href: "/studium/univerzity",
    imageUrl: V21_MEDICAL_IMAGES.university,
    tips: ["Porovnat fakulty a města", "Sledovat termíny přijímaček", "Oficiální požadavky na webu LF"],
  },
  {
    slug: "priprava",
    title: "Příprava na studium medicíny",
    description:
      "Strategie pro přijímačky na LF: biologie, chemie, fyzika a testové techniky. Doporučené zdroje a studijní plán na 6–12 měsíců.",
    href: "/medicina/priprava",
    imageUrl: V21_MEDICAL_IMAGES.medicina,
    tips: ["Opakování základů biologie a chemie", "Řešení modelových testů", "Pravidelný režim a zdravý spánek"],
  },
  {
    slug: "anatomie",
    title: "Anatomie",
    description:
      "Systematická anatomie člověka — kostra, svaly, nervový a cévní systém. Přehled pro 1.–2. ročník s důrazem na klinickou korelaci.",
    href: "/medicina/studium?obor=anatomie",
    imageUrl: V21_MEDICAL_IMAGES.anatomy,
    tips: ["Atlas + preparáty", "Aktivní recall", "Klinické koreláty od začátku"],
  },
  {
    slug: "fyziologie",
    title: "Fyziologie",
    description:
      "Funkce orgánových systémů, homeostáza a patofyziologické principy. Materiál pro zkoušky z fyziologie a propojení s patologií.",
    href: "/medicina/studium?obor=fyziologie",
    imageUrl: V21_MEDICAL_IMAGES.medicina,
    tips: ["Schémata procesů", "Propojení s patologií", "Kazuistiky z praxe"],
  },
  {
    slug: "patologie",
    title: "Patologie",
    description:
      "Obecná a speciální patologie — etiologie, patogeneze, morfologie a klinické projevy. Příprava na státní a atestace.",
    href: "/medicina/studium?obor=patologie",
    imageUrl: V21_MEDICAL_IMAGES.study,
    tips: ["Mikroskopické obrazy", "Diferenciální diagnostika", "Propojení s klinikou"],
  },
  {
    slug: "klinicke-obory",
    title: "Klinické obory",
    description:
      "Přehled interny, chirurgie, pediatrie, gynekologie a dalších oborů. Struktura stáží a doporučená literatura.",
    href: "/medicina/studium?obor=klinika",
    imageUrl: V21_MEDICAL_IMAGES.study,
    tips: ["OSCE příprava", "Komunikace s pacientem", "Evidence-based přístup"],
  },
  {
    slug: "zkousky",
    title: "Zkoušky a testování",
    description:
      "Metody efektivního učení: spaced repetition, testové otázky, simulace zkoušek a time management.",
    href: "/medicina/studium?obor=zkousky",
    imageUrl: V21_MEDICAL_IMAGES.medicina,
    tips: ["Anki / kartičky", "Simulace pod časovým tlakem", "Analýza chyb"],
  },
  {
    slug: "prijimacky",
    title: "Přijímačky na LF",
    description:
      "Termíny, struktura testů, bodování a tipy pro uchazeče o studium medicíny v ČR. Přehled fakult a požadavků.",
    href: "/studium/prijimacky",
    imageUrl: V21_MEDICAL_IMAGES.university,
    tips: ["Sledovat termíny fakult", "Modelové testy", "Praxe v nemocnici / dobrovolnictví"],
  },
];
