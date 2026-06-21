/**
 * Shared slide image resolution (Wikimedia + keyword map + Unsplash).
 * Used by slide-image-matcher.ts and batch scripts.
 */
export const DEFAULT_SLIDE_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format";

export const BROKEN_UNSPLASH_PHOTO_IDS = [
  "photo-1532187863486-abf9db1a4690",
  "photo-1628348068343-c6a848d2a385",
  "photo-1559757175-5700cde872bc",
  "photo-1532636865606-79b0b8b44644",
  "photo-1628595357799-9c8c8fd22790",
  "photo-1523050854058-8df90110c9f1",
  "photo-1584515930387-285e4804f4cb",
];

/** Granular verified images — Wikimedia + Unsplash (HEAD-checked). */
export const GRANULAR_TOPIC_IMAGES = {
  anatomical_planes:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  body_regions:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Regions_of_human_body.png/800px-Regions_of_human_body.png",
  skeleton_anterior:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  skeleton_posterior:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Human_skeleton_back_en.svg/800px-Human_skeleton_back_en.svg.png",
  orientation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  skeleton:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  anatomy:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  muscle:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Biceps_brachii_muscle.jpg/800px-Biceps_brachii_muscle.jpg",
  heart:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Diagram_of_the_human_heart_%28cropped%29.svg/800px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
  circulation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  brain:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Brain_human_sagittal_section.svg/800px-Brain_human_sagittal_section.svg.png",
  lung:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lungs_diagram_detailed.svg/800px-Lungs_diagram_detailed.svg.png",
  cell:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  biology:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  pharmacy:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop&q=80&auto=format",
  chemistry:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop&q=80&auto=format",
  physics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop&q=80&auto=format",
  physiology:
    "https://images.unsplash.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  nutrition:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop&q=80&auto=format",
  exam: DEFAULT_SLIDE_IMAGE,
  default: DEFAULT_SLIDE_IMAGE,
};

const CS_TOPIC_RULES = [
  [/sagitáln|sagittal/i, "anatomical_planes"],
  [/koronáln|frontáln|coronal|frontal/i, "anatomical_planes"],
  [/transverz|transversal|horizontáln/i, "anatomical_planes"],
  [/anatomick[áa]\s+rovin|rovin\s+sagit|rovin\s+koron|rovin\s+transverz/i, "anatomical_planes"],
  [/anatomick[áa]\s+rovin|sagittáln|frontáln|transverz|os\s+[xyz]/i, "anatomical_planes"],
  [/orientac|poloh|supin|prone|lež|stoj|anatomick/i, "orientation"],
  [/kostra|kostern|skelet|lebka|páteř|hrudník/i, "skeleton"],
  [/přední\s+pohled|anterior|ventráln/i, "skeleton_anterior"],
  [/zadní\s+pohled|posterior|dorzáln/i, "skeleton_posterior"],
  [/sval|myolog|biceps|triceps/i, "muscle"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/krev|oběh|cirkul|tepna|žíla/i, "circulation"],
  [/mozek|neurolog|nerv|mícha/i, "brain"],
  [/plic|dých|respir|alveol/i, "lung"],
  [/buněk|buně|biolog|genet|dna|mitóz/i, "cell"],
  [/chem|vazb|uhlík|molekul/i, "chemistry"],
  [/fyzik|kinemat|mechan|elektr/i, "physics"],
  [/farmak|lék|medik/i, "pharmacy"],
  [/strav|výživ|jídlo|diet/i, "nutrition"],
  [/přijímač|test|cermat/i, "exam"],
];

export function isBrokenSlideImageUrl(url) {
  if (!url?.trim()) return true;
  if (!url.startsWith("http")) return true;
  return BROKEN_UNSPLASH_PHOTO_IDS.some((id) => url.includes(id));
}

export async function verifyImageUrl(url) {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch {
    return false;
  }
}

export function matchGranularTopic(haystack) {
  const h = haystack.toLowerCase();
  for (const [re, key] of CS_TOPIC_RULES) {
    if (re.test(h)) return key;
  }
  for (const key of Object.keys(GRANULAR_TOPIC_IMAGES)) {
    if (key !== "default" && h.includes(key.replace(/_/g, " "))) return key;
    if (key !== "default" && h.includes(key)) return key;
  }
  return "default";
}

export function resolveKeywordImage(haystack) {
  const key = matchGranularTopic(haystack);
  return GRANULAR_TOPIC_IMAGES[key] ?? GRANULAR_TOPIC_IMAGES.default;
}

export async function searchWikimedia(term) {
  const q = encodeURIComponent(term.slice(0, 100));
  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const url = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;
      if (url?.startsWith("http") && (await verifyImageUrl(url))) return url;
    }
  } catch {
    /* skip */
  }
  return null;
}

export async function resolveSlideImageFromQuery(query) {
  const haystack = query.imageSearchQuery || query.wikimediaSearchTerm || "";
  const wikiTerm = query.wikimediaSearchTerm || query.imageSearchQuery || "";

  const wiki = wikiTerm ? await searchWikimedia(wikiTerm) : null;
  if (wiki) return { imageUrl: wiki, source: "wikimedia" };

  const curated = resolveKeywordImage(
    [query.slideTitle, query.slideBody, query.lessonTitle, query.courseTopic, haystack].filter(Boolean).join(" ")
  );
  if (curated && !isBrokenSlideImageUrl(curated) && (await verifyImageUrl(curated))) {
    return { imageUrl: curated, source: "keyword_map" };
  }

  // Second Wikimedia attempt with slide title only
  const titleWiki = query.slideTitle ? await searchWikimedia(`${query.slideTitle} anatomy diagram`) : null;
  if (titleWiki) return { imageUrl: titleWiki, source: "wikimedia" };

  if (await verifyImageUrl(DEFAULT_SLIDE_IMAGE)) {
    return { imageUrl: DEFAULT_SLIDE_IMAGE, source: "default" };
  }
  return { imageUrl: curated ?? DEFAULT_SLIDE_IMAGE, source: "fallback" };
}

/** Token overlap score 0–1 for verification script. */
export function relevanceScore(slideTitle, imageAlt) {
  const tokens = (slideTitle + " " + imageAlt)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (!tokens.length) return 0;
  const altWords = new Set(
    imageAlt
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  const hits = tokens.filter((t) => altWords.has(t) || [...altWords].some((a) => a.includes(t) || t.includes(a)));
  return hits.length / tokens.length;
}
