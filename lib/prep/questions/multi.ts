import { Q } from "@/lib/prep/questions/helpers";
import type { PrepQuestion } from "@/lib/prep/types";

/** Vícesprávné položky — trénink formátu „více tvrzení může platit“. */
export const MULTI_QUESTIONS: PrepQuestion[] = [
  Q(
    "multi-bio-01",
    "biologie",
    "b-bunka",
    "Buňka",
    "narocne",
    "Které organely obsahují vlastní DNA?",
    ["Mitochondrie", "Chloroplast (u rostlin)", "Golgiho aparát", "Lysozom"],
    0,
    "Semiautonomní organely endosymbiotického původu nesou kruhovou DNA. Golgi a lysozom ne.",
    { correctIndices: [0, 1], faculties: ["lf-mu"] }
  ),
  Q(
    "multi-bio-02",
    "biologie",
    "b-genetika",
    "Genetika",
    "narocne",
    "Co probíhá během meiózy I?",
    ["Párování homologů", "Crossing-over", "Oddělení sesterských chromatid jako v mitóze", "Redukce diploidie na haploidii"],
    0,
    "Sesterské chromatidy se oddělí až v meióze II. V AI se rozcházejí bivalenty (homology).",
    { correctIndices: [0, 1, 3], faculties: ["lf-mu"] }
  ),
  Q(
    "multi-chem-01",
    "chemie",
    "c-roztoky",
    "pH",
    "narocne",
    "Které tvrzení o silné kyselině ve vodě je správné?",
    ["Disociuje téměř úplně", "pH 0,1M HCl je přibližně 1", "Je vždy organická", "Má K_a ≪ 1"],
    0,
    "Silné minerální kyseliny: úplná disociace, velké K_a. Organická ≠ definice síly.",
    { correctIndices: [0, 1], faculties: ["lf-mu"] }
  ),
  Q(
    "multi-chem-02",
    "chemie",
    "c-redox",
    "Redox",
    "narocne",
    "Při oxidaci platí:",
    ["Ztráta elektronů", "Zvýšení oxidačního čísla", "Příjem elektronů", "Snížení oxidačního čísla"],
    0,
    "Oxidace a redukce jsou zrcadla. Příjem e⁻ = redukce.",
    { correctIndices: [0, 1], faculties: ["lf-mu"] }
  ),
  Q(
    "multi-fyz-01",
    "fyzika",
    "f-elektrina",
    "Elektřina",
    "narocne",
    "Pro ohmický vodič platí:",
    ["U = I R", "P = U I", "Sériově se sčítají proudy do uzlu jako napětí", "Jednotka R je ohm"],
    0,
    "Kirchhoffův proudový zákon platí v uzlu vždy, ale není to „sčítání proudů sériově“. Sériově je stejný proud.",
    { correctIndices: [0, 1, 3], faculties: ["lf-mu"] }
  ),
  Q(
    "multi-fyz-02",
    "fyzika",
    "f-mechanika",
    "Mechanika",
    "narocne",
    "Jednotka joule je ekvivalentní:",
    ["N·m", "kg·m²·s⁻²", "W·s", "Pa·m³ i N·m (energie)"],
    0,
    "1 J = 1 N·m = 1 W·s = 1 kg·m²·s⁻². Pa·m³ = (N/m²)·m³ = N·m = J.",
    { correctIndices: [0, 1, 2, 3], faculties: ["lf-mu"] }
  ),
];
