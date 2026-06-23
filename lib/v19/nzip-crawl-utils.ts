import type { NzipCategory } from "@/lib/v19/types";

/** Infer NZIP category from URL path segment */
export function inferNzipCategoryFromPath(path: string): NzipCategory {
  const p = path.toLowerCase();
  const rules: [RegExp, NzipCategory][] = [
    [/slovnik|pojem|pojmy/, "slovnik-pojmu"],
    [/prevence/, "prevence"],
    [/diagnost/, "diagnostika"],
    [/lecba|léčba/, "lecba"],
    [/vyziv|výživ/, "vyziva"],
    [/zivotni|životní/, "zivotni-styl"],
    [/profes/, "zdravotnicke-profese"],
    [/system|zdravotnictvi/, "zdravotnicke-systemy"],
    [/pacient|edukac/, "pacientska-edukace"],
    [/odborn|clanek|článek/, "odborne-clanky"],
    [/publikac/, "publikace"],
    [/doporuc/, "doporuceni"],
    [/aktualit|vedeck/, "vedecke-aktuality"],
    [/temat/, "tematicke-okruhy"],
    [/nemoc|onemoc/, "nemoci"],
  ];
  for (const [re, cat] of rules) {
    if (re.test(p)) return cat;
  }
  return "tematicke-okruhy";
}
