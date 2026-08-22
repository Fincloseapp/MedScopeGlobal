import type { PrepChapter } from "@/lib/prep/types";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";

export const PREP_CHAPTERS: PrepChapter[] = [
  {
    id: "b-bunka",
    subject: "biologie",
    title: "Buňka a metabolismus",
    summary:
      "Eukaryotická buňka není „sáček s organelami“, ale logistika: membrány oddělují reakce, mitochondrie oxidují, ribozomy skládají proteiny a jádro drží genom. Na přijímačkách se ptají, kde která dráha běží a co se stane, když organela chybí.",
    studyHint: "U každé organely si řekněte: membrány? DNA? hlavní produkt?",
    order: 1,
  },
  {
    id: "b-genetika",
    subject: "biologie",
    title: "Genetika a dělení buněk",
    summary:
      "Mitóza zachovává diploidii, meióza ji polovičí a míchá alely. Mendelovy zákony platí, dokud geny neleží na stejném chromozomu. Crossing-over, karyotyp a mutace jsou časté pasti — zvlášť rozdíl mezi somatikou a gametou.",
    studyHint: "Nakreslete 2n=4 přes mitózu a meiózu. Počty chromatid se pletou nejčastěji.",
    order: 2,
  },
  {
    id: "b-fyziologie",
    subject: "biologie",
    title: "Fyziologie člověka",
    summary:
      "Homeostáza stojí na zpětných vazbách: inzulin vs. glukagon, ADH vs. objem moči, baroreceptory vs. tlak. Učte se toky (krev, vzduch, filtrát), ne latinské názvy nazpaměť. Hormony si páruje s žlázou a efektem na glukózu / vápník / vodu.",
    studyHint: "U každého hormonu: odkud, co zvedá/snižuje, antagonistu.",
    order: 3,
  },
  {
    id: "b-anatomie",
    subject: "biologie",
    title: "Anatomie a oběh",
    summary:
      "Srdce, chlopně a velký vs. malý oběh se objevují skoro na každé LF. Důležité je pořadí: LS → mitralis → LK → aorta, a kyslík v plicnici vs. plicních žilách. Kosti a svaly stačí v rozsahu gymnázia: páteř, pánve, hlavní skupiny.",
    studyHint: "Stopujte jednu kapku krve z DK do levého síně.",
    order: 4,
  },
  {
    id: "b-imunita",
    subject: "biologie",
    title: "Imunita a mikrobiologie",
    summary:
      "Vrozená imunita je rychlá a neselektivní, adaptivní si pamatuje antigen. Protilátky dělají plazmatické buňky, T-lymfocyty zabíjejí infikované buňky. Viry nejsou buňky; bakterie mají peptidoglykan a 70S ribozomy — odtud cíle antibiotik.",
    studyHint: "Tabulka: virus / bakterie / kvasinka — nukleová kyselina, stěna, ribozomy.",
    order: 5,
  },
  {
    id: "b-ekologie",
    subject: "biologie",
    title: "Rostliny, ekologie, evoluce",
    summary:
      "Fotosyntéza (světelná fáze vs. Calvin) se plete s buněčným dýcháním. V ekologii rozlišujte producenty, trofické úrovně a limitující faktory. Evoluce na přijímačkách = přírodní výběr, homolog vs. analog, ne „opičí“ anekdoty.",
    studyHint: "Kam jde O₂ a kam CO₂ u rostlin ve dne a v noci?",
    order: 6,
  },
  {
    id: "c-obecna",
    subject: "chemie",
    title: "Atom, vazba, periodická tabulka",
    summary:
      "Z určuje prvek, N izotop, elektrony chemii. Elektronegativita táhne polaritu vazby; iontová vs. kovalentní vs. kovová vazba se pozná z ΔEN a typu prvků. Oxidační čísla musíte umět přiřadit, jinak padáte v redoxu i názvosloví.",
    studyHint: "U každého vzorce: ox. čísla, polarita, skupenství za STP.",
    order: 1,
  },
  {
    id: "c-roztoky",
    subject: "chemie",
    title: "Roztoky, pH a rovnováha",
    summary:
      "c = n/V, zřeďování a pH silných kyselin jsou nejčastější body. Pufry drží pH díky konjugovanému páru. Le Chatelier posouvá rovnováhu proti zásahu — teplota u exotermní reakce není totéž co katalyzátor (ten K nemění).",
    studyHint: "Spočtěte pH 0,01M HCl a 0,01M CH₃COOH — uvidíte rozdíl síly.",
    order: 2,
  },
  {
    id: "c-redox",
    subject: "chemie",
    title: "Redox, stechiometrie, plyny",
    summary:
      "Oxidace = ztráta e⁻. Vyčíslení musí sedět na atomy i náboj. Mol, molární objem 22,4 dm³ a ideální plyn jsou denní chleba. Stechiometrie není memorování, ale převod g ↔ mol ↔ částice.",
    studyHint: "Každý výpočet začněte n = m/M, teprve potom poměr koeficientů.",
    order: 3,
  },
  {
    id: "c-organika",
    subject: "chemie",
    title: "Organická chemie",
    summary:
      "Funkční skupiny určují reaktivitu: alkohol, aldehyd, keton, karboxyl, amin. Izomerie (řetězcová, polohová, geometrická, optická) je oblíbená past. Aromatický sextet u benzenu není totéž jako tři izolované dvojné vazby.",
    studyHint: "Ke každé skupině jeden důkaz / jedna typická reakce.",
    order: 4,
  },
  {
    id: "c-biochem",
    subject: "chemie",
    title: "Biochemie pro přijímačky",
    summary:
      "Aminokyseliny, peptidová vazba, cukry (α/β, redukující), mastné kyseliny a nukleotidy. Není to 1. ročník LF, ale gymnázium s lékařským důrazem: co kondenzuje, co hydrolyzuje, kde je makroergní fosfát.",
    studyHint: "Peptid, glykosid, ester — tři kondenzace, tři hydrolýzy.",
    order: 5,
  },
  {
    id: "f-mechanika",
    subject: "fyzika",
    title: "Mechanika",
    summary:
      "Síla mění hybnost, práce je F·s při rovnoběžnosti, výkon je práce za čas. Volný pád, rovnoměrný pohyb a dostředivé zrychlení v²/r se pletou se setrvačností. Jednotky SI kontrolujte vždy — bod zdarma, nebo ztráta celého příkladu.",
    studyHint: "U každého vzorce napište jednotku výsledku dřív, než dosadíte čísla.",
    order: 1,
  },
  {
    id: "f-teplo-tlak",
    subject: "fyzika",
    title: "Tlak, teplo, plyny",
    summary:
      "Hydrostatický tlak ρgh nezávisí na tvaru nádoby. Teplo Q = mcΔt, skupenské teplo je navíc. Ideální plyn pV = nRT; při konstantním T je p nepřímo úměrné V. Hustota a vztlak (Archimédes) jsou oblíbené slovní úlohy.",
    studyHint: "Oddělte stavovou změnu plynu od ohřevu kapaliny — jiné vzorce.",
    order: 2,
  },
  {
    id: "f-elektrina",
    subject: "fyzika",
    title: "Elektřina a magnetismus",
    summary:
      "Ohmův zákon platí pro ohmické vodiče. Sériově se sčítá R, paralelně převrácené hodnoty. Výkon P = UI. Kondenzátor a cívka se na gymnáziu objevují spíš kvalitativně. Magnetická síla na vodič je F = BIl při kolmosti.",
    studyHint: "Nakreslete obvod a označte, co je stejné (I vs. U) u série/paralelu.",
    order: 3,
  },
  {
    id: "f-vlny",
    subject: "fyzika",
    title: "Kmitání, vlnění, optika",
    summary:
      "v = λf platí u zvuku i světla. Index lomu n = c/v, lom ke kolmici do opticky hustšího prostředí. Čočky: spojka může dát skutečný i neskutečný obraz. Spektrum a fotoefekt stačí v rozsahu: E = hf, červená má nižší f než fialová.",
    studyHint: "Paprskový náčrt spojky pro předmět za 2f, v f a mezi f a čočkou.",
    order: 4,
  },
  {
    id: "f-jadro",
    subject: "fyzika",
    title: "Atomová a jaderná fyzika",
    summary:
      "Poločas je doba na N/2, ne na nulu. α, β, γ se liší pronikavostí i změnou Z. Izotop má stejné Z, různé N. Na přijímačkách stačí logika rozpadové řady a jednotka aktivity, ne kvantová mechanika.",
    studyHint: "U rozpadu vždy zkontrolujte zachování A a Z.",
    order: 5,
  },
];

