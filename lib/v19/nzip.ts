/**
 * NZIP.cz — kompletní zdrojové mapování pro v19.7
 * Pouze veřejné sekce; generace = vlastní shrnutí, nikdy kopie textu.
 */
import { NZIP_BASE_URL } from "@/lib/v19/legal";
import type { NzipCategory, V19SourceTopic, V19Specialty } from "@/lib/v19/types";

export type { NzipCategory };

export const NZIP_CATEGORIES: NzipCategory[] = [
  "nemoci",
  "prevence",
  "diagnostika",
  "lecba",
  "zivotni-styl",
  "vyziva",
  "zdravotnicke-profese",
  "zdravotnicke-systemy",
  "pacientska-edukace",
  "odborne-clanky",
  "publikace",
  "doporuceni",
  "zdravotnicke-pojmy",
  "slovnik-pojmu",
  "tematicke-okruhy",
  "vedecke-aktuality",
];

type NzipTopicDef = {
  id: string;
  specialty: V19Specialty;
  path: string;
  topic: string;
  category: NzipCategory;
  briefingHint: string;
  keywords: string[];
  scientificTerms?: string[];
};

function nzipUrl(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${NZIP_BASE_URL}${p}`;
}

function toSourceTopic(def: NzipTopicDef): V19SourceTopic {
  return {
    id: def.id,
    specialty: def.specialty,
    tier: "cz",
    sourceName: "NZIP.cz",
    sourceUrl: nzipUrl(def.path),
    topic: def.topic,
    briefingHint: def.briefingHint,
    keywords: ["NZIP", ...def.keywords],
    scientificTerms: def.scientificTerms,
    nzipCategory: def.category,
    isNzip: true,
  };
}

/** Kurátorovaná mapa veřejných NZIP tematických okruhů × oborů */
const NZIP_TOPIC_DEFS: NzipTopicDef[] = [
  // —— Revmatologie ——
  {
    id: "nzip-ra-nemoci",
    specialty: "rheumatology",
    path: "nemoci/revmatologicke-poruchy",
    topic: "nzip-ra-nemoci",
    category: "nemoci",
    briefingHint: "NZIP přehled revmatických onemocnění — příznaky a kontext pro pacienty i lékaře.",
    keywords: ["revmatologie", "nemoci", "klouby"],
    scientificTerms: ["revmatoidní artritida", "artroza"],
  },
  {
    id: "nzip-ra-prevence",
    specialty: "rheumatology",
    path: "prevence/revmatologie",
    topic: "nzip-ra-prevence",
    category: "prevence",
    briefingHint: "NZIP prevence revmatických komplikací a životní styl bez léčebných postupů.",
    keywords: ["prevence", "revmatologie"],
  },
  {
    id: "nzip-ra-diagnostika",
    specialty: "rheumatology",
    path: "diagnostika/revmatologie",
    topic: "nzip-ra-diagnostika",
    category: "diagnostika",
    briefingHint: "NZIP obecný kontext diagnostiky revmatických onemocnění — kdy vyhledat specialistu.",
    keywords: ["diagnostika", "revmatologie"],
  },
  {
    id: "nzip-ra-pacient",
    specialty: "rheumatology",
    path: "pacientska-edukace/revmatologie",
    topic: "nzip-ra-pacientska-edukace",
    category: "pacientska-edukace",
    briefingHint: "NZIP pacientská edukace o revmatických onemocněních — srozumitelný jazyk.",
    keywords: ["edukace", "pacient", "revmatologie"],
  },
  // —— Kardiologie ——
  {
    id: "nzip-kardio-nemoci",
    specialty: "cardiology",
    path: "nemoci/kardiovaskularni",
    topic: "nzip-kardio-nemoci",
    category: "nemoci",
    briefingHint: "NZIP přehled kardiovaskulárních onemocnění a rizikových faktorů.",
    keywords: ["kardiologie", "srdce", "nemoci"],
    scientificTerms: ["hypertenze", "arytmie"],
  },
  {
    id: "nzip-kardio-prevence",
    specialty: "cardiology",
    path: "prevence/kardiovaskularni",
    topic: "nzip-kardio-prevence",
    category: "prevence",
    briefingHint: "NZIP prevence srdečně-cévních onemocnění — životní styl a screening.",
    keywords: ["prevence", "kardiologie"],
  },
  {
    id: "nzip-kardio-zivotni-styl",
    specialty: "cardiology",
    path: "zivotni-styl/srdce",
    topic: "nzip-kardio-zivotni-styl",
    category: "zivotni-styl",
    briefingHint: "NZIP doporučení životního stylu pro zdraví srdce — obecné informace.",
    keywords: ["životní styl", "kardiologie"],
  },
  // —— Endokrinologie / diabetes ——
  {
    id: "nzip-diabetes-nemoci",
    specialty: "endocrinology",
    path: "nemoci/diabetes",
    topic: "nzip-diabetes-nemoci",
    category: "nemoci",
    briefingHint: "NZIP informace o diabetu a metabolických poruchách — obecný přehled.",
    keywords: ["diabetes", "endokrinologie"],
    scientificTerms: ["glykémie", "typ 2 diabetes"],
  },
  {
    id: "nzip-diabetes-vyziva",
    specialty: "endocrinology",
    path: "vyziva/diabetes",
    topic: "nzip-diabetes-vyziva",
    category: "vyziva",
    briefingHint: "NZIP výživová doporučení u diabetu — bez konkrétních dietních plánů.",
    keywords: ["výživa", "diabetes"],
  },
  {
    id: "nzip-diabetes-lecba-obecne",
    specialty: "endocrinology",
    path: "lecba/diabetes-obecne",
    topic: "nzip-diabetes-lecba-obecne",
    category: "lecba",
    briefingHint: "NZIP obecné informace o léčbě diabetu — bez dávkování a bez postupů.",
    keywords: ["léčba", "diabetes", "obecné"],
  },
  // —— Onkologie ——
  {
    id: "nzip-onko-prevence",
    specialty: "oncology",
    path: "prevence/onkologie",
    topic: "nzip-onko-prevence",
    category: "prevence",
    briefingHint: "NZIP prevence a včasná diagnostika onkologických onemocnění.",
    keywords: ["onkologie", "prevence", "screening"],
  },
  {
    id: "nzip-onko-pacient",
    specialty: "oncology",
    path: "pacientska-edukace/onkologie",
    topic: "nzip-onko-pacientska-edukace",
    category: "pacientska-edukace",
    briefingHint: "NZIP edukace pro pacienty s onkologickým onemocněním — podpora a informace.",
    keywords: ["onkologie", "pacient", "edukace"],
  },
  {
    id: "nzip-onko-doporuceni",
    specialty: "oncology",
    path: "doporuceni/onkologie",
    topic: "nzip-onko-doporuceni",
    category: "doporuceni",
    briefingHint: "NZIP odborná doporučení v onkologii — kontext bez konkrétních protokolů.",
    keywords: ["doporučení", "onkologie"],
  },
  // —— Infekční ——
  {
    id: "nzip-infekce-nemoci",
    specialty: "infectious-disease",
    path: "nemoci/infekcni",
    topic: "nzip-infekce-nemoci",
    category: "nemoci",
    briefingHint: "NZIP přehled infekčních onemocnění a přenosu — veřejné zdraví.",
    keywords: ["infekce", "epidemiologie"],
  },
  {
    id: "nzip-infekce-prevence",
    specialty: "infectious-disease",
    path: "prevence/infekce",
    topic: "nzip-infekce-prevence",
    category: "prevence",
    briefingHint: "NZIP prevence infekcí a očkování — obecný kontext.",
    keywords: ["prevence", "očkování"],
  },
  {
    id: "nzip-infekce-vedecke",
    specialty: "infectious-disease",
    path: "vedecke-aktuality/infekcni",
    topic: "nzip-infekce-vedecke-aktuality",
    category: "vedecke-aktuality",
    briefingHint: "NZIP vědecké aktuality v oblasti infekčních nemocí — shrnutí trendů.",
    keywords: ["věda", "infekce", "aktuality"],
  },
  // —— Neurologie ——
  {
    id: "nzip-neuro-nemoci",
    specialty: "neurology",
    path: "nemoci/neurologicke",
    topic: "nzip-neuro-nemoci",
    category: "nemoci",
    briefingHint: "NZIP neurologická onemocnění — příznaky a kdy vyhledat pomoc.",
    keywords: ["neurologie", "nemoci"],
    scientificTerms: ["mrtvice", "epilepsie"],
  },
  {
    id: "nzip-neuro-pojmy",
    specialty: "neurology",
    path: "slovnik-pojmu/neurologie",
    topic: "nzip-neuro-slovnik",
    category: "slovnik-pojmu",
    briefingHint: "NZIP zdravotnické pojmy v neurologii — vysvětlení pro laiky.",
    keywords: ["slovník", "neurologie", "pojmy"],
  },
  // —— Pulmonologie ——
  {
    id: "nzip-pulmo-nemoci",
    specialty: "pulmonology",
    path: "nemoci/respiracni",
    topic: "nzip-pulmo-nemoci",
    category: "nemoci",
    briefingHint: "NZIP respirační onemocnění — astma, CHOPN, obecný kontext.",
    keywords: ["pulmonologie", "dýchání"],
  },
  {
    id: "nzip-pulmo-prevence",
    specialty: "pulmonology",
    path: "prevence/respiracni",
    topic: "nzip-pulmo-prevence",
    category: "prevence",
    briefingHint: "NZIP prevence respiračních onemocnění a rizikové faktory.",
    keywords: ["prevence", "pulmonologie"],
  },
  // —— Gastroenterologie ——
  {
    id: "nzip-gastro-nemoci",
    specialty: "gastroenterology",
    path: "nemoci/travicni",
    topic: "nzip-gastro-nemoci",
    category: "nemoci",
    briefingHint: "NZIP trávicí onemocnění — obecný přehled pro pacienty.",
    keywords: ["gastroenterologie", "trávení"],
  },
  {
    id: "nzip-gastro-vyziva",
    specialty: "gastroenterology",
    path: "vyziva/travicni",
    topic: "nzip-gastro-vyziva",
    category: "vyziva",
    briefingHint: "NZIP výživa a trávicí zdraví — obecná doporučení.",
    keywords: ["výživa", "gastroenterologie"],
  },
  // —— Dermatologie ——
  {
    id: "nzip-derm-nemoci",
    specialty: "dermatology",
    path: "nemoci/kozni",
    topic: "nzip-derm-nemoci",
    category: "nemoci",
    briefingHint: "NZIP kožní onemocnění — příznaky a prevence.",
    keywords: ["dermatologie", "kůže"],
  },
  {
    id: "nzip-derm-pacient",
    specialty: "dermatology",
    path: "pacientska-edukace/kozni",
    topic: "nzip-derm-edukace",
    category: "pacientska-edukace",
    briefingHint: "NZIP pacientská edukace o péči o kůži.",
    keywords: ["dermatologie", "edukace"],
  },
  // —— Interna ——
  {
    id: "nzip-interna-tematicke",
    specialty: "internal-medicine",
    path: "tematicke-okruhy/interna",
    topic: "nzip-interna-tematicke-okruhy",
    category: "tematicke-okruhy",
    briefingHint: "NZIP tematické okruhy interní medicíny — přehled oblastí.",
    keywords: ["interna", "tematické okruhy"],
  },
  {
    id: "nzip-interna-odborne",
    specialty: "internal-medicine",
    path: "odborne-clanky/interna",
    topic: "nzip-interna-odborne",
    category: "odborne-clanky",
    briefingHint: "NZIP odborné články z oblasti interní medicíny — kontext pro shrnutí.",
    keywords: ["interna", "odborné články"],
  },
  {
    id: "nzip-interna-systemy",
    specialty: "internal-medicine",
    path: "zdravotnicke-systemy/cr",
    topic: "nzip-zdravotnicke-systemy",
    category: "zdravotnicke-systemy",
    briefingHint: "NZIP přehled zdravotnického systému v ČR — organizace péče.",
    keywords: ["zdravotnictví", "systém", "ČR"],
  },
  // —— Urgentní medicína ——
  {
    id: "nzip-urgent-nemoci",
    specialty: "emergency-medicine",
    path: "nemoci/akutni-stavy",
    topic: "nzip-urgent-akutni",
    category: "nemoci",
    briefingHint: "NZIP akutní stavy a kdy vyhledat urgentní péči — bez postupů.",
    keywords: ["urgentní", "akutní"],
  },
  {
    id: "nzip-urgent-profese",
    specialty: "emergency-medicine",
    path: "zdravotnicke-profese/urgentni",
    topic: "nzip-urgent-profese",
    category: "zdravotnicke-profese",
    briefingHint: "NZIP role zdravotnických profesí v urgentní medicíně.",
    keywords: ["urgentní medicína", "profese"],
  },
  // —— Průřezová témata NZIP ——
  {
    id: "nzip-publikace-prehled",
    specialty: "internal-medicine",
    path: "publikace",
    topic: "nzip-publikace-prehled",
    category: "publikace",
    briefingHint: "NZIP publikace a odborné materiály — kontext pro medicínské shrnutí.",
    keywords: ["publikace", "NZIP"],
  },
  {
    id: "nzip-pojmy-obecne",
    specialty: "internal-medicine",
    path: "zdravotnicke-pojmy",
    topic: "nzip-zdravotnicke-pojmy",
    category: "zdravotnicke-pojmy",
    briefingHint: "NZIP slovník zdravotnických pojmů — vysvětlení pro laiky i studenty.",
    keywords: ["pojmy", "slovník"],
  },
];

export const NZIP_SOURCE_TOPICS: V19SourceTopic[] = NZIP_TOPIC_DEFS.map(toSourceTopic);

export function isNzipTopic(topic: V19SourceTopic): boolean {
  return topic.isNzip === true || topic.sourceName === "NZIP.cz";
}

export function nzipTopicsForCategory(category: NzipCategory): V19SourceTopic[] {
  return NZIP_SOURCE_TOPICS.filter((t) => t.nzipCategory === category);
}

export function nzipTopicsForSpecialty(specialty: V19Specialty): V19SourceTopic[] {
  return NZIP_SOURCE_TOPICS.filter((t) => t.specialty === specialty);
}
