/**
 * Verified Unsplash slide image URLs (HEAD-checked 2026-06-20).
 * Shared constants — keep in sync with slide-image-urls.mjs for batch scripts.
 */

export const DEFAULT_SLIDE_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format";

/** Photo IDs that return 404 or were removed from Unsplash CDN. */
export const BROKEN_UNSPLASH_PHOTO_IDS = [
  "photo-1532187863486-abf9db1a4690",
  "photo-1628348068343-c6a848d2a385",
  "photo-1559757175-5700cde872bc",
  "photo-1532636865606-79b0b8b44644",
  "photo-1628595357799-9c8c8fd22790",
  "photo-1523050854058-8df90110c9f1",
  "photo-1584515930387-285e4804f4cb",
] as const;

export const KEYWORD_IMAGES: Record<string, string> = {
  anatomical_planes:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  body_regions:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Regions_of_human_body.png/800px-Regions_of_human_body.png",
  anatomy:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  orientation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  skeleton:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  skeleton_anterior:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  skeleton_posterior:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Human_skeleton_back_en.svg/800px-Human_skeleton_back_en.svg.png",
  heart:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Diagram_of_the_human_heart_%28cropped%29.svg/800px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
  blood:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  circulation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop&q=80&auto=format",
  cell: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  biology: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  genetics_mendel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mendel-flowers.jpg/960px-Mendel-flowers.jpg",
  punnett_square:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Punnett_square_mendel_flowers.svg/960px-Punnett_square_mendel_flowers.svg.png",
  dna: "https://upload.wikimedia.org/wikipedia/commons/c/c4/DNA_double_helix_horizontal.png",
  mendel_pea:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mendelian_inheritance_in_black_and_white_albino_guinea_pigs%28GN04114%29.jpg/960px-Mendelian_inheritance_in_black_and_white_albino_guinea_pigs%28GN04114%29.jpg",
  genetics:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mendel-flowers.jpg/960px-Mendel-flowers.jpg",
  chemistry:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Periodic_table.svg/800px-Periodic_table.svg.png",
  chemistry_molecule:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Periodic_table.svg/800px-Periodic_table.svg.png",
  physics:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Newton%27s_cradle_animation_book_2.gif/800px-Newton%27s_cradle_animation_book_2.gif",
  physics_motion:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Newton%27s_cradle_animation_book_2.gif/800px-Newton%27s_cradle_animation_book_2.gif",
  physiology: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop&q=80&auto=format",
  brain:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Brain_human_sagittal_section.svg/800px-Brain_human_sagittal_section.svg.png",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop&q=80&auto=format",
  diet: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop&q=80&auto=format",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop&q=80&auto=format",
  exam: DEFAULT_SLIDE_IMAGE,
  ethics: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop&q=80&auto=format",
  latin: DEFAULT_SLIDE_IMAGE,
  muscle: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop&q=80&auto=format",
  lung: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lungs_diagram_detailed.svg/800px-Lungs_diagram_detailed.svg.png",
  nerve:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Brain_human_sagittal_section.svg/800px-Brain_human_sagittal_section.svg.png",
  default: DEFAULT_SLIDE_IMAGE,
};

/** Ordered fallbacks when primary image fails to load in browser. */
export const SLIDE_IMAGE_FALLBACKS: string[] = [
  DEFAULT_SLIDE_IMAGE,
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop&q=80&auto=format",
];

const CS_KEYWORD_MAP: [RegExp, string][] = [
  [/orientac|poloh|roviny|anatom/i, "orientation"],
  [/kost|skelet|kostern/i, "skeleton"],
  [/krev(?!ní)|oběh|cirkul/i, "circulation"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/farmak|lék|medik|dávkov/i, "pharmacy"],
  [/punnett|křížení|krízení|dělení\s+gen|druhý\s+mendel|krevní\s+skupin/i, "punnett_square"],
  [/mendel|dědičn|genotyp|fenotyp|alel|homozyg|heterozyg|potomstv/i, "genetics_mendel"],
  [/dna|chromosom|genet|gen\b|transkrip/i, "dna"],
  [/hrách|hráš|pea\s+plant/i, "mendel_pea"],
  [/buněk|buně|mitóz|organel/i, "cell"],
  [/biolog/i, "biology"],
  [/chem|vazb|uhlík|molekul|period|prvek|reakc|alkohol/i, "chemistry_molecule"],
  [/fyzik|kinemat|mechan|elektr|síla|rychlost|energ/i, "physics_motion"],
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

export type SlideImageInput = {
  title?: string;
  body?: string;
  imageDescription?: string;
  imageKeywords?: string | string[];
  topic?: string;
  index?: number;
};

export function isBrokenSlideImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (!url.startsWith("http")) return true;
  return BROKEN_UNSPLASH_PHOTO_IDS.some((id) => url.includes(id));
}

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

export function resolveSlideImageUrl(input: SlideImageInput): string {
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

export function sanitizeSlideImageUrl(
  url: string | undefined | null,
  fallbackInput?: SlideImageInput
): string {
  if (url && !isBrokenSlideImageUrl(url)) return url;
  if (fallbackInput) return resolveSlideImageUrl(fallbackInput);
  return DEFAULT_SLIDE_IMAGE;
}

export function attachSlideImages<
  T extends { title: string; body: string; imageDescription?: string; imageKeywords?: string | string[] },
>(slides: T[], topic?: string): (T & { imageUrl: string })[] {
  return slides.map((s, i) => {
    const resolverInput: SlideImageInput = {
      title: s.title,
      body: s.body,
      imageDescription: s.imageDescription,
      imageKeywords: s.imageKeywords,
      topic,
      index: i,
    };
    const stored = (s as T & { imageUrl?: string }).imageUrl;
    return {
      ...s,
      imageUrl: sanitizeSlideImageUrl(stored, resolverInput),
    };
  });
}
