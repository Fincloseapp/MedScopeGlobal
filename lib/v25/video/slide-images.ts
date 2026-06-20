/**
 * Free slide images — curated Unsplash medical/education photos (no paid API).
 */

const TOPIC_IMAGES: Record<string, string> = {
  anatomy: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  orientace: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  krev: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  srdce: "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
  farmak: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  biologie: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  chemie: "https://images.unsplash.com/photo-1532636865606-79b0b8b44644?w=800&q=80",
  fyzika: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  fyziologie: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  matematika: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  latina: "https://images.unsplash.com/photo-1456513088650-0d9c0a0a0a0a?w=800&q=80",
  etika: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  prijimacky: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  strava: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  zdravi: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  neurologie: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  kardiologie: "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
  default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
};

const KEYWORD_MAP: [RegExp, string][] = [
  [/anatom|orientac|poloh|roviny/i, "anatomy"],
  [/krev|oběh|srde|kardi/i, "krev"],
  [/srdce|ekg|infarkt/i, "srdce"],
  [/farmak|lék|medik/i, "farmak"],
  [/buněk|biolog|genet|dna/i, "biologie"],
  [/chem|vazb|uhlík/i, "chemie"],
  [/fyzik|kinemat|mechan/i, "fyzika"],
  [/fyziolog|metabol/i, "fyziologie"],
  [/matemat|procent|poměr/i, "matematika"],
  [/latinsk|termin/i, "latina"],
  [/etik|motivac/i, "etika"],
  [/přijímač|test|cermat/i, "prijimacky"],
  [/strav|výživ|jídlo/i, "strava"],
  [/zdrav|prevenc|imunit/i, "zdravi"],
  [/mozek|neurolog/i, "neurologie"],
];

export function resolveSlideImageUrl(input: {
  title?: string;
  body?: string;
  imageDescription?: string;
  topic?: string;
  index?: number;
}): string {
  const haystack = [input.topic, input.title, input.body, input.imageDescription]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const [re, key] of KEYWORD_MAP) {
    if (re.test(haystack)) return TOPIC_IMAGES[key] ?? TOPIC_IMAGES.default;
  }

  const keys = Object.keys(TOPIC_IMAGES).filter((k) => k !== "default");
  const idx = (input.index ?? 0) % keys.length;
  return TOPIC_IMAGES[keys[idx]!] ?? TOPIC_IMAGES.default;
}

export function attachSlideImages<T extends { title: string; body: string; imageDescription?: string }>(
  slides: T[],
  topic?: string
): (T & { imageUrl: string })[] {
  return slides.map((s, i) => ({
    ...s,
    imageUrl: resolveSlideImageUrl({
      title: s.title,
      body: s.body,
      imageDescription: s.imageDescription,
      topic,
      index: i,
    }),
  }));
}
