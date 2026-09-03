import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export type HomepageLongevityCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  steps: { title: string; desc: string; href: string; cta: string }[];
  readingTitle: string;
  allArticles: string;
  dailyTip: string;
  journal: string;
  closer: string;
  softCta: string;
  contributeHint: string;
};

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

const COPY: Record<string, HomepageLongevityCopy> = {
  cs: {
    eyebrow: "Dlouhověkost · každý den",
    title: "Tři klidné kroky, které redakce opakuje",
    lead: "Nejsou to sliby ani protokoly. Jsou to návyky ze článků, které už na ViaLongeVita vycházejí — spánek, pohyb, který vydržíte, a jídlo bez honu za zázrakem.",
    steps: [
      {
        title: "Spánek, který drží rytmus",
        desc: "Stejný čas vstávání, tma v noci, bez extrémů. Healthspan začíná regenerací — ne doplňkem.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Číst o spánku",
      },
      {
        title: "Pohyb, který vydržíte",
        desc: "Chůze, schody, stání u stolu. Menší nečinnost každý den vydá víc než jednorázový sport.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Tipy k pohybu",
      },
      {
        title: "Jídlo bez honu za zázrakem",
        desc: "Bílkoviny, zelenina, středomořský talíř v české kuchyni. Dlouhověkost je v návyku.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Články o výživě",
      },
    ],
    readingTitle: "Z redakce o dlouhověkosti",
    allArticles: "Všechny články o dlouhověkosti",
    dailyTip: "Dnešní tip",
    journal: "MediFlow deník",
    closer:
      "Číst můžete dál zdarma. Pokud vám po dočtení dává smysl redakci podpořit, můžete přispět u článku — nebo si 14 dní v klidu vyzkoušet a kdykoli skončit. Není to podmínka.",
    softCta: "Vyzkoušet 14 dní",
    contributeHint: "Po dočtení článku můžete přispět — jen pokud chcete.",
  },
  en: {
    eyebrow: "Longevity · every day",
    title: "Three quiet steps the desk keeps repeating",
    lead: "Not promises and not protocols. Habits from pieces already published on ViaLongeVita — sleep, movement you can keep, and food without a miracle hunt.",
    steps: [
      {
        title: "Sleep that holds a rhythm",
        desc: "The same wake time, darkness at night, no extremes. Healthspan starts with recovery — not a supplement.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Read about sleep",
      },
      {
        title: "Movement you can keep",
        desc: "Walking, stairs, standing at the desk. Less sitting every day beats a one-off workout.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Movement tips",
      },
      {
        title: "Food without a miracle hunt",
        desc: "Protein, vegetables, a Mediterranean plate at home. Longevity lives in the habit.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Nutrition articles",
      },
    ],
    readingTitle: "From the desk on longevity",
    allArticles: "All longevity articles",
    dailyTip: "Today’s tip",
    journal: "MediFlow journal",
    closer:
      "You can keep reading free. If a piece helped, you can leave a tip on the article — or try 14 days and cancel anytime. Neither is required.",
    softCta: "Try 14 days",
    contributeHint: "After you finish an article you can contribute — only if you want to.",
  },
  de: {
    eyebrow: "Langlebigkeit · jeden Tag",
    title: "Drei ruhige Schritte, die die Redaktion wiederholt",
    lead: "Keine Versprechen und keine Protokolle. Gewohnheiten aus Texten, die ViaLongeVita schon veröffentlicht — Schlaf, Bewegung zum Durchhalten und Essen ohne Wundersuche.",
    steps: [
      {
        title: "Schlaf, der den Rhythmus hält",
        desc: "Gleiche Aufstehzeit, Dunkelheit in der Nacht, keine Extreme. Healthspan beginnt mit Erholung — nicht mit einem Präparat.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Über Schlaf lesen",
      },
      {
        title: "Bewegung, die Sie halten",
        desc: "Gehen, Treppen, Stehen am Schreibtisch. Weniger Sitzen jeden Tag wiegt mehr als ein einmaliges Training.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Bewegungstipps",
      },
      {
        title: "Essen ohne Wundersuche",
        desc: "Eiweiß, Gemüse, ein mediterraner Teller zu Hause. Langlebigkeit steckt in der Gewohnheit.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Artikel zur Ernährung",
      },
    ],
    readingTitle: "Aus der Redaktion zur Langlebigkeit",
    allArticles: "Alle Artikel zur Langlebigkeit",
    dailyTip: "Tipp des Tages",
    journal: "MediFlow-Tagebuch",
    closer:
      "Sie können kostenlos weiterlesen. Wenn ein Text geholfen hat, können Sie am Artikel einen Beitrag hinterlassen — oder 14 Tage testen und jederzeit kündigen. Beides ist freiwillig.",
    softCta: "14 Tage testen",
    contributeHint: "Nach dem Lesen können Sie beitragen — nur wenn Sie möchten.",
  },
  fr: {
    eyebrow: "Longévité · chaque jour",
    title: "Trois gestes calmes que la rédaction répète",
    lead: "Ni promesses ni protocoles. Des habitudes déjà publiées sur ViaLongeVita — le sommeil, un mouvement tenable, une assiette sans chasse au miracle.",
    steps: [
      {
        title: "Un sommeil qui tient le rythme",
        desc: "La même heure de lever, l’obscurité la nuit, sans extrême. Le healthspan commence par la récupération — pas par un complément.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Lire sur le sommeil",
      },
      {
        title: "Un mouvement que vous tenez",
        desc: "Marche, escaliers, rester debout au bureau. Moins s’asseoir chaque jour vaut mieux qu’un sport isolé.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Conseils mouvement",
      },
      {
        title: "Manger sans chasse au miracle",
        desc: "Protéines, légumes, une assiette méditerranéenne à la maison. La longévité est dans l’habitude.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Articles nutrition",
      },
    ],
    readingTitle: "La rédaction sur la longévité",
    allArticles: "Tous les articles sur la longévité",
    dailyTip: "Conseil du jour",
    journal: "Journal MediFlow",
    closer:
      "Vous pouvez continuer à lire gratuitement. Si un texte vous a aidé, vous pouvez laisser une contribution sur l’article — ou essayer 14 jours et résilier à tout moment. Rien n’est obligatoire.",
    softCta: "Essayer 14 jours",
    contributeHint: "Après lecture, vous pouvez contribuer — seulement si vous le souhaitez.",
  },
  pt: {
    eyebrow: "Longevidade · todos os dias",
    title: "Três gestos calmos que a redação repete",
    lead: "Não são promessas nem protocolos. São hábitos já publicados na ViaLongeVita — sono, movimento que se aguenta e comida sem caça ao milagre.",
    steps: [
      {
        title: "Sono que segura o ritmo",
        desc: "A mesma hora de acordar, escuridão à noite, sem extremos. O healthspan começa na recuperação — não num suplemento.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Ler sobre o sono",
      },
      {
        title: "Movimento que consegue manter",
        desc: "Caminhar, escadas, estar de pé. Menos tempo sentado todos os dias vale mais do que um treino isolado.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Dicas de movimento",
      },
      {
        title: "Comida sem caça ao milagre",
        desc: "Proteína, hortícolas, um prato mediterrânico em casa. A longevidade está no hábito.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Artigos de alimentação",
      },
    ],
    readingTitle: "Da redação sobre longevidade",
    allArticles: "Todos os artigos de longevidade",
    dailyTip: "Dica de hoje",
    journal: "Diário MediFlow",
    closer:
      "Pode continuar a ler de graça. Se um texto ajudou, pode deixar um contributo no artigo — ou experimentar 14 dias e cancelar quando quiser. Nada é obrigatório.",
    softCta: "Experimentar 14 dias",
    contributeHint: "Depois de ler pode contribuir — só se quiser.",
  },
  "pt-BR": {
    eyebrow: "Longevidade · todos os dias",
    title: "Três gestos calmos que a redação repete",
    lead: "Não são promessas nem protocolos. São hábitos já publicados na ViaLongeVita — sono, movimento que dá para manter e comida sem caça ao milagre.",
    steps: [
      {
        title: "Sono que segura o ritmo",
        desc: "A mesma hora de acordar, escuridão à noite, sem extremos. O healthspan começa na recuperação — não num suplemento.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Ler sobre o sono",
      },
      {
        title: "Movimento que você consegue manter",
        desc: "Caminhar, escadas, ficar em pé. Menos tempo sentado todo dia vale mais do que um treino isolado.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Dicas de movimento",
      },
      {
        title: "Comida sem caça ao milagre",
        desc: "Proteína, verduras, um prato mediterrâneo em casa. A longevidade está no hábito.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Artigos de alimentação",
      },
    ],
    readingTitle: "Da redação sobre longevidade",
    allArticles: "Todos os artigos de longevidade",
    dailyTip: "Dica de hoje",
    journal: "Diário MediFlow",
    closer:
      "Você pode continuar lendo de graça. Se um texto ajudou, pode deixar um contributo no artigo — ou experimentar 14 dias e cancelar quando quiser. Nada é obrigatório.",
    softCta: "Experimentar 14 dias",
    contributeHint: "Depois de ler você pode contribuir — só se quiser.",
  },
};

export function getHomepageLongevityCopy(locale?: string | null): HomepageLongevityCopy {
  const key = pack(locale);
  return COPY[key] ?? COPY.en;
}
