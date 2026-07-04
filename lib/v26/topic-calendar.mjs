/**
 * v26.3 — seasonal, current-events and longevity topic seeds for public writers.
 * Ethically adapted from trending themes (BMJ, NYT Well, Harvard Health) — not copied.
 */
import { createHash } from "node:crypto";

/** Longevity pillar — prodloužení délky života ve zdraví */
export const LONGEVITY_SEEDS = [
  { seed: "Healthspan versus lifespan — proč jde o kvalitu let", angle: "praktické návyky modrých zón" },
  { seed: "Biologický věk versus kalendářní — co ovlivníte dnes", angle: "spánek, pohyb, strava bez extrémů" },
  { seed: "Metabolická flexibilita a stabilní energie po 40", angle: "srozumitelně pro běžný den" },
  { seed: "Prevence sarkopenie — síla svalů v každém věku", angle: "domácí cviky a bílkoviny" },
  { seed: "Spánek jako pilíř dlouhověkosti", angle: "hygiena spánku podle aktuálních studií" },
  { seed: "Stres a stárnutí — co pomáhá a co je mýtus", angle: "HPA osa bez strašení" },
  { seed: "Kardiovaskulární rezerva — chůze, dech, tlak", angle: "měřitelné kroky pro každého" },
  { seed: "Mikrobiom a střevo — co znamená pro imunitu a náladu", angle: "strava bohatá na vlákninu" },
  { seed: "Kognitivní rezerva — mozek aktivní desetiletí", angle: "pohyb, sociální vazby, učení" },
  { seed: "Biomarkery zdraví — co si nechat vysvětlit u lékaře", angle: "glukóza, lipidy, vitamín D bez paniky" },
];

const SEASONAL_BY_MONTH = {
  0: [
    { seed: "Zimní imunita a vitamín D", angle: "realistický plán pro lednové měsíce" },
    { seed: "Sezónní deprese a světlo", angle: "SAD, chůze venku, kdy vyhledat pomoc" },
  ],
  1: [
    { seed: "Prevence chřipky v hlavní sezóně", angle: "očkování, hygiena, kdy k lékaři" },
    { seed: "Zdravé srdce v zimě", angle: "tlak, pohyb v interiéru" },
  ],
  2: [
    { seed: "Jarní alergie — příprava před sezónou", angle: "pollen, léky, domácí tipy" },
    { seed: "Restart pohybu po zimě", angle: "bez zranění, postupné zvyšování" },
  ],
  3: [
    { seed: "Jarní únava — fakta versus mýty", angle: "spánek, jídlo, kdy to není normální" },
    { seed: "Screening v jarních měsících", angle: "co stihnout u praktika" },
  ],
  4: [
    { seed: "Sluneční ochrana před létem", angle: "SPF, pihy, prevence melanomu" },
    { seed: "Hydratace a sport na jaře", angle: "pitný režim bez extrémů" },
  ],
  5: [
    { seed: "Tepelná vlna a riziko pro srdce", angle: "senioři, děti, praktické kroky" },
    { seed: "Bezpečné grilování a strava v létě", angle: "mýty o masu a zelenině" },
  ],
  6: [
    { seed: "Dovolená bez zdravotních komplikací", angle: "cestování, léky, očkování" },
    { seed: "Spánek v horkých nocích", angle: "chlad, režim, děti" },
  ],
  7: [
    { seed: "Návrat do školy a imunita dětí", angle: "spánek, strava, očkování" },
    { seed: "Ergonomie při práci z domova", angle: "záda, oči, přestávky" },
  ],
  8: [
    { seed: "Podzimní očkování proti chřipce", angle: "kdo by neměl váhat" },
    { seed: "Sezónní únava na podzim", angle: "světlo, pohyb, duševní pohoda" },
  ],
  9: [
    { seed: "Duševní zdraví v podzimním období", angle: "prevence vyhoření, kdy hledat pomoc" },
    { seed: "Prevence respiračních infekcí na podzim", angle: "rodina, školka, práce" },
  ],
  10: [
    { seed: "Sváteční strava bez výčitek", angle: "realistický přístup, ne dieta" },
    { seed: "Alkohol a zdraví v socializační sezóně", angle: "limity, rizika, alternativy" },
  ],
  11: [
    { seed: "Zimní spánek a regenerace", angle: "circadian rytmus, světlo" },
    { seed: "Novoroční cíle ve zdraví — co funguje", angle: "malé návyky místo extrémů" },
  ],
};