export function chaptersBySubject(subject: PrepSubject): PrepChapter[] {
  return PREP_CHAPTERS.filter((c) => c.subject === subject).sort((a, b) => a.order - b.order);
}

export function getChapter(id: string): PrepChapter | undefined {
  return PREP_CHAPTERS.find((c) => c.id === id);
}

export const PEXESO_PAIRS: Array<{ id: string; term: string; definition: string; subject: PrepSubject }> = [
  { id: "px-01", subject: "biologie", term: "Mitochondrie", definition: "Hlavní místo aerobní tvorby ATP" },
  { id: "px-02", subject: "biologie", term: "Meióza", definition: "Dělení, které tvoří haploidní gamety" },
  { id: "px-03", subject: "biologie", term: "Inzulin", definition: "Hormon snižující glykémii" },
  { id: "px-04", subject: "biologie", term: "Mitralis", definition: "Chlopeň mezi LS a LK" },
  { id: "px-05", subject: "biologie", term: "Plazmatická buňka", definition: "Secernuje protilátky" },
  { id: "px-06", subject: "biologie", term: "Calvinův cyklus", definition: "Fixace CO₂ ve stromatu chloroplastu" },
  { id: "px-07", subject: "chemie", term: "Protonové číslo Z", definition: "Počet protonů v jádře" },
  { id: "px-08", subject: "chemie", term: "Oxidace", definition: "Ztráta elektronů" },
  { id: "px-09", subject: "chemie", term: "pH 3 vs. pH 5", definition: "100× vyšší [H⁺] u pH 3" },
  { id: "px-10", subject: "chemie", term: "Peptidová vazba", definition: "Kondenzace –COOH a –NH₂" },
  { id: "px-11", subject: "chemie", term: "Molární objem (STP)", definition: "Přibližně 22,4 dm³·mol⁻¹" },
  { id: "px-12", subject: "chemie", term: "Le Chatelier", definition: "Rovnováha se brání vnějšímu zásahu" },
  { id: "px-13", subject: "fyzika", term: "Newton", definition: "SI jednotka síly" },
  { id: "px-14", subject: "fyzika", term: "Ohmův zákon", definition: "U = I · R" },
  { id: "px-15", subject: "fyzika", term: "Index lomu", definition: "n = c / v" },
  { id: "px-16", subject: "fyzika", term: "Poločas rozpadu", definition: "Doba, za kterou se rozpadne polovina jader" },
  { id: "px-17", subject: "fyzika", term: "Hydrostatický tlak", definition: "p = ρ g h" },
  { id: "px-18", subject: "fyzika", term: "Dostředivé zrychlení", definition: "a = v² / r" },
  { id: "px-19", subject: "biologie", term: "SA uzel", definition: "Primární pacemaker srdce v pravé síni" },
  { id: "px-20", subject: "biologie", term: "MHC I", definition: "Prezentuje antigen cytotoxickým T-lymfocytům (CD8)" },
  { id: "px-21", subject: "chemie", term: "Peroxid", definition: "Kyslík v oxidačním čísle −I" },
  { id: "px-22", subject: "chemie", term: "Sacharóza", definition: "Disacharid glukózy a fruktózy" },
  { id: "px-23", subject: "fyzika", term: "Hybnost", definition: "p = m · v" },
  { id: "px-24", subject: "fyzika", term: "Becquerel", definition: "1 rozpad za sekundu" },
];
