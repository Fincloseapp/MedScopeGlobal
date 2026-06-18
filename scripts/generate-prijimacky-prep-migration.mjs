#!/usr/bin/env node
/**
 * Generates supabase/migrations/20260618180000_academy_prijimacky_prep_courses.sql
 */
import fs from "node:fs";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const outPath = projectPath("supabase/migrations/20260618180000_academy_prijimacky_prep_courses.sql");

const THUMBS = [
  "https://images.unsplash.com/photo-1532094349884-54311bbfaa67?w=640&q=80",
  "https://images.unsplash.com/photo-1532187863486-abf9db1a16a1?w=640&q=80",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80",
  "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=640&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&q=80",
  "https://images.unsplash.com/photo-1509228468518-180dd4866904?w=640&q=80",
  "https://images.unsplash.com/photo-1456513087680-859a078765a7?w=640&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=640&q=80",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23be8?w=640&q=80",
];

const courses = [
  {
    slug: "biologie-prijimacky-bunka-genetika",
    title: "Biologie pro přijímačky — buňka a genetika",
    description:
      "Komplexní příprava na biologickou část přijímacích zkoušek LF: stavba buňky, dělení, genetika a Mendelovy zákony v kontextu Cermat sylabů.",
    summary: "Buňka, membrány, organely, DNA, RNA a dědičnost — základ pro úspěch u přijímaček.",
    duration: 90,
    xp: 120,
    lessons: [
      {
        slug: "bunka-struktura",
        title: "Stavba prokaryotické a eukaryotické buňky",
        content: `## A) Prokaryotická buňka
Prokaryoti (bakterie, archea) nemají jádro. DNA je v nukleoidu, ribozomy 70S, stěna z peptidoglykanu.

## B) Eukaryotická buňka
Eukaryoti mají jádro obalené jadernou obalou, mitochondrie (ATP), ER, Golgi, lyzozomy (u živočichů).

## C) Membrána a transport
Fosfolipidová dvojvrstva, difúze, osmóza, aktivní transport, endocytóza/exocytóza.

## D) Typické úlohy u přijímaček
Rozlišení organel podle funkce, směr toku bílkovin ER→Golgi, vliv koncentrace na osmózu.`,
        minutes: 25,
      },
      {
        slug: "bunkove-deleni",
        title: "Buněčné dělení — mitóza a meióza",
        content: `## A) Mitóza
Zachovává počet chromozomů (2n→2n). Fáze: profáze, metafáze, anafáze, telofáze. Výsledek: dvě identické dcery.

## B) Meióza
Snižuje počet chromozomů (2n→n). Meióza I (křížení) a II. Vytváří 4 haploidní gamety.

## C) Srovnání
Mitóza = růst, oprava; meióza = pohlavní rozmnožování, variabilita.

## D) Cermat tip
Znalost pořadí fází a změn počtu chromozomů v jednotlivých fázích.`,
        minutes: 30,
      },
      {
        slug: "genetika-mendel",
        title: "Genetika — Mendelovy zákony a křížení",
        content: `## A) Základní pojmy
Gen, alela, genotyp, fenotyp, homozygota, heterozygota, dominantní/recesivní alela.

## B) První Mendelův zákon
Uniformita potomstva F1 při křížení homozygot.

## C) Druhý Mendelův zákon
Nezávislé dědičnostní dělení — Punnettův čtverec pro dvojnásobné křížení.

## D) Praktická cvičení
Křížení Aa × Aa → poměr 3:1. Krevní skupiny AB0 jako příklad kodominance.`,
        minutes: 35,
      },
    ],
    quizTitle: "Kvíz: Biologie — buňka a genetika",
    questions: [
      {
        q: "Která organela je hlavním místem produkce ATP v eukaryotické buňce?",
        opts: ["Lyzozom", "Mitochondrie", "Ribozom", "Centriola"],
        ans: "Mitochondrie",
        exp: "Mitochondrie jsou centra buněčného dýchání a produkce ATP.",
      },
      {
        q: "Kolik haploidních buněk vznikne jednou meiózou u člověka?",
        opts: ["2", "3", "4", "8"],
        ans: "4",
        exp: "Meióza I a II dávají čtyři haploidní gamety.",
      },
      {
        q: "Jaký genotyp má homozygotní recesivní jedinec pro alelu A/a?",
        opts: ["AA", "Aa", "aa", "AB"],
        ans: "aa",
        exp: "Homozygota recesivní = obě alely stejné recesivní.",
      },
      {
        q: "Přes kterou strukturu prochází selektivní transport iontů?",
        opts: ["Stěna", "Plazmatická membrána", "Nukleoid", "Vakuola"],
        ans: "Plazmatická membrána",
        exp: "Membrána reguluje vstup a výstup látek.",
      },
      {
        q: "V jaké fázi mitózy dochází k rozdělení sesterských chromatid?",
        opts: ["Profáze", "Metafáze", "Anafáze", "Interfáze"],
        ans: "Anafáze",
        exp: "Anafáze = tažení chromatid k pólym.",
      },
    ],
  },
  {
    slug: "chemie-prijimacky-organicka",
    title: "Chemie pro přijímačky — organická chemie základy",
    description:
      "Uhlíkaté sloučeniny, vazby, homologické řady a reakce požadované u přijímaček na LF — s důrazem na Cermat styl.",
    summary: "Alkany, alkeny, alkoholy, kyseliny — nomenklatura a reakce.",
    duration: 85,
    xp: 115,
    lessons: [
      {
        slug: "uhlikove-vazby",
        title: "Vazby uhlíku a hybridizace",
        content: `## A) Hybridizace
sp³ (tetrický), sp² (trojúhelníkový), sp (lineární).

## B) Typy vazeb
Jednoduchá, dvojná, trojná. Sigma a pi vazby.

## C) Strukturní vzorce
Zkrácené vzorce, izomérie sestavy a polohy.

## D) Přijímačkový tip
Rozpoznat sp² u alkenů a aromatických sloučenin.`,
        minutes: 28,
      },
      {
        slug: "homologicke-rady",
        title: "Homologické řady — alkany a alkeny",
        content: `## A) Alkany CₙH₂ₙ₊₂
Nasycené uhlovodíky, substituční reakce (halogenace).

## B) Alkeny CₙH₂ₙ
Nenasycené, dvojná vazba, adice (H₂, Br₂, H₂O/H⁺).

## C) Nomenklatura
IUPAC: nejdelší řetězec, číslování, substituenty.

## D) Markovnikovo pravidlo
Adice HX k asymetrickému alkenu.`,
        minutes: 30,
      },
      {
        slug: "alkoholy-kyseliny",
        title: "Alkoholy, aldehydy a karboxylové kyseliny",
        content: `## A) Alkoholy R–OH
Primární, sekundární, terciární. Oxidace na aldehyd/keton/kyselinu.

## B) Aldehydy a ketony
Karbonyl C=O. Tollensův/test Fehlingova roztoku u aldehydů.

## C) Karboxylové kyseliny
Kyselost, esterifikace s alkoholem.

## D) Praktické úlohy
Určení produktů oxidace ethanolu.`,
        minutes: 27,
      },
    ],
    quizTitle: "Kvíz: Organická chemie",
    questions: [
      {
        q: "Jaký vzorec má obecný alkane?",
        opts: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"],
        ans: "CₙH₂ₙ₊₂",
        exp: "Alkany jsou nasycené: CₙH₂ₙ₊₂.",
      },
      {
        q: "Jaký typ reakce typicky probíhá u alkenů?",
        opts: ["Adice", "Eliminace", "Substituce", "Polymerace pouze"],
        ans: "Adice",
        exp: "Nenasycená vazba se otevírá adicí.",
      },
      {
        q: "Hybridizace uhlíku v etenu (C₂H₄)?",
        opts: ["sp³", "sp²", "sp", "dsp²"],
        ans: "sp²",
        exp: "Dvojná vazba = sp² u obou uhlíků.",
      },
      {
        q: "Produkt úplné oxidace primárního alkoholu?",
        opts: ["Keton", "Aldehyd", "Karboxylová kyselina", "Ether"],
        ans: "Karboxylová kyselina",
        exp: "Primární alkohol → aldehyd → kyselina.",
      },
      {
        q: "Co identifikuje aldehydy?",
        opts: ["Biuretův test", "Tollensův test", "Iodoformový test", "Xanthoproteinový test"],
        ans: "Tollensův test",
        exp: "Tollens = stříbrné zrcadlo u aldehydů.",
      },
    ],
  },
  {
    slug: "fyzika-prijimacky-mechanika-elektrina",
    title: "Fyzika pro přijímačky — mechanika a elektřina",
    description:
      "Kinematika, dynamika, práce, energie a základy elektřiny pro přijímačky na medicínu.",
    summary: "Newtonovy zákony, energie, obvod s R, C — Cermat úroveň.",
    duration: 95,
    xp: 125,
    lessons: [
      {
        slug: "kinematika",
        title: "Kinematika rovnoměrného a rovnoměrně zrychleného pohybu",
        content: `## A) Rovnoměrný pohyb
s = v·t, graf s–t je přímka.

## B) Rovnoměrně zrychlený pohyb
v = v₀ + at, s = v₀t + ½at², v² = v₀² + 2as.

## C) Volný pád
a ≈ g = 9,81 m·s⁻² (bez odporu vzduchu).

## D) Úlohy
Výpočet dráhy, času, rychlosti z grafů.`,
        minutes: 32,
      },
      {
        slug: "dynamika",
        title: "Dynamika — síly a Newtonovy zákony",
        content: `## A) 1. Newtonův zákon
Setrvačnost — těleso setrvává v klidu/RV pohybu.

## B) 2. Newtonův zákon
F = m·a, výslednice sil určuje zrychlení.

## C) 3. Newtonův zákon
Akce = reakce, opačný směr.

## D) Tření, gravitace
F_g = m·g, třecí síla F_t = μ·F_N.`,
        minutes: 30,
      },
      {
        slug: "elektrina-zaklady",
        title: "Elektřina — proud, odpor, Ohmův zákon",
        content: `## A) Základní veličiny
I (A), U (V), R (Ω), Q (C).

## B) Ohmův zákon
U = R·I pro lineární obvod.

## C) Sériové a paralelní zapojení
R_s = R₁+R₂; 1/R_p = 1/R₁+1/R₂.

## D) Výkon
P = U·I = I²R = U²/R.`,
        minutes: 33,
      },
    ],
    quizTitle: "Kvíz: Fyzika — mechanika a elektřina",
    questions: [
      {
        q: "Jednotka síly v SI?",
        opts: ["Joule", "Newton", "Watt", "Pascal"],
        ans: "Newton",
        exp: "1 N = 1 kg·m·s⁻².",
      },
      {
        q: "Těleso padá volným pádem 2 s. Kolik urazí (g=10 m/s²)?",
        opts: ["10 m", "20 m", "40 m", "5 m"],
        ans: "20 m",
        exp: "s = ½gt² = ½·10·4 = 20 m.",
      },
      {
        q: "Ohmův zákon?",
        opts: ["U = R/I", "I = U/R", "R = U·I", "P = U/R"],
        ans: "I = U/R",
        exp: "U = R·I → I = U/R.",
      },
      {
        q: "Součet odporů v sérii 2 Ω a 3 Ω?",
        opts: ["1,2 Ω", "5 Ω", "6 Ω", "1 Ω"],
        ans: "5 Ω",
        exp: "Série: R = R₁ + R₂.",
      },
      {
        q: "2. Newtonův zákon?",
        opts: ["F = m/a", "F = m·a", "F = m·g", "F = 0"],
        ans: "F = m·a",
        exp: "Zrychlení úměrné výsledné síle.",
      },
    ],
  },
  {
    slug: "anatomie-zaklady-uchazece",
    title: "Anatomie základy pro uchazeče",
    description: "Orientace v lidském těle, systémy orgánů a základní latinská nomenklatura pro budoucí mediky.",
    summary: "Systémy těla, orientace, kostra a svaly — první krok k LF.",
    duration: 75,
    xp: 100,
    lessons: [
      {
        slug: "orientace-v-tele",
        title: "Anatomické polohy a roviny",
        content: `## A) Polohové termíny
Superior/inferior, anterior/posterior, medial/lateral, proximal/distal.

## B) Roviny
Sagitální, frontální (koronální), transverzální (horizontální).

## C) Anatomická poloha
Stoj vzpřímeně, dlaně dopředu.

## D) Příklady
Distální = dále od trupu u končetiny.`,
        minutes: 22,
      },
      {
        slug: "kostra-prehled",
        title: "Kostra — přehled pro uchazeče",
        content: `## A) Axialní kostra
Lebka, páteř (7 C, 12 Th, 5 L, sakrum, koccys), hrudní koš.

## B) Appendikulární
Pánevní pletenec, končetiny — huměrus, tibia, femur.

## C) Typy kostí
Dlouhé, krátké, ploché, nepravidelné.

## D) Klouby
Synoviální, chrupavkové spoje, fúze.`,
        minutes: 28,
      },
      {
        slug: "svaly-organy",
        title: "Svalstvo a hlavní orgánové systémy",
        content: `## A) Svaly
Příčně pruhované (kosterní), hladké, srdeční.

## B) Orgánové systémy
Oběhový, dýchací, trávicí, vylučovací, nervový, endokrinní.

## C) Homeostáza
Udržování vnitřní rovnováhy.

## D) Propojení
Každý systém spolupracuje — např. kyslík: dýchání → krev → tkáně.`,
        minutes: 25,
      },
    ],
    quizTitle: "Kvíz: Anatomie základy",
    questions: [
      {
        q: "Co znamená termín 'distální'?",
        opts: ["Blíže k hlavě", "Dále od úseku připojení ke trupu", "Směrem k břiše", "Uprostřed"],
        ans: "Dále od úseku připojení ke trupu",
        exp: "Distální = vzdálenější od proximalis.",
      },
      {
        q: "Kolik párů žeber má dospělý?",
        opts: ["10", "11", "12", "14"],
        ans: "12",
        exp: "Typicky 12 párů žeber.",
      },
      {
        q: "Který sval pumpuje krev?",
        opts: ["Diafragma", "Srdeční sval", "Biceps", "Quadriceps"],
        ans: "Srdeční sval",
        exp: "Myocardium = srdeční sval.",
      },
      {
        q: "Frontální rovina dělí tělo na?",
        opts: ["Levá/pravá", "Horní/dolní", "Přední/zadní", "Vnitřní/vnější"],
        ans: "Přední/zadní",
        exp: "Frontální = koronální rovina.",
      },
      {
        q: "Která kost je nejdelší v těle?",
        opts: ["Humerus", "Tibia", "Femur", "Radius"],
        ans: "Femur",
        exp: "Stehenní kost (femur) je nejdelší.",
      },
    ],
  },
  {
    slug: "fyziologie-zaklady-uchazece",
    title: "Fyziologie základy pro uchazeče",
    description: "Jak orgány fungují — krevní oběh, dýchání, nervová soustava — pro uchazeče o studium medicíny.",
    summary: "Funkce systémů těla na úrovni přijímačkové biologie+.",
    duration: 80,
    xp: 110,
    lessons: [
      {
        slug: "krevni-obeh",
        title: "Krevní oběh a srdeční cyklus",
        content: `## A) Malý a velký oběh
Plicní vs systemický okruh.

## B) Srdeční cyklus
Systola/diastola, objemové věty.

## C) Tlak krve
Systolický/diastolický, regulace.

## D) Transport
O₂, CO₂, živiny, hormony.`,
        minutes: 28,
      },
      {
        slug: "dychani",
        title: "Dýchání a výměna plynů",
        content: `## A) Mechanika dýchání
Inspirace: bránice dolů, objem hrudníku ↑.

## B) Alveolární difúze
O₂ do krve, CO₂ ven — podle parciálních tlaků.

## C) Hemoglobin
Vazba O₂, křivka disociace.

## D) Regulace
Chemoreceptory, CO₂/H⁺.`,
        minutes: 26,
      },
      {
        slug: "nervova-soustava",
        title: "Nervová soustava — základy",
        content: `## A) Neuron
Dendrit, axon, synapse, neurotransmiter.

## B) CNS a PNS
Mozek, mích, somatický vs autonomní.

## C) Reflex
Reflexní oblouk — senzor, interneuron, efektor.

## D) Homeostáza
Hypothalamus, zpětnovazební smyčky.`,
        minutes: 26,
      },
    ],
    quizTitle: "Kvíz: Fyziologie základy",
    questions: [
      {
        q: "Kde probíhá výměna O₂/CO₂?",
        opts: ["Bronch", "Alveoly", "Hrtan", "Průdušnice"],
        ans: "Alveoly",
        exp: "Alveoly = místo difúze plynů.",
      },
      {
        q: "Která komora srdeční pumpuje krev do těla?",
        opts: ["Pravá síň", "Levá komora", "Pravá komora", "Levá síň"],
        ans: "Levá komora",
        exp: "Levá komora → aorta → systém.",
      },
      {
        q: "Co přenáší neurotransmiter?",
        opts: ["Signál přes synapsi", "O₂ v krvi", "Glukózu", "Protony"],
        ans: "Signál přes synapsi",
        exp: "Synaptický přenos signálu.",
      },
      {
        q: "Inspirace primárně zvyšuje objem hrudníku díky?",
        opts: ["Bránici", "Srdci", "Jaterům", "Slezině"],
        ans: "Bránici",
        exp: "Bránice = hlavní inspirační sval.",
      },
      {
        q: "Malý krevní oběh spojuje?",
        opts: ["Srdce–plíce", "Srdce–ledviny", "Srdce–sval", "Játra–střevo"],
        ans: "Srdce–plíce",
        exp: "Plicní cirkulace.",
      },
    ],
  },
  {
    slug: "testove-strategie-time-management",
    title: "Testové strategie a time management",
    description: "Jak efektivně řešit test u přijímaček LF: eliminace, čas, stres a opakování chyb.",
    summary: "Praktické techniky pro Cermat testy a multioborové přijímačky.",
    duration: 60,
    xp: 80,
    lessons: [
      {
        slug: "cermat-format",
        title: "Formát Cermat testů a typy otázek",
        content: `## A) Struktura testu
Počet otázek, čas, kategorie (bio/chem/fyz).

## B) Typy
Výběr A–D, více správných, doplňování.

## C) Bodování
Správná odpověď vs chyba — strategie tipování.

## D) Příprava
Modelové testy v reálném čase.`,
        minutes: 20,
      },
      {
        slug: "time-management",
        title: "Time management během testu",
        content: `## A) Rozdělení času
Průměr min/otázka, rezerva na kontrolu.

## B) Pořadí řešení
Nejdřív jisté, pak těžké.

## C) Značení
Neztrácet čas u jedné otázky.

## D) Kontrola
Přečíst zadání podruhé u váhavých.`,
        minutes: 20,
      },
      {
        slug: "psychologie-stresu",
        title: "Psychologie stresu a soustředění",
        content: `## A) Pre-test rituál
Spánek, strava, příchod včas.

## B) Dechové techniky
4-7-8, krátká pauza.

## C) Growth mindset
Chyba = data pro učení.

## D) Po testu
Analýza špatných odpovědí.`,
        minutes: 20,
      },
    ],
    quizTitle: "Kvíz: Testové strategie",
    questions: [
      {
        q: "Co dělat jako první u těžké otázky?",
        opts: ["Okamžitě tipovat", "Přeskočit a vrátit se", "Opustit test", "Smaž odpověď"],
        ans: "Přeskočit a vrátit se",
        exp: "Neztrácet čas — řešit jisté nejdřív.",
      },
      {
        q: "Proč dělat modelové testy v časovém limitu?",
        opts: ["Zvyknout na tempo", "Ušetřit peníze", "Vyhnout se učení", "Kvůli videu"],
        ans: "Zvyknout na tempo",
        exp: "Simulace reálných podmínek.",
      },
      {
        q: "Eliminační metoda znamená?",
        opts: ["Vyloučit nesprávné možnosti", "Hádat náhodně", "Psát esej", "Kreslit"],
        ans: "Vyloučit nesprávné možnosti",
        exp: "Zúžit výběr A–D.",
      },
      {
        q: "Kolik minut rezervy na kontrolu u 100min testu?",
        opts: ["0", "5–10", "50", "100"],
        ans: "5–10",
        exp: "Krátká kontrola na konci.",
      },
      {
        q: "Growth mindset u chyb znamená?",
        opts: ["Ignorovat chyby", "Učit se z analýzy", "Přestat cvičit", "Obviňovat test"],
        ans: "Učit se z analýzy",
        exp: "Chyby = zpětná vazba.",
      },
    ],
  },
  {
    slug: "ustni-pohovor-lf-priprava",
    title: "Ústní pohovor na LF — příprava",
    description: "Jak projít ústním kolem u fakult s komplexním přijímacím řízením — motivace, etika, aktuální témata.",
    summary: "Struktura pohovoru, odpovědi, neverbální komunikace.",
    duration: 55,
    xp: 75,
    lessons: [
      {
        slug: "struktura-pohovoru",
        title: "Struktura ústního pohovoru na LF",
        content: `## A) Typické části
Představení, motivace, odborné miniotázky, etika.

## B) Komise
Respekt, upřímnost, stručnost.

## C) Délka
Obvykle 10–20 min — připrav si klíčové body.

## D) Dokumenty
Maturita, CV, doporučení dle fakulty.`,
        minutes: 18,
      },
      {
        slug: "motivace-odpovedi",
        title: "Motivace a typické otázky",
        content: `## A) Proč medicína?
Osobní příběh + realita oboru.

## B) Proč tato LF?
Znalost fakulty, programu, města.

## C) Etické dilema
Postup: situace, hodnoty, rozhodnutí, reflexe.

## D) Aktuální témata
Zdravotnictví v ČR, prevence, digitalizace.`,
        minutes: 20,
      },
      {
        slug: "neverbalni-komunikace",
        title: "Neverbální komunikace a stres",
        content: `## A) Oční kontakt, postoj
Otevřená poloha, klidný hlas.

## B) Aktivní naslouchání
Parafráze otázky před odpovědí.

## C) Pauza
Krátké zamyšlení je v pořádku.

## D) Po pohovoru
Poděkování, sebereflexe.`,
        minutes: 17,
      },
    ],
    quizTitle: "Kvíz: Ústní pohovor",
    questions: [
      {
        q: "Co zdůraznit u otázky 'Proč medicína'?",
        opts: ["Jen plat", "Autentickou motivaci a znalost reality", "Nic neříkat", "Pomluvu konkurence"],
        ans: "Autentickou motivaci a znalost reality",
        exp: "Upřímnost a příprava.",
      },
      {
        q: "Etické dilema — správný postup?",
        opts: ["Okamžitá odpověď bez úvahy", "Strukturovaná analýza", "Odmítnout odpovědět", "Vtip"],
        ans: "Strukturovaná analýza",
        exp: "Situace → hodnoty → rozhodnutí.",
      },
      {
        q: "Proč znát specifika vybrané LF?",
        opts: ["Ukázat zájem", "Není potřeba", "Kvůli sportu", "Jen kvůli jídlu"],
        ans: "Ukázat zájem",
        exp: "Komise hodnotí přípravu.",
      },
      {
        q: "Krátká pauza před odpovědí?",
        opts: ["Neprofesionální", "Přijatelné pro rozmyšlení", "Zákaz", "Vždy špatné"],
        ans: "Přijatelné pro rozmyšlení",
        exp: "Lepší než unáhlená chyba.",
      },
      {
        q: "Neverbálně důležité?",
        opts: ["Křížené ruce a úkryt", "Otevřený postoj a kontakt", "Křik", "Telefon"],
        ans: "Otevřený postoj a kontakt",
        exp: "Respekt a sebejistota.",
      },
    ],
  },
  {
    slug: "matematika-prijimacky-medicina",
    title: "Matematika pro přijímačky medicína",
    description: "Procenta, rovnice, funkce a logika často požadované u přijímaček — zejména u fakult s rozšířeným testem.",
    summary: "Algebra, procenta, grafy — praktické úlohy pro LF.",
    duration: 70,
    xp: 95,
    lessons: [
      {
        slug: "procenta-pomer",
        title: "Procenta, poměr a rule of three",
        content: `## A) Procenta
Základ = 100 %, výpočet části a celku.

## B) Poměr
a:b, zjednodušení, přímá úměra.

## C) Trojčlenka
Přímá/ne přímá úměrnost.

## D) Aplikace
Koncentrace roztoků, statistiky.`,
        minutes: 24,
      },
      {
        slug: "rovnice-funkce",
        title: "Lineární rovnice a funkce",
        content: `## A) Lineární rovnice
ax + b = 0, úpravy obou stran.

## B) Funkce y = kx + q
Směrnice, průsečík s osami.

## C) Graf
Interpretace sklonu a posunu.

## D) Textové úlohy
Převod slov na rovnici.`,
        minutes: 23,
      },
      {
        slug: "mocniny-odhady",
        title: "Mocniny, odmocniny a odhady",
        content: `## A) Mocniny
Pravidla násobení stejného základu.

## B) Odmocniny
√ a numerické odhady.

## C) Vědecká notace
a × 10ⁿ pro velmi malá/velká čísla.

## D) Logika
Vyloučení nesmyslných odpovědí v testu.`,
        minutes: 23,
      },
    ],
    quizTitle: "Kvíz: Matematika",
    questions: [
      {
        q: "Kolik je 15 % ze 200?",
        opts: ["15", "30", "45", "20"],
        ans: "30",
        exp: "0,15 × 200 = 30.",
      },
      {
        q: "Řešení: 2x + 6 = 14",
        opts: ["x=2", "x=4", "x=10", "x=7"],
        ans: "x=4",
        exp: "2x=8 → x=4.",
      },
      {
        q: "Směrnice přímky y = 3x − 2?",
        opts: ["−2", "3", "2", "−3"],
        ans: "3",
        exp: "k = 3 v y = kx + q.",
      },
      {
        q: "√81 = ?",
        opts: ["8", "9", "81", "18"],
        ans: "9",
        exp: "9² = 81.",
      },
      {
        q: "Přímá úměra — když x dvojnásobně, y?",
        opts: ["Poloviční", "Dvojnásobné", "Beze změny", "Nulové"],
        ans: "Dvojnásobné",
        exp: "y = kx.",
      },
    ],
  },
  {
    slug: "latinska-terminologie-medicina",
    title: "Latinská terminologie v medicíně",
    description: "Základy latiny pro mediky — anatomické názvy, zkratky receptur a orientace v učebnicích.",
    summary: "Předpony, přípony, anatomické termíny, latinské názvy.",
    duration: 65,
    xp: 85,
    lessons: [
      {
        slug: "latinske-koreny",
        title: "Latinské kořeny, prefixy a sufixy",
        content: `## A) Prefixy
hyper-, hypo-, intra-, extra-, sub-, supra-.

## B) Sufixy
-itis (zánět), -oma (nouze), -ectomy (odstranění).

## C) Skládání
Kardio + logy = kardiologie.

## D) Výslovnost
Přibližná latinská výslovnost stačí na začátku.`,
        minutes: 22,
      },
      {
        slug: "anatomicke-nazvy",
        title: "Anatomické názvy v latině",
        content: `## A) Bones
Femur, tibia, humerus, scapula.

## B) Směr
Dexter/sinister, cranialis/caudalis.

## C) Orgány
Cor (srdce), pulmo (plíce), hepar ( játra).

## D) Praxe
Překlad CZ ↔ LAT na kartičkách.`,
        minutes: 22,
      },
      {
        slug: "receptura-zkratky",
        title: "Zkratky v receptuře a dokumentaci",
        content: `## A) Frequenza
b.i.d., t.i.d., q.d. — 2×, 3×, 1× denně.

## B) Cesta podání
p.o., i.v., s.c.

## C) Signa
Sig.: — návod pro pacienta.

## D) Bezpečnost
Neplést podobné zkratky.`,
        minutes: 21,
      },
    ],
    quizTitle: "Kvíz: Latinská terminologie",
    questions: [
      {
        q: "Co znamená suffix -itis?",
        opts: ["Nádor", "Zánět", "Odstranění", "Svorky"],
        ans: "Zánět",
        exp: "Artritis = zánět kloubu.",
      },
      {
        q: "Latinsky 'srdce'?",
        opts: ["Pulmo", "Cor", "Ren", "Hepar"],
        ans: "Cor",
        exp: "Cor = srdce.",
      },
      {
        q: "Hyper- znamená?",
        opts: ["Pod", "Nad/nadbytkem", "Vnitř", "Proti"],
        ans: "Nad/nadbytkem",
        exp: "Hypertenze = vysoký tlak.",
      },
      {
        q: "p.o. podání?",
        opts: ["Intravenózní", "Perorální", "Subkutánní", "Inhalace"],
        ans: "Perorální",
        exp: "Per os = ústy.",
      },
      {
        q: "Femur je?",
        opts: ["Lopatka", "Stehenní kost", "Loketní", "Páteř"],
        ans: "Stehenní kost",
        exp: "Nejdelší kost těla.",
      },
    ],
  },
  {
    slug: "etika-motivacni-dopis",
    title: "Etika a motivační dopis",
    description: "Etické principy v medicíně a jak napsat motivační dopis / osobní prohlášení pro přihlášku na LF.",
    summary: "Autonomie, beneficence, non-maleficence, justice + struktura dopisu.",
    duration: 50,
    xp: 70,
    lessons: [
      {
        slug: "eticke-principy",
        title: "Základní etické principy medicíny",
        content: `## A) Autonomie
Respekt k rozhodnutí pacienta, informovaný souhlas.

## B) Beneficence
Konat ve prospěch pacienta.

## C) Non-maleficence
Primum non nocere — neublížit.

## D) Spravedlnost
Rovný přístup ke zdravotní péči.`,
        minutes: 18,
      },
      {
        slug: "motivacni-dopis",
        title: "Struktura motivačního dopisu",
        content: `## A) Úvod
Proč medicína, proč nyní.

## B) Tělo
Zkušenosti (DN, dobrovolnictví), dovednosti.

## C) Vazba na LF
Konkrétní program, hodnoty fakulty.

## D) Závěr
Vize, poděkování, stručnost (1–2 strany).`,
        minutes: 17,
      },
      {
        slug: "priklady-dilemat",
        title: "Příklady etických dilemat pro uchazeče",
        content: `## A) Důvěrnost vs bezpečí
Kdy porušit mlčenlivost?

## B) Alokace
Omezené zdroje — kdo první?

## C) Konflikt zájmů
Sponzorství, farmaceutický tlak.

## D) Reflexe
Ne jedna správná odpověď — proces.`,
        minutes: 15,
      },
    ],
    quizTitle: "Kvíz: Etika a motivace",
    questions: [
      {
        q: "Primum non nocere znamená?",
        opts: ["Léčit za každou cenu", "Nejdřív neublížit", "Ignorovat pacienta", "Prodat lék"],
        ans: "Nejdřív neublížit",
        exp: "Non-maleficence.",
      },
      {
        q: "Informovaný souhlas souvisí s?",
        opts: ["Autonomií", "Chirurgií", "Marketingem", "Sportem"],
        ans: "Autonomií",
        exp: "Pacient rozhoduje na základě informací.",
      },
      {
        q: "Motivační dopis má být?",
        opts: ["Deset stran bez struktury", "Stručný a autentický", "Opsaný z internetu", "Bez vazby na LF"],
        ans: "Stručný a autentický",
        exp: "1–2 strany, konkrétní motivace.",
      },
      {
        q: "Beneficence = ?",
        opts: ["Konat ve prospěch pacienta", "Škodit", "Mlčet", "Útěk"],
        ans: "Konat ve prospěch pacienta",
        exp: "Prospěch pacienta.",
      },
      {
        q: "Etické dilema v pohovoru?",
        opts: ["Hledat perfektní odpověď", "Ukázat uvažování", "Mlčet", "Vtipkovat"],
        ans: "Ukázat uvažování",
        exp: "Proces je důležitější než dogma.",
      },
    ],
  },
  {
    slug: "ktera-lf-rozhodovaci-strom",
    title: "Rozhodovací strom: která LF?",
    description: "Bonus kurz — jak vybrat mezi 8 českými LF podle města, formátu přijímaček, kapacity a osobních preferencí.",
    summary: "Praktický rozhodovací rámec pro výběr fakulty.",
    duration: 45,
    xp: 60,
    lessons: [
      {
        slug: "kriteria-vyberu",
        title: "Kritéria výběru fakulty",
        content: `## A) Město a náklady
Ubytování, doprava, rodina.

## B) Formát přijímaček
Cermat vs vlastní test vs komplexní.

## C) Kapacity a úspěšnost
Statistiky dle MSMT/SÚRA.

## D) Program
Anglická parallel, interdisciplinarita.`,
        minutes: 15,
      },
      {
        slug: "porovnani-lf",
        title: "Porovnání českých LF — přehled",
        content: `## A) Praha
1. LF UK, 2. LF UK, 3. LF UK — různé tradice.

## B) Brno
LF MU — silná věda.

## C) Ostatní
Plzeň, Hradec, Olomouc, Ostrava.

## D) Ověření
Vždy aktuální web fakulty.`,
        minutes: 15,
      },
      {
        slug: "rozhodovaci-matice",
        title: "Rozhodovací matice a plán B",
        content: `## A) Váhy kritérií
Seřadit priority (0–5).

## B) Matice
Skóre fakult × kritéria.

## C) Plán B
Alternativní obory, příprava na další rok.

## D) Termíny
Kalendář přihlášek.`,
        minutes: 15,
      },
    ],
    quizTitle: "Kvíz: Výběr LF",
    questions: [
      {
        q: "Co vždy ověřit jako první?",
        opts: ["Instagram influencer", "Oficiální web LF", "Fórum bez zdroje", "Starý blog"],
        ans: "Oficiální web LF",
        exp: "Termíny a podmínky se mění.",
      },
      {
        q: "Rozhodovací matice pomáhá?",
        opts: ["Strukturovat preference", "Vyhrát loterii", "Nahradit maturitu", "Vyhnout se učení"],
        ans: "Strukturovat preference",
        exp: "Objektivizace výběru.",
      },
      {
        q: "Plán B znamená?",
        opts: ["Alternativu při neúspěchu", "Ignorovat přípravu", "Podvod", "Nic"],
        ans: "Alternativu při neúspěchu",
        exp: "Realistická záloha.",
      },
      {
        q: "Kapacita fakulty ovlivňuje?",
        opts: ["Počet přijatých", "Barvu uniforem", "Počasí", "Jazyk planet"],
        ans: "Počet přijatých",
        exp: "Statistika přijetí.",
      },
      {
        q: "Kolik LF medicíny v ČR (tradiční)?",
        opts: ["5", "8", "12", "3"],
        ans: "8",
        exp: "Osm lékařských fakult.",
      },
    ],
  },
  {
    slug: "opakovani-mixed-test-prijimacky",
    title: "Opakování — mixed test přijímačky",
    description: "Bonus kurz — komplexní opakování biologie, chemie, fyziky a logiky v mixed formátu jako u reálných přijímaček.",
    summary: "Mixed test simulace — finální příprava před zkouškou.",
    duration: 100,
    xp: 130,
    lessons: [
      {
        slug: "bio-chem-mix",
        title: "Mixed blok: biologie + chemie",
        content: `## A) Buňka + organika
Organela ↔ funkce, alkany/alkeny.

## B) Genetika + reakce
Křížení + oxidace alkoholů.

## C) Fyziologie + kyseliny
Krev + karboxylové skupiny.

## D) Čas
45 min blok — simulace.`,
        minutes: 35,
      },
      {
        slug: "fyzika-matematika-mix",
        title: "Mixed blok: fyzika + matematika",
        content: `## A) Mechanika
Pohyb, síly, energie.

## B) Elektřina
Ohm, sériové zapojení.

## C) Matematika
Procenta, rovnice, grafy.

## D) Propojení
Koncentrace % v chemii + výpočty.`,
        minutes: 35,
      },
      {
        slug: "finalni-simulace",
        title: "Finální simulace a checklist",
        content: `## A) Full test
100 min dle vzoru fakulty.

## B) Checklist
Doklady, propustka, pero, voda.

## C) Po testu
Analýza chyb podle témat.

## D) Den D
Spánek, snídaně, klid.`,
        minutes: 30,
      },
    ],
    quizTitle: "Kvíz: Mixed test",
    questions: [
      {
        q: "Mitochondrie — hlavní funkce?",
        opts: ["Fotosyntéza", "ATP", "Trávení", "Exkrece"],
        ans: "ATP",
        exp: "Buněčné dýchání.",
      },
      {
        q: "Obecný vzorec alkanu?",
        opts: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙO", "CₙH₂ₙ₋₂"],
        ans: "CₙH₂ₙ₊₂",
        exp: "Nasycený uhlíkovodík.",
      },
      {
        q: "F = m·a — který zákon?",
        opts: ["1.", "2.", "3.", "0."],
        ans: "2.",
        exp: "Newtonův druhý.",
      },
      {
        q: "20 % z 150?",
        opts: ["20", "30", "25", "35"],
        ans: "30",
        exp: "0,2 × 150 = 30.",
      },
      {
        q: "Před testem nejdůležitější?",
        opts: ["Vypít litr kávy v noci", "Spánek a klid", "Učit se celou noc", "Ignorovat zadání"],
        ans: "Spánek a klid",
        exp: "Regenerace a soustředění.",
      },
    ],
  },
];