/** Trending themes adapted for Czech audience (inspiration only). */
export const CURRENT_EVENT_SEEDS = [
  { seed: "GLP-1 a hubnutí — co veřejnost potřebuje vědět", angle: "realistická očekávání, lékařský dohled" },
  { seed: "Digitální zdraví a wearables", angle: "co z hodinek dává smysl a co ne" },
  { seed: "Microplastics a zdraví — co víme dnes", angle: "bez paniky, praktické kroky" },
  { seed: "Duševní zdraví po pandemii — kam směřuje péče", angle: "dostupnost, telemedicína" },
  { seed: "Ultra-zpracovaná strava a chronická onemocnění", angle: "etikety, domácí vaření" },
  { seed: "Screen time a spánek dětí", angle: "limity, rodinná pravidla" },
  { seed: "Klimatická změna a alergie", angle: "delší sezóna pylů, adaptace" },
  { seed: "Preventivní screening rakoviny — aktualizace doporučení", angle: "věk, frekvence, dostupnost v ČR" },
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

function hashPick(pool, salt, date = new Date()) {
  if (!pool?.length) return null;
  const day = dayOfYear(date);
  const hash = createHash("sha256").update(`${salt}:${day}`).digest("hex");
  return pool[parseInt(hash.slice(0, 8), 16) % pool.length];
}

/**
 * Merge writer base seeds with calendar overlays (seasonal + current + optional longevity).
 * @param {Array<{seed: string, angle: string}>} baseSeeds
 * @param {{ topic?: string, writerIndex?: number, date?: Date, includeLongevity?: boolean }} opts
 */
export function enrichSeedsWithCalendar(baseSeeds, opts = {}) {
  const date = opts.date ?? new Date();
  const month = date.getMonth();
  const seasonal = SEASONAL_BY_MONTH[month] ?? [];
  const current = hashPick(CURRENT_EVENT_SEEDS, `current:${opts.topic ?? "all"}`, date);
  const longevity =
    opts.includeLongevity || opts.topic === "dlouhovekost"
      ? hashPick(LONGEVITY_SEEDS, `longevity:${opts.writerIndex ?? 0}`, date)
      : null;

  const extras = [...seasonal];
  if (current) extras.push(current);
  if (longevity) extras.push(longevity);

  if (!extras.length) return [...baseSeeds];

  const merged = [...baseSeeds];
  for (const extra of extras) {
    const dup = merged.some((s) => s.seed === extra.seed);
    if (!dup) merged.push(extra);
  }
  return merged;
}

/** Daily bonus seed for a topic — injected at front of rotation on cron day. */
export function pickDailyCalendarSeed(topic, writerIndex = 0, date = new Date()) {
  const monthPool = SEASONAL_BY_MONTH[date.getMonth()] ?? LONGEVITY_SEEDS;
  const pool = topic === "dlouhovekost" ? LONGEVITY_SEEDS : [...monthPool, ...CURRENT_EVENT_SEEDS];
  return hashPick(pool, `daily:${topic}:${writerIndex}`, date);
}

export function listCalendarSeedsForMonth(monthIndex, topic = null) {
  const seasonal = SEASONAL_BY_MONTH[monthIndex] ?? [];
  if (topic === "dlouhovekost") return [...LONGEVITY_SEEDS, ...seasonal.slice(0, 2)];
  return [...seasonal, ...CURRENT_EVENT_SEEDS.slice(0, 3)];
}
