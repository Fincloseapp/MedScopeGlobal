/** VIP Longevity Protocols — structured wellness content */

export type LongevityProtocol = {
  slug: string;
  number: number;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  summary: Record<string, string>;
  scientificBasis: Record<string, string>;
  dailyPlan: Record<string, string[]>;
  weeklyPlan: Record<string, string[]>;
  supplements: { name: string; dosage: string; note: Record<string, string> }[];
  labTests: { name: string; frequency: string; note: Record<string, string> }[];
  tools: { name: string; description: Record<string, string> }[];
  vipOnly: boolean;
};

export const LONGEVITY_PROTOCOLS: LongevityProtocol[] = [
  {
    slug: "optimalizace-spanku",
    number: 1,
    title: { cs: "Optimalizace spánku", en: "Sleep Optimization", "en-US": "Sleep Optimization Protocol" },
    subtitle: { cs: "Vědecky podložený protokol pro regeneraci", en: "Evidence-based recovery protocol", "en-US": "Science-backed recovery for peak performance" },
    summary: { cs: "Kompletní protokol pro zlepšení kvality spánku, HRV a regenerace.", en: "Complete protocol for sleep quality, HRV, and recovery.", "en-US": "Complete protocol to optimize sleep quality, HRV, and next-day performance." },
    scientificBasis: {
      cs: "Spánek je klíčovým pilířem longevity. Studie ukazují, že konzistentní spánkový režim (7–9 h) snižuje riziko kardiovaskulárních onemocnění o 20–30 % (Walker et al., 2020). HRV monitoring umožňuje personalizaci protokolu.",
      en: "Sleep is a cornerstone of longevity. Consistent 7–9 hours reduces cardiovascular risk by 20–30% (Walker et al., 2020). HRV monitoring enables protocol personalization.",
      "en-US": "Sleep is the #1 longevity lever. Consistent 7–9 hours cuts cardiovascular risk 20–30% (Walker et al., 2020). HRV-guided personalization maximizes recovery.",
    },
    dailyPlan: {
      cs: ["22:00 — vypnout modré světlo (filtry / brýle)", "22:30 — teplá sprcha nebo sauna", "23:00 — ležet v posteli, bez obrazovek", "07:00 — vystavení rannímu světlu 10–15 min"],
      en: ["22:00 — disable blue light (filters/glasses)", "22:30 — warm shower or sauna", "23:00 — in bed, no screens", "07:00 — morning light exposure 10–15 min"],
      "en-US": ["10 PM — blue light blockers on", "10:30 PM — warm shower or sauna session", "11 PM — in bed, phone in another room", "7 AM — get 10–15 min of morning sunlight"],
    },
    weeklyPlan: {
      cs: ["Pondělí–Pátek: konzistentní režim ±30 min", "Sobota: volnější režim (+1 h)", "Neděle: příprava na týden, analýza HRV dat"],
      en: ["Mon–Fri: consistent schedule ±30 min", "Sat: relaxed schedule (+1 h)", "Sun: week prep, HRV data review"],
      "en-US": ["Mon–Fri: strict schedule ±30 min", "Saturday: sleep in +1 hour max", "Sunday: review HRV trends, prep for the week"],
    },
    supplements: [
      { name: "Magnesium glycinát", dosage: "200–400 mg", note: { cs: "30 min před spaním", en: "30 min before bed", "en-US": "Take 30 min before bed" } },
      { name: "L-theanin", dosage: "100–200 mg", note: { cs: "Podpora relaxace", en: "Relaxation support", "en-US": "Calming without drowsiness" } },
    ],
    labTests: [
      { name: "Kortizol (ranní)", frequency: "1× ročně", note: { cs: "HPA osa", en: "HPA axis assessment", "en-US": "HPA axis check" } },
      { name: "HRV baseline", frequency: "Průběžně", note: { cs: "Wearable tracking", en: "Wearable tracking", "en-US": "Oura/Whoop recommended" } },
    ],
    tools: [
      { name: "MediFlow", description: { cs: "Sledování spánkového režimu a symptomů", en: "Track sleep schedule and symptoms", "en-US": "Track sleep schedule, symptoms, and supplements" } },
    ],
    vipOnly: true,
  },
  {
    slug: "metabolicke-zdravi",
    number: 2,
    title: { cs: "Metabolické zdraví", en: "Metabolic Health", "en-US": "Metabolic Health Protocol" },
    subtitle: { cs: "Glukózová variabilita a inzulínová senzitivita", en: "Glucose variability and insulin sensitivity", "en-US": "CGM-guided metabolic optimization" },
    summary: { cs: "Protokol pro optimalizaci metabolismu, glukózy a tělesného složení.", en: "Protocol for metabolism, glucose, and body composition optimization.", "en-US": "Protocol for metabolic flexibility, glucose control, and body recomposition." },
    scientificBasis: {
      cs: "Metabolická flexibilita je klíčovým prediktorem longevity. CGM studie (Hall et al., 2018) ukazují, že postprandiální glukóza pod 140 mg/dl snižuje oxidační stres.",
      en: "Metabolic flexibility is a key longevity predictor. CGM studies show postprandial glucose below 140 mg/dL reduces oxidative stress.",
      "en-US": "Metabolic flexibility predicts longevity. CGM data (Hall et al., 2018) shows keeping post-meal glucose under 140 mg/dL cuts oxidative stress significantly.",
    },
    dailyPlan: {
      cs: ["Ranní: 16h intermittent fasting okno", "Oběd: bílkoviny + vláknina jako první", "Večer: 30 min chůze po večeři", "Hydratace: 2–3 l vody"],
      en: ["Morning: 16h intermittent fasting window", "Lunch: protein + fiber first", "Evening: 30 min post-dinner walk", "Hydration: 2–3 L water"],
      "en-US": ["Morning: 16:8 fasting window", "Lunch: eat protein and fiber first", "Evening: 30-min walk after dinner", "Hydration: 80+ oz water daily"],
    },
    weeklyPlan: {
      cs: ["2× silový trénink", "2× zone 2 kardio (45 min)", "1× delší půst 18–20 h", "Týdenní review CGM dat"],
      en: ["2× strength training", "2× zone 2 cardio (45 min)", "1× extended fast 18–20 h", "Weekly CGM data review"],
      "en-US": ["2× strength sessions", "2× zone 2 cardio (45 min)", "1× 18–20h extended fast", "Weekly CGM trend review"],
    },
    supplements: [
      { name: "Berberin", dosage: "500 mg 2× denně", note: { cs: "S jídlem", en: "With meals", "en-US": "Take with meals" } },
      { name: "Omega-3", dosage: "2 g EPA+DHA", note: { cs: "S jídlem", en: "With meals", "en-US": "With fatty meal for absorption" } },
    ],
    labTests: [
      { name: "HbA1c", frequency: "2× ročně", note: { cs: "Dlouhodobá glukóza", en: "Long-term glucose", "en-US": "3-month glucose average" } },
      { name: "Inzulín nalačno", frequency: "1× ročně", note: { cs: "Inzulínová rezistence", en: "Insulin resistance", "en-US": "Insulin resistance marker" } },
    ],
    tools: [
      { name: "CGM senzor", description: { cs: "Continuous glucose monitoring", en: "Continuous glucose monitoring", "en-US": "Freestyle Libre or Dexcom" } },
    ],
    vipOnly: true,
  },
  {
    slug: "anti-aging-suplementy",
    number: 3,
    title: { cs: "Anti-aging suplementy", en: "Anti-Aging Supplements", "en-US": "Anti-Aging Supplement Stack" },
    subtitle: { cs: "Evidence-based doplňky stravy", en: "Evidence-based supplement protocol", "en-US": "Research-backed longevity stack" },
    summary: { cs: "Kurátorovaný seznam suplementů s vědeckým zdůvodněním a dávkováním.", en: "Curated supplement list with scientific rationale and dosing.", "en-US": "Curated, evidence-backed supplement stack with precise dosing." },
    scientificBasis: {
      cs: "Suplementace musí vycházet z laboratorních výsledků. NAD+ prekurzory (NMN/NR) a resveratrol mají promising data, ale individuální přístup je klíčový.",
      en: "Supplementation should be guided by lab results. NAD+ precursors and resveratrol show promising data, but individual approach is key.",
      "en-US": "Supplement stacks must be lab-guided. NAD+ precursors (NMN/NR) and resveratrol show promise in aging research, but personalization is essential.",
    },
    dailyPlan: {
      cs: ["Ráno: vitamín D3 + K2, omega-3", "Oběd: multivitamin, zinek", "Večer: magnesium, glycin"],
      en: ["Morning: vitamin D3 + K2, omega-3", "Lunch: multivitamin, zinc", "Evening: magnesium, glycine"],
      "en-US": ["AM: D3+K2, omega-3, NMN", "Noon: multivitamin, zinc", "PM: magnesium glycinate, glycine"],
    },
    weeklyPlan: {
      cs: ["Pondělí: review doplňků v MediFlow", "Středa: kontrola interakcí", "Pátek: objednání refill"],
      en: ["Monday: review supplements in MediFlow", "Wednesday: interaction check", "Friday: refill order"],
      "en-US": ["Monday: audit stack in MediFlow", "Wednesday: check drug interactions", "Friday: reorder supplies"],
    },
    supplements: [
      { name: "NMN", dosage: "250–500 mg", note: { cs: "NAD+ prekurzor", en: "NAD+ precursor", "en-US": "NAD+ booster — morning" } },
      { name: "Resveratrol", dosage: "500 mg", note: { cs: "S tuky", en: "With fats", "en-US": "Take with fatty meal" } },
      { name: "CoQ10 (ubichinol)", dosage: "100–200 mg", note: { cs: "Mitochondrie", en: "Mitochondrial support", "en-US": "Mitochondrial energy support" } },
    ],
    labTests: [
      { name: "Kompletní krevní obraz", frequency: "2× ročně", note: { cs: "Baseline", en: "Baseline", "en-US": "Baseline panel" } },
      { name: "Vitamín D", frequency: "2× ročně", note: { cs: "Cíl 40–60 ng/ml", en: "Target 40–60 ng/mL", "en-US": "Target 40–60 ng/mL" } },
    ],
    tools: [{ name: "MediFlow", description: { cs: "Sledování suplementů", en: "Supplement tracking", "en-US": "Track your full supplement stack" } }],
    vipOnly: true,
  },
  {
    slug: "biohacking-zacatecnici",
    number: 4,
    title: { cs: "Biohacking pro začátečníky", en: "Biohacking for Beginners", "en-US": "Biohacking 101" },
    subtitle: { cs: "Bezpečný vstup do světa optimalizace", en: "Safe entry into optimization", "en-US": "Safe, science-backed entry into biohacking" },
    summary: { cs: "Základní biohacking techniky bez rizika — od studené expozice po dechová cvičení.", en: "Foundational biohacking without risk — cold exposure to breathwork.", "en-US": "Foundational biohacks without the hype — cold exposure, breathwork, and more." },
    scientificBasis: { cs: "Postupná adaptace je klíčová. Studie Wim Hof metody ukazují modulaci imunitní odpovědi.", en: "Gradual adaptation is key. Wim Hof method studies show immune response modulation.", "en-US": "Gradual adaptation prevents injury. Wim Hof method research shows measurable immune modulation." },
    dailyPlan: { cs: ["Ráno: 3 min studená sprcha (postupně)", "Oběd: 5 min box breathing", "Večer: journaling 5 min"], en: ["Morning: 3 min cold shower (gradual)", "Lunch: 5 min box breathing", "Evening: 5 min journaling"], "en-US": ["AM: 3-min cold shower (build up)", "Noon: 5-min box breathing", "PM: 5-min gratitude journal"] },
    weeklyPlan: { cs: ["2× sauna (15 min)", "1× delší dechová session", "Review metrik v MediFlow"], en: ["2× sauna (15 min)", "1× extended breathwork", "Review metrics in MediFlow"], "en-US": ["2× sauna sessions (15 min)", "1× extended breathwork session", "Review all metrics in MediFlow"] },
    supplements: [{ name: "Elektrolyty", dosage: "Dle potřeby", note: { cs: "Po sauně/cvičení", en: "After sauna/exercise", "en-US": "After sauna or intense exercise" } }],
    labTests: [{ name: "CRP", frequency: "1× ročně", note: { cs: "Zánět", en: "Inflammation marker", "en-US": "Inflammation baseline" } }],
    tools: [{ name: "MediFlow", description: { cs: "Sledování biohacking metrik", en: "Track biohacking metrics", "en-US": "Log all your biohacking experiments" } }],
    vipOnly: false,
  },
  {
    slug: "mentalni-wellness",
    number: 5,
    title: { cs: "Mentální wellness", en: "Mental Wellness", "en-US": "Mental Wellness Protocol" },
    subtitle: { cs: "Stres, mindfulness a kognitivní zdraví", en: "Stress, mindfulness, and cognitive health", "en-US": "Stress management and cognitive optimization" },
    summary: { cs: "Protokol pro duševní zdraví, snížení stresu a kognitivní výkon.", en: "Protocol for mental health, stress reduction, and cognitive performance.", "en-US": "Protocol for mental resilience, stress reduction, and peak cognition." },
    scientificBasis: { cs: "Chronický stres urychluje telomerní zkracování. Mindfulness intervence snižují kortizol o 15–25 %.", en: "Chronic stress accelerates telomere shortening. Mindfulness reduces cortisol 15–25%.", "en-US": "Chronic stress accelerates aging via telomere shortening. Mindfulness cuts cortisol 15–25%." },
    dailyPlan: { cs: ["Ráno: 10 min meditace", "Oběd: 5 min dechové cvičení", "Večer: digitální detox 1 h před spaním"], en: ["Morning: 10 min meditation", "Lunch: 5 min breathing", "Evening: digital detox 1 h before bed"], "en-US": ["AM: 10-min guided meditation", "Noon: 5-min breathwork break", "PM: digital detox 1 hour before bed"] },
    weeklyPlan: { cs: ["3× meditace", "1× delší mindfulness session", "Týdenní mood review"], en: ["3× meditation", "1× extended mindfulness", "Weekly mood review"], "en-US": ["3× meditation sessions", "1× extended mindfulness practice", "Weekly mood and stress review"] },
    supplements: [{ name: "Ashwagandha", dosage: "300–600 mg", note: { cs: "Večer", en: "Evening", "en-US": "Evening — adaptogen" } }],
    labTests: [{ name: "Kortizol", frequency: "1× ročně", note: { cs: "Stresová osa", en: "Stress axis", "en-US": "HPA axis assessment" } }],
    tools: [{ name: "MediFlow", description: { cs: "Mood tracking", en: "Mood tracking", "en-US": "Daily mood and stress logging" } }],
    vipOnly: true,
  },
  {
    slug: "detox-regenerace",
    number: 6,
    title: { cs: "Detox a regenerace", en: "Detox & Regeneration", "en-US": "Detox & Regeneration Protocol" },
    subtitle: { cs: "Podpora přirozených detoxikačních procesů", en: "Supporting natural detoxification", "en-US": "Support your body's natural detox pathways" },
    summary: { cs: "Bezpečný protokol pro podporu jater, ledvin a lymfatického systému.", en: "Safe protocol for liver, kidney, and lymphatic support.", "en-US": "Safe protocol to support liver, kidney, and lymphatic function." },
    scientificBasis: { cs: "Tělo má vlastní detoxikační systémy. Protokol je zaměřen na jejich podporu, ne na extrémní detox diety.", en: "The body has its own detox systems. This protocol supports them, not extreme detox diets.", "en-US": "Your liver and kidneys handle detox naturally. This protocol supports those pathways — no extreme cleanses." },
    dailyPlan: { cs: ["2–3 l vody s citronem", "Zelenina v každém jídle", "Sauna 2× týdně"], en: ["2–3 L lemon water", "Greens with every meal", "Sauna 2× weekly"], "en-US": ["80+ oz water with lemon", "Greens with every meal", "Sauna 2× per week"] },
    weeklyPlan: { cs: ["1× delší půst 16–18 h", "2× sauna", "Týdenní hydratace review"], en: ["1× 16–18h fast", "2× sauna", "Weekly hydration review"], "en-US": ["1× 16–18h intermittent fast", "2× sauna sessions", "Weekly hydration audit"] },
    supplements: [{ name: "NAC", dosage: "600 mg", note: { cs: "Glutathion prekurzor", en: "Glutathione precursor", "en-US": "Glutathione precursor — liver support" } }],
    labTests: [{ name: "Jaterní testy (ALT, AST)", frequency: "1× ročně", note: { cs: "Jaterní funkce", en: "Liver function", "en-US": "Liver function panel" } }],
    tools: [{ name: "MediFlow", description: { cs: "Hydratace tracking", en: "Hydration tracking", "en-US": "Track hydration and symptoms" } }],
    vipOnly: true,
  },
  {
    slug: "imunitni-system",
    number: 7,
    title: { cs: "Imunitní systém", en: "Immune System", "en-US": "Immune System Protocol" },
    subtitle: { cs: "Posílení přirozené imunity", en: "Strengthening natural immunity", "en-US": "Strengthen your natural immune defenses" },
    summary: { cs: "Protokol pro posílení imunity bez přehnaných tvrzení.", en: "Protocol for immune support without exaggerated claims.", "en-US": "Evidence-based immune support without overpromising." },
    scientificBasis: { cs: "Imunitní systém reaguje na spánek, výživu a pohyb. Vitamín D deficiency souvisí se sníženou imunitní odpovědí.", en: "Immune system responds to sleep, nutrition, and exercise. Vitamin D deficiency correlates with reduced immune response.", "en-US": "Sleep, nutrition, and exercise drive immune function. Vitamin D deficiency is linked to weaker immune response." },
    dailyPlan: { cs: ["Vitamín D dle lab výsledků", "Zelenina 5+ porcí", "30 min pohyb"], en: ["Vitamin D per lab results", "5+ servings vegetables", "30 min movement"], "en-US": ["Vitamin D per lab results", "5+ servings of vegetables", "30 min daily movement"] },
    weeklyPlan: { cs: ["3× cvičení", "1× delší procházka v přírodě", "Review imunitních markerů"], en: ["3× exercise", "1× long nature walk", "Review immune markers"], "en-US": ["3× exercise sessions", "1× long nature walk", "Review immune markers quarterly"] },
    supplements: [{ name: "Vitamín D3", dosage: "2000–5000 IU", note: { cs: "Dle lab", en: "Per lab", "en-US": "Dose per lab results" } }, { name: "Zinek", dosage: "15–30 mg", note: { cs: "S jídlem", en: "With food", "en-US": "With food — don't exceed 40mg" } }],
    labTests: [{ name: "Vitamín D", frequency: "2× ročně", note: { cs: "Cíl 40–60 ng/ml", en: "Target 40–60 ng/mL", "en-US": "Target 40–60 ng/mL" } }],
    tools: [{ name: "MediFlow", description: { cs: "Symptom tracking", en: "Symptom tracking", "en-US": "Track symptoms and supplement intake" } }],
    vipOnly: true,
  },
  {
    slug: "stres-kortizol",
    number: 8,
    title: { cs: "Stres a kortizol", en: "Stress & Cortisol", "en-US": "Stress & Cortisol Management" },
    subtitle: { cs: "Regulace HPA osy", en: "HPA axis regulation", "en-US": "HPA axis regulation for longevity" },
    summary: { cs: "Protokol pro snížení chronického stresu a optimalizaci kortizolu.", en: "Protocol for reducing chronic stress and optimizing cortisol.", "en-US": "Protocol to reduce chronic stress and optimize cortisol rhythms." },
    scientificBasis: { cs: "Chronicky elevovaný kortizol urychluje stárnutí. HPA osa reaguje na spánek, pohyb a sociální vazby.", en: "Chronically elevated cortisol accelerates aging. HPA axis responds to sleep, exercise, and social bonds.", "en-US": "Chronically high cortisol accelerates aging. The HPA axis responds to sleep quality, exercise, and social connection." },
    dailyPlan: { cs: ["Ranní světlo 10 min", "2× dechové cvičení", "Večerní relaxační rituál"], en: ["Morning light 10 min", "2× breathing exercises", "Evening relaxation ritual"], "en-US": ["10 min morning sunlight", "2× breathing exercises", "Evening wind-down ritual"] },
    weeklyPlan: { cs: ["3× cvičení (ne večer)", "1× sociální aktivita", "Kortizol review"], en: ["3× exercise (not evening)", "1× social activity", "Cortisol review"], "en-US": ["3× exercise (avoid late evening)", "1× meaningful social connection", "Quarterly cortisol review"] },
    supplements: [{ name: "Phosphatidylserine", dosage: "100–300 mg", note: { cs: "Večer", en: "Evening", "en-US": "Evening — cortisol modulation" } }],
    labTests: [{ name: "Kortizol (4-bodový test)", frequency: "1× ročně", note: { cs: "Denní rytmus", en: "Daily rhythm", "en-US": "Diurnal cortisol pattern" } }],
    tools: [{ name: "MediFlow", description: { cs: "Stres tracking", en: "Stress tracking", "en-US": "Log stress levels and triggers" } }],
    vipOnly: true,
  },
  {
    slug: "srdecni-zdravi",
    number: 9,
    title: { cs: "Srdeční zdraví", en: "Heart Health", "en-US": "Heart Health Protocol" },
    subtitle: { cs: "Kardiovaskulární prevence", en: "Cardiovascular prevention", "en-US": "Cardiovascular prevention for longevity" },
    summary: { cs: "Protokol pro prevenci kardiovaskulárních onemocnění.", en: "Protocol for cardiovascular disease prevention.", "en-US": "Protocol for cardiovascular disease prevention and heart health optimization." },
    scientificBasis: { cs: "Kardiovaskulární onemocnění jsou #1 příčinou úmrtí. Zone 2 trénink a omega-3 mají silnou evidenci.", en: "Cardiovascular disease is the #1 cause of death. Zone 2 training and omega-3 have strong evidence.", "en-US": "Heart disease is the #1 killer globally. Zone 2 cardio and omega-3 supplementation have the strongest evidence base." },
    dailyPlan: { cs: ["30 min chůze", "Mediterranean-style strava", "Limit soli"], en: ["30 min walk", "Mediterranean-style diet", "Limit salt"], "en-US": ["30-min daily walk", "Mediterranean-style eating", "Limit sodium intake"] },
    weeklyPlan: { cs: ["3× zone 2 kardio (45 min)", "2× silový trénink", "Týdenní BP check"], en: ["3× zone 2 cardio (45 min)", "2× strength training", "Weekly BP check"], "en-US": ["3× zone 2 cardio (45 min)", "2× strength training", "Weekly blood pressure check"] },
    supplements: [{ name: "Omega-3", dosage: "2 g EPA+DHA", note: { cs: "S jídlem", en: "With meals", "en-US": "With fatty meal" } }],
    labTests: [{ name: "Lipidový panel", frequency: "1× ročně", note: { cs: "Cholesterol, triglyceridy", en: "Cholesterol, triglycerides", "en-US": "Full lipid panel" } }, { name: "ApoB", frequency: "1× ročně", note: { cs: "Kardiovaskulární riziko", en: "CV risk", "en-US": "Superior CV risk marker" } }],
    tools: [{ name: "MediFlow", description: { cs: "BP tracking", en: "BP tracking", "en-US": "Track blood pressure readings" } }],
    vipOnly: true,
  },
  {
    slug: "longevity-360",
    number: 10,
    title: { cs: "Protokol dlouhověkosti 360°", en: "Longevity 360° Protocol", "en-US": "Complete Longevity 360° Protocol" },
    subtitle: { cs: "Integrace všech pilířů longevity", en: "Integration of all longevity pillars", "en-US": "Integrating all longevity pillars into one system" },
    summary: { cs: "Kompletní protokol kombinující spánek, výživu, pohyb, suplementy a mentální zdraví.", en: "Complete protocol combining sleep, nutrition, exercise, supplements, and mental health.", "en-US": "The complete protocol integrating sleep, nutrition, exercise, supplements, and mental wellness." },
    scientificBasis: { cs: "Longevity vyžaduje holistický přístup. Blue Zones research ukazuje, že kombinace faktorů má synergický efekt.", en: "Longevity requires a holistic approach. Blue Zones research shows combined factors have synergistic effects.", "en-US": "Longevity requires a systems approach. Blue Zones research proves that combined lifestyle factors create synergistic effects." },
    dailyPlan: { cs: ["Protokol 1 (spánek) + Protokol 2 (metabolismus) + Protokol 5 (wellness)", "MediFlow daily check-in", "HRV review"], en: ["Protocol 1 (sleep) + Protocol 2 (metabolism) + Protocol 5 (wellness)", "MediFlow daily check-in", "HRV review"], "en-US": ["Sleep + Metabolic + Mental wellness protocols", "MediFlow daily check-in", "Review HRV and key metrics"] },
    weeklyPlan: { cs: ["Rotace všech 9 protokolů", "Týdenní lab review", "Měsíční progress report"], en: ["Rotate all 9 protocols", "Weekly lab review", "Monthly progress report"], "en-US": ["Rotate through all 9 sub-protocols", "Weekly lab marker review", "Monthly progress report with PDF export"] },
    supplements: [{ name: "Personalizovaný stack", dosage: "Dle lab", note: { cs: "VIP konzultace", en: "VIP consultation", "en-US": "Personalized via VIP consultation" } }],
    labTests: [{ name: "Kompletní longevity panel", frequency: "2× ročně", note: { cs: "VIP balíček", en: "VIP package", "en-US": "Full VIP longevity panel" } }],
    tools: [{ name: "MediFlow", description: { cs: "Kompletní wellness dashboard", en: "Complete wellness dashboard", "en-US": "Your complete wellness command center" } }],
    vipOnly: true,
  },
];

export function getProtocol(slug: string): LongevityProtocol | undefined {
  return LONGEVITY_PROTOCOLS.find((p) => p.slug === slug);
}

export function localizedText(
  record: Record<string, string>,
  locale: string
): string {
  return record[locale] ?? record["en"] ?? record["cs"] ?? Object.values(record)[0] ?? "";
}