function esc(s) {
  return s.replace(/'/g, "''");
}

function optionsJson(opts) {
  return opts.map((label, i) => ({ label, value: String.fromCharCode(97 + i) }));
}

function optionsJsonStr(opts) {
  const arr = optionsJson(opts);
  return JSON.stringify(arr).replace(/'/g, "''");
}

function correctValue(opts, ans) {
  const idx = opts.indexOf(ans);
  const v = idx >= 0 ? String.fromCharCode(97 + idx) : "a";
  return JSON.stringify({ value: v }).replace(/'/g, "''");
}

let sql = `-- MedScope Academy — přípravné kurzy pro přijímačky LF (12 kurzů)
-- Idempotent seed: courses, lessons, quizzes, quiz_questions
-- Tag: {"audience": "prijimacky", "prep_course": true}

-- Extend level check for prep courses
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_level_check
  CHECK (level IN ('beginner', 'intermediate', 'advanced', 'priprava'));

`;

courses.forEach((c, ci) => {
  const thumb = THUMBS[ci % THUMBS.length];
  const meta = JSON.stringify({
    audience: "prijimacky",
    prep_course: true,
    is_free: true,
    level_label: "příprava",
  }).replace(/'/g, "''");

  sql += `
-- ─── ${c.title} ───────────────────────────────────────────────────────────
INSERT INTO public.courses (
  slug, title, description, summary, status, level, category,
  cover_image_url, duration_minutes, xp_reward, is_public, metadata
)
SELECT
  '${esc(c.slug)}',
  '${esc(c.title)}',
  '${esc(c.description)}',
  '${esc(c.summary)}',
  'published',
  'priprava',
  'prijimacky',
  '${thumb}',
  ${c.duration},
  ${c.xp},
  true,
  '${meta}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = '${esc(c.slug)}');

`;

  c.lessons.forEach((l, li) => {
    sql += `INSERT INTO public.lessons (course_id, slug, title, content, sort_order, duration_minutes, status)
SELECT c.id, '${esc(l.slug)}', '${esc(l.title)}', E'${esc(l.content)}', ${li + 1}, ${l.minutes}, 'published'
FROM public.courses c
WHERE c.slug = '${esc(c.slug)}'
  AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id AND l.slug = '${esc(l.slug)}');

`;
  });

  sql += `INSERT INTO public.quizzes (course_id, title, passing_score, status)
SELECT c.id, '${esc(c.quizTitle)}', 70, 'published'
FROM public.courses c
WHERE c.slug = '${esc(c.slug)}'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.title = '${esc(c.quizTitle)}');

`;

  c.questions.forEach((q, qi) => {
    const opts = optionsJsonStr(q.opts);
    const corr = correctValue(q.opts, q.ans);
    sql += `INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, sort_order, explanation)
SELECT q.id, '${esc(q.q)}', 'multiple_choice', '${opts}'::jsonb, '${corr}'::jsonb, ${qi + 1}, '${esc(q.exp)}'
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = '${esc(c.slug)}' AND q.title = '${esc(c.quizTitle)}'
  AND NOT EXISTS (SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = q.id AND qq.sort_order = ${qi + 1});

`;
  });
});

sql += `COMMENT ON TABLE public.courses IS 'MedScope Academy — includes prijimacky prep courses (12)';

`;

fs.writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${outPath} (${courses.length} courses)`);
