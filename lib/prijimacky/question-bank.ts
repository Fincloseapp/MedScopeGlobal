/** Curated Q&A bank for LF entrance prep — biology, chemistry, physics.
 *  Used to generate self-tests and mixed quizzes for gymnázium seniors.
 */

import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

export type BankDifficulty = "zaklad" | "stredni" | "narocne";

export type BankQuestion = {
  id: string;
  subject: PrepSubject;
  topic: string;
  difficulty: BankDifficulty;
  question: string;
  options: string[];
  /** 0-based index of correct option */
  correctIndex: number;
  explanation: string;
};

const Q = (
  id: string,
  subject: PrepSubject,
  topic: string,
  difficulty: BankDifficulty,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string
): BankQuestion => ({ id, subject, topic, difficulty, question, options, correctIndex, explanation });

export const PRIJIMACKY_QUESTION_BANK: BankQuestion[] = [
  // —— Biologie ——
  Q("bio-01", "biologie", "Buňka", "zaklad", "Která organela je hlavní místem aerobní produkce ATP v eukaryotické buňce?", ["Ribozom", "Mitochondrie", "Golgiho aparát", "Lysozom"], 1, "Mitochondrie oxidativní fosforylací produkují většinu ATP."),
  Q("bio-02", "biologie", "Genetika", "zaklad", "Kolik chromozomů má normální lidská somatická buňka?", ["23", "46", "22", "92"], 1, "Diploidní sada: 23 párů = 46 chromozomů."),
  Q("bio-03", "biologie", "Genetika", "stredni", "Co popisuje Mendelův zákon segregace?", ["Nezávislé třídění genů na různých chromozomech", "Oddělení alel téhož genu do různých gamet", "Crossing-over v meióze", "Epistatické interakce genů"], 1, "Alely jednoho genu se při tvorbě gamet oddělují."),
  Q("bio-04", "biologie", "Fyziologie", "zaklad", "Který hormon snižuje hladinu glukózy v krvi?", ["Glukagon", "Adrenalin", "Inzulin", "Kortizol"], 2, "Inzulin podporuje vychytávání glukózy do buněk."),
  Q("bio-05", "biologie", "Buňka", "stredni", "Kde probíhá translace u eukaryot?", ["V jádře", "Na ribozomech v cytoplazmě / ER", "V Golgiho aparátu", "V peroxizomech"], 1, "mRNA se překládá na ribozomech."),
  Q("bio-06", "biologie", "Ekologie", "zaklad", "Co je producenty v potravním řetězci?", ["Býložravci", "Masožravci", "Autotrofní organismy", "Rozkladači"], 2, "Producenti (rostliny, řasy) tvoří organickou hmotu fotosyntézou."),
  Q("bio-07", "biologie", "Anatomie", "stredni", "Která chlopeň odděluje levou síň a levou komoru srdce?", ["Trojcípá", "Mitralní (dvojcípá)", "Poloměsíčitá aortální", "Poloměsíčitá pulmonální"], 1, "Mezi LS a LK je mitralní chlopeň."),
  Q("bio-08", "biologie", "Mikrobiologie", "zaklad", "Bakterie se od eukaryot liší zejména absencí:", ["Cytoplazmatické membrány", "Pravého jádra ohraničeného membránou", "Ribozomů", "DNA"], 1, "Prokaryota nemají pravé jádro."),
  Q("bio-09", "biologie", "Genetika", "narocne", "Crossing-over typicky probíhá v:", ["Profázi I meiózy", "Mitóze anafázi", "S fázi interfáze", "Telofázi II"], 0, "Homologní chromozomy vyměňují úseky v profázi I."),
  Q("bio-10", "biologie", "Fyziologie", "stredni", "Hlavní dusíkatý odpadní produkt metabolismu bílkovin u člověka je:", ["Amoniak volně v krvi", "Močovina", "Kyselina močová jako jediný produkt", "Kreatinin jako hlavní produkt"], 1, "Játra tvoří močovinu (urea cycle)."),
  Q("bio-11", "biologie", "Buňka", "zaklad", "Fotosyntéza u rostlin probíhá především v:", ["Mitochondriích", "Chloroplastech", "Vakuolách", "Jádře"], 1, "Chloroplasty obsahují thylakoidy s chlorofylem."),
  Q("bio-12", "biologie", "Imunita", "stredni", "Protilátky produkují především:", ["T-lymfocyty cytotoxické", "B-lymfocyty (plazmatické buňky)", "Makrofágy", "Neutrofily"], 1, "Plazmatické buňky z B-lymfocytů secernují imunoglobuliny."),

  // —— Chemie ——
  Q("chem-01", "chemie", "Obecná", "zaklad", "Protonové číslo Z udává:", ["Počet neutronů", "Počet protonů v jádře", "Hmotnost atomu v u", "Počet elektronů ve valenční sféře vždy"], 1, "Z = počet protonů; u neutrálního atomu i elektronů."),
  Q("chem-02", "chemie", "Roztoky", "zaklad", "pH = 3 znamená oproti pH = 5:", ["100× kyslejší (vyšší [H+])", "2× kyslejší", "100× zásaditější", "Stejnou [H+]"], 0, "Rozdíl 2 jednotek pH = 100× změna [H+]."),
  Q("chem-03", "chemie", "Organická", "zaklad", "Funkční skupina alkoholů je:", ["–COOH", "–OH", "–CHO", "–NH2"], 1, "Alkoholy obsahují hydroxyl –OH."),
  Q("chem-04", "chemie", "Stechiometrie", "stredni", "Molární koncentrace c = n/V. Jednotka je typicky:", ["mol·kg−1", "mol·dm−3", "g·mol−1", "Pa"], 1, "Látková koncentrace v mol/dm³ (M)."),
  Q("chem-05", "chemie", "Redox", "stredni", "Oxidace znamená:", ["Příjem elektronů", "Ztrátu elektronů", "Snížení oxidačního čísla", "Vznik sraženiny"], 1, "Oxidace = ztráta e− (zvýšení ox. čísla)."),
  Q("chem-06", "chemie", "Organická", "stredni", "Aminokyseliny obsahují skupiny:", ["Jen –OH", "–NH2 a –COOH", "Jen –CHO", "Jen –SH"], 1, "α-aminokyseliny mají amino i karboxyl."),
  Q("chem-07", "chemie", "Plyny", "zaklad", "Za standardních podmínek 1 mol ideálního plynu zaujímá cca:", ["1 dm³", "22,4 dm³", "100 dm³", "0,082 dm³"], 1, "Molární objem ≈ 22,4 dm³·mol−1."),
  Q("chem-08", "chemie", "Rovnováha", "narocne", "Le Chatelierův princip říká, že systém:", ["Ignoruje vnější zásahy", "Se snaží zmírnit účinek vnějšího zásahu", "Vždy zrychlí reakci", "Zvyšuje entropii na maximum okamžitě"], 1, "Rovnováha se posune tak, aby zmírnila změnu."),
  Q("chem-09", "chemie", "Organická", "zaklad", "Benzén má typické:", ["Alkynové trojné vazby", "Aromatický systém 6 π elektronů", "Jen jednoduché vazby C–C", "Peptidové vazby"], 1, "Aromaticita (Hückel 4n+2)."),
  Q("chem-10", "chemie", "Kyseliny", "stredni", "Silná kyselina ve vodě:", ["Disociuje téměř úplně", "Nedisociuje", "Je nerozpustná", "Má vždy pH > 7"], 0, "Silné kyseliny jsou prakticky plně disociované."),
  Q("chem-11", "chemie", "Biochemie", "stredni", "Peptidová vazba vzniká mezi:", ["Dvěma –OH skupinami", "–COOH a –NH2", "Dvěma fosfáty", "Cukrem a bází DNA jen"], 1, "Kondenzace karboxylu a amino skupiny."),
  Q("chem-12", "chemie", "Obecná", "zaklad", "Izotopy téhož prvku mají stejný počet:", ["Neutronů", "Protonů", "Nukleoidů", "Neutrin"], 1, "Stejné Z, různé N."),

  // —— Fyzika ——
  Q("fyz-01", "fyzika", "Mechanika", "zaklad", "Jednotka síly v SI je:", ["Joule", "Newton", "Watt", "Pascal"], 1, "1 N = 1 kg·m·s−2."),
  Q("fyz-02", "fyzika", "Mechanika", "zaklad", "Práce W při konstantní síle ve směru posunutí je:", ["F / s", "F · s", "F · t", "m · a"], 1, "W = F·s (při rovnoběžnosti)."),
  Q("fyz-03", "fyzika", "Elektřina", "zaklad", "Ohmův zákon: U =", ["R / I", "I · R", "I / R", "Q · R"], 1, "Napětí = proud × odpor."),
  Q("fyz-04", "fyzika", "Optika", "stredni", "Index lomu n =", ["c / v", "v / c", "λ · f", "E / h"], 0, "n = rychlost světla ve vakuu / v prostředí."),
  Q("fyz-05", "fyzika", "Termika", "zaklad", "Teplo potřebné k ohřátí tělesa je Q =", ["m · c · Δt", "m · g · h", "1/2 m v²", "p · V"], 0, "Q = m·c·Δt (měrná tepelná kapacita)."),
  Q("fyz-06", "fyzika", "Mechanika", "stredni", "Hybnost p =", ["m / v", "m · v", "F · t jen vždy", "m · a · s"], 1, "p = m·v."),
  Q("fyz-07", "fyzika", "Vlny", "stredni", "Vztah pro vlnění v =", ["λ / T", "λ · f", "f / λ", "T · f"], 1, "v = λ·f (f = 1/T)."),
  Q("fyz-08", "fyzika", "Elektřina", "stredni", "Výkon stejnosměrného proudu P =", ["U / I", "U · I", "R · I", "Q / t"], 1, "P = U·I (= R·I²)."),
  Q("fyz-09", "fyzika", "Mechanika", "narocne", "Centripetální zrychlení má velikost:", ["v² / r", "v / r", "ω / r", "v · r"], 0, "a = v²/r = ω²·r."),
  Q("fyz-10", "fyzika", "Radioaktivita", "zaklad", "Poločas rozpadu je doba, za kterou:", ["Zmizí všechny jádra", "Se rozpadne polovina jader", "Vzroste aktivita na dvojnásobek", "Nastane řetězová reakce"], 1, "T½: N → N/2."),
  Q("fyz-11", "fyzika", "Optika", "zaklad", "Konkávní (dutá) kulová zrcadla mohou vytvářet:", ["Jen zmenšené virtuální obrazy", "Skutečné i neskutečné obrazy dle polohy předmětu", "Jen barvy spektra", "Jen difrakci"], 1, "Podle vzdálenosti předmětu různé typy obrazů."),
  Q("fyz-12", "fyzika", "Mechanika", "zaklad", "Tlak p v kapalině v hloubce h (hydrostatický) je:", ["ρ · g · h", "m · g · h", "F / ρ", "ρ / h"], 0, "p = ρgh."),
];

export function listBankSubjects(): PrepSubject[] {
  return ["biologie", "chemie", "fyzika"];
}

export function filterBankQuestions(opts: {
  subjects?: PrepSubject[];
  difficulty?: BankDifficulty | "all";
  limit?: number;
  seed?: string;
}): BankQuestion[] {
  let pool = PRIJIMACKY_QUESTION_BANK.slice();
  if (opts.subjects?.length) {
    const set = new Set(opts.subjects);
    pool = pool.filter((q) => set.has(q.subject));
  }
  if (opts.difficulty && opts.difficulty !== "all") {
    pool = pool.filter((q) => q.difficulty === opts.difficulty);
  }
  const seed = opts.seed ?? String(Date.now());
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const limit = opts.limit ?? pool.length;
  return pool.slice(0, Math.min(limit, pool.length));
}

export function bankStats() {
  const bySubject: Record<string, number> = {};
  for (const q of PRIJIMACKY_QUESTION_BANK) {
    bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1;
  }
  return { total: PRIJIMACKY_QUESTION_BANK.length, bySubject };
}
