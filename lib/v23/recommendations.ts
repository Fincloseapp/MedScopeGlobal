export type V23Interest =
  | "studie"
  | "leky"
  | "legislativa"
  | "digital-health"
  | "medicina"
  | "novinky"
  | "articles";

const PATH_MAP: { pattern: RegExp; interest: V23Interest }[] = [
  { pattern: /^\/studie/, interest: "studie" },
  { pattern: /^\/leky/, interest: "leky" },
  { pattern: /^\/legislativa/, interest: "legislativa" },
  { pattern: /^\/digital-health/, interest: "digital-health" },
  { pattern: /^\/medicina/, interest: "medicina" },
  { pattern: /^\/novinky/, interest: "novinky" },
  { pattern: /^\/articles/, interest: "articles" },
];

export function interestsFromPaths(paths: string[]): V23Interest[] {
  const scores = new Map<V23Interest, number>();
  for (const p of paths) {
    for (const { pattern, interest } of PATH_MAP) {
      if (pattern.test(p)) {
        scores.set(interest, (scores.get(interest) ?? 0) + 1);
      }
    }
  }
  if (scores.size === 0) {
    return ["studie", "leky", "legislativa", "medicina"];
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, 4);
}

export type V23Recommendation = {
  title: string;
  summary: string;
  href: string;
  topic: string;
  reason: string;
};
