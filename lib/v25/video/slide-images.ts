/**
 * Topic-matched slide images — curated Unsplash medical/education (free, no API key).
 */

const KEYWORD_IMAGES: Record<string, string> = {
  anatomy: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  skeleton: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  orientation: "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
  heart: "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
  blood: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  circulation: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  cell: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  biology: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  chemistry: "https://images.unsplash.com/photo-1532636865606-79b0b8b44644?w=800&q=80",
  physics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  physiology: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  brain: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  diet: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  exam: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  ethics: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  latin: "https://images.unsplash.com/photo-1457369804613-52bfab068dba?w=800&q=80",
  muscle: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  lung: "https://images.unsplash.com/photo-1628595357799-9c8c8fd22790?w=800&q=80",
  nerve: "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
  default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
};

const CS_KEYWORD_MAP: [RegExp, string][] = [
  [/orientac|poloh|roviny|anatom/i, "orientation"],
  [/kost|skelet|kostern/i, "skeleton"],
  [/krev|oběh|cirkul/i, "circulation"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/farmak|lék|medik|dávkov/i, "pharmacy"],
  [/buněk|buně|biolog|genet|dna|mitóz/i, "cell"],
  [/chem|vazb|uhlík|alkohol/i, "chemistry"],
  [/fyzik|kinemat|mechan|elektr/i, "physics"],
  [/fyziolog|metabol|dych/i, "physiology"],
  [/mozek|neurolog|nerv/i, "brain"],
  [/strav|výživ|jídlo|diet/i, "nutrition"],
  [/sval|myolog/i, "muscle"],
  [/plic|dych|respir/i, "lung"],
  [/přijímač|test|cermat|matur/i, "exam"],
  [/etik|motivac|dopis/i, "ethics"],
  [/latinsk|termin|prefix/i, "latin"],
  [/matemat|procent|rovnice/i, "physics"],
  [/zdrav|prevenc|imunit|osvěta/i, "health"],
];

function matchKeywordKey(haystack: string): string {
  const h = haystack.toLowerCase();
  for (const [re, key] of CS_KEYWORD_MAP) {
    if (re.test(h)) return key;
  }
  for (const key of Object.keys(KEYWORD_IMAGES)) {
    if (key !== "default" && h.includes(key)) return key;
  }
  return "default";
}

export function resolveSlideImageUrl(input: {
  title?: string;
  body?: string;
  imageDescription?: string;
  imageKeywords?: string | string[];
  topic?: string;
  index?: number;
}): string {
  const keywords = Array.isArray(input.imageKeywords)
    ? input.imageKeywords.join(" ")
    : input.imageKeywords ?? "";

  const haystack = [input.topic, input.title, input.body, input.imageDescription, keywords]
    .filter(Boolean)
    .join(" ");

  const key = matchKeywordKey(haystack);
  if (key !== "default") return KEYWORD_IMAGES[key] ?? KEYWORD_IMAGES.default;

  const keys = Object.keys(KEYWORD_IMAGES).filter((k) => k !== "default");
  const idx = (input.index ?? 0) % keys.length;
  return KEYWORD_IMAGES[keys[idx]!] ?? KEYWORD_IMAGES.default;
}

export function attachSlideImages<
  T extends { title: string; body: string; imageDescription?: string; imageKeywords?: string | string[] },
>(slides: T[], topic?: string): (T & { imageUrl: string })[] {
  return slides.map((s, i) => ({
    ...s,
    imageUrl:
      (s as T & { imageUrl?: string }).imageUrl ||
      resolveSlideImageUrl({
        title: s.title,
        body: s.body,
        imageDescription: s.imageDescription,
        imageKeywords: s.imageKeywords,
        topic,
        index: i,
      }),
  }));
}
