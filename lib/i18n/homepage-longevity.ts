import { chromePack } from "@/lib/i18n/chrome-pack";

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
  return chromePack(locale);
}

const COPY: Record<string, HomepageLongevityCopy> = {
  cs: {
    eyebrow: "ViaLongeVita · dlouhověkost",
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
      "Úvod článku zůstává čitelný. Zbytek otevírá tarif Redakce — 14 dní, pak 25 Kč (v zahraničí 1 € nebo 1 $). Tip u článku je dobrovolný.",
    softCta: "Vyzkoušet 14 dní",
    contributeHint: "Po dočtení můžete přispět — jen pokud chcete. Držíte tím text přístupný dalšímu čtenáři.",
  },
  en: {
    eyebrow: "ViaLongeVita · longevity",
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
      {
        title: "Slim health without a crash",
        desc: "A plate you can repeat, walking most days, GLP-1 only with a clinician. Biohacking is a sensor, not a diagnosis.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Weight and lifestyle",
      },
    ],
    readingTitle: "From the desk on longevity",
    allArticles: "All longevity articles",
    dailyTip: "Today’s tip",
    journal: "MediFlow journal",
    closer:
      "The opening stays readable. The rest opens with the Editorial plan — 14 days, then 25 CZK / €1 / $1. A tip on the article stays voluntary.",
    softCta: "Try 14 days",
    contributeHint: "After you finish an article you can contribute — only if you want to. That keeps the next reader reading.",
  },
  de: {
    eyebrow: "ViaLongeVita · Langlebigkeit",
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
      {
        title: "Schlank ohne Crash",
        desc: "Ein Teller zum Wiederholen, Gehen, GLP-1 nur in der Praxis. Biohacking ist ein Sensor, keine Diagnose.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Gewicht und Alltag",
      },
    ],
    readingTitle: "Aus der Redaktion zur Langlebigkeit",
    allArticles: "Alle Artikel zur Langlebigkeit",
    dailyTip: "Tipp des Tages",
    journal: "MediFlow-Tagebuch",
    closer:
      "Der Artikelanfang bleibt lesbar. Den Rest öffnet das Redaktionsabo — 14 Tage, dann 1 €. Ein Tipp am Artikel bleibt freiwillig.",
    softCta: "14 Tage testen",
    contributeHint: "Nach dem Lesen können Sie beitragen — nur wenn Sie möchten. So bleibt der Text für die nächste Person offen.",
  },
  fr: {
    eyebrow: "ViaLongeVita · longévité",
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
      {
        title: "Minceur sans crash",
        desc: "Une assiette répétable, de la marche, un GLP-1 seulement avec le médecin. Le biohacking est un capteur, pas un diagnostic.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Poids et mode de vie",
      },
    ],
    readingTitle: "La rédaction sur la longévité",
    allArticles: "Tous les articles sur la longévité",
    dailyTip: "Conseil du jour",
    journal: "Journal MediFlow",
    closer:
      "Le début de l’article reste lisible. Le reste s’ouvre avec l’abonnement Rédaction — 14 jours, puis 1 €. Le pourboire reste volontaire.",
    softCta: "Essayer 14 jours",
    contributeHint: "Après lecture, vous pouvez contribuer — seulement si vous le souhaitez. Cela garde le texte ouvert pour la personne suivante.",
  },
  pt: {
    eyebrow: "ViaLongeVita · longevidade",
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
      "O início do artigo continua legível. O resto abre com o plano Editorial — 14 dias, depois 1 €. A gorjeta no artigo continua voluntária.",
    softCta: "Experimentar 14 dias",
    contributeHint: "Depois de ler pode contribuir — só se quiser. Assim o texto fica aberto para a pessoa seguinte.",
  },
  "pt-BR": {
    eyebrow: "ViaLongeVita · longevidade",
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
      "O início do artigo continua legível. O resto abre com o plano Editorial — 14 dias, depois 1 €. A gorjeta no artigo continua voluntária.",
    softCta: "Experimentar 14 dias",
    contributeHint: "Depois de ler você pode contribuir — só se quiser. Assim o texto fica aberto para a próxima pessoa.",
  },
  it: {
    eyebrow: "ViaLongeVita · longevità",
    title: "Tre gesti calmi che la redazione ripete",
    lead: "Non sono promesse né protocolli. Abitudini già pubblicate su ViaLongeVita — sonno, movimento sostenibile e cibo senza caccia al miracolo.",
    steps: [
      {
        title: "Un sonno che tiene il ritmo",
        desc: "La stessa ora di sveglia, buio di notte, niente estremi. L’healthspan inizia dal recupero — non da un integratore.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Leggi sul sonno",
      },
      {
        title: "Un movimento che reggi",
        desc: "Camminare, scale, stare in piedi. Meno seduta ogni giorno vale più di un allenamento isolato.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Consigli sul movimento",
      },
      {
        title: "Cibo senza caccia al miracolo",
        desc: "Proteine, verdure, un piatto mediterraneo a casa. La longevità sta nell’abitudine.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Articoli sull’alimentazione",
      },
      {
        title: "Peso senza diete lampo",
        desc: "Un piatto ripetibile, camminare, GLP-1 solo con il medico. Il biohacking è un sensore, non una diagnosi.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Peso e stile di vita",
      },
    ],
    readingTitle: "Dalla redazione sulla longevità",
    allArticles: "Tutti gli articoli sulla longevità",
    dailyTip: "Consiglio di oggi",
    journal: "Diario MediFlow",
    closer:
      "L’inizio dell’articolo resta leggibile. Il resto si apre con il piano Redazione — 14 giorni, poi 1 €. La mancia resta volontaria.",
    softCta: "Prova 14 giorni",
    contributeHint: "Dopo la lettura puoi contribuire — solo se vuoi. Così il testo resta aperto per la persona successiva.",
  },
  es: {
    eyebrow: "ViaLongeVita · longevidad",
    title: "Tres gestos calmos que la redacción repite",
    lead: "No son promesas ni protocolos. Hábitos ya publicados en ViaLongeVita — sueño, movimiento sostenible y comida sin caza del milagro.",
    steps: [
      {
        title: "Un sueño que sostiene el ritmo",
        desc: "La misma hora de levantarse, oscuridad por la noche, sin extremos. El healthspan empieza en la recuperación — no en un suplemento.",
        href: "/verejnost/clanky?topic=spanek",
        cta: "Leer sobre el sueño",
      },
      {
        title: "Un movimiento que puedes mantener",
        desc: "Caminar, escaleras, estar de pie. Sentarse menos cada día vale más que un entrenamiento aislado.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Consejos de movimiento",
      },
      {
        title: "Comida sin caza del milagro",
        desc: "Proteína, verduras, un plato mediterráneo en casa. La longevidad está en el hábito.",
        href: "/verejnost/clanky?topic=vyziva",
        cta: "Artículos de nutrición",
      },
      {
        title: "Peso sin dietas milagro",
        desc: "Un plato repetible, caminar, GLP-1 solo con el médico. El biohacking es un sensor, no un diagnóstico.",
        href: "/verejnost/clanky?topic=zivotni-styl",
        cta: "Peso y estilo de vida",
      },
    ],
    readingTitle: "De la redacción sobre longevidad",
    allArticles: "Todos los artículos de longevidad",
    dailyTip: "Consejo de hoy",
    journal: "Diario MediFlow",
    closer:
      "El comienzo del artículo sigue legible. El resto se abre con el plan Redacción — 14 días, luego 1 €. La propina sigue siendo voluntaria.",
    softCta: "Probar 14 días",
    contributeHint: "Después de leer puedes contribuir — solo si quieres. Así el texto queda abierto para la siguiente persona.",
  },
};

export function getHomepageLongevityCopy(locale?: string | null): HomepageLongevityCopy {
  const key = pack(locale);
  return COPY[key] ?? COPY.en;
}
