/**

 * GROQ-powered slide image matcher — maps each slide's text to a relevant free image.

 */

import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

import { DEFAULT_SLIDE_IMAGE, isBrokenSlideImageUrl } from "@/lib/v25/video/slide-images";



export type SlideImageMatchInput = {

  slideTitle: string;

  slideBody: string;

  lessonTitle: string;

  courseTopic: string;

};



export type SlideImageMatchResult = {

  imageUrl: string;

  imageAlt: string;

  captionCs: string;

  imageSearchQuery: string;

  wikimediaSearchTerm: string;

  source: "wikimedia" | "keyword_map" | "default" | "fallback" | "groq_cached";

};



const GRANULAR_TOPIC_IMAGES: Record<string, string> = {

  anatomical_planes:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",

  orientation:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",

  skeleton:

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

  genetics_mendel:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mendel-flowers.jpg/960px-Mendel-flowers.jpg",

  punnett_square:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Punnett_square_mendel_flowers.svg/960px-Punnett_square_mendel_flowers.svg.png",

  dna:

    "https://upload.wikimedia.org/wikipedia/commons/c/c4/DNA_double_helix_horizontal.png",

  mendel_pea:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mendelian_inheritance_in_black_and_white_albino_guinea_pigs%28GN04114%29.jpg/960px-Mendelian_inheritance_in_black_and_white_albino_guinea_pigs%28GN04114%29.jpg",

  chemistry_molecule:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Periodic_table.svg/800px-Periodic_table.svg.png",

  physics_motion:

    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Newton%27s_cradle_animation_book_2.gif/800px-Newton%27s_cradle_animation_book_2.gif",

  default: DEFAULT_SLIDE_IMAGE,

};



const CS_TOPIC_RULES: [RegExp, string][] = [

  [/sagitáln|sagittal/i, "anatomical_planes"],

  [/koronáln|frontáln|coronal|frontal/i, "anatomical_planes"],

  [/transverz|transversal|horizontáln/i, "anatomical_planes"],

  [/anatomick[áa]\s+rovin|rovin\s+sagit|rovin\s+koron|rovin\s+transverz/i, "anatomical_planes"],

  [/orientac|poloh|supin|prone|anatomick/i, "orientation"],

  [/kostra|kostern|skelet|lebka|páteř/i, "skeleton"],

  [/sval|myolog/i, "muscle"],

  [/srdce|kardi|ekg|srdeční/i, "heart"],

  [/krev(?!ní)|oběh|cirkul/i, "circulation"],

  [/mozek|neurolog|nerv/i, "brain"],

  [/plic|dých|respir/i, "lung"],

  [/punnett|křížení|krízení|dělení\s+gen|druhý\s+mendel|krevní\s+skupin/i, "punnett_square"],

  [/mendel|dědičn|genotyp|fenotyp|alel|homozyg|heterozyg|potomstv/i, "genetics_mendel"],

  [/dna|chromosom|genet|gen\b|transkrip/i, "dna"],

  [/hrách|hráš|pea\s+plant/i, "mendel_pea"],

  [/buněk|buně|mitóz|organel/i, "cell"],

  [/chem|vazb|uhlík|molekul|period|prvek|reakc/i, "chemistry_molecule"],

  [/fyzik|kinemat|mechan|elektr|síla|rychlost|energ/i, "physics_motion"],

];



export function matchGranularTopic(haystack: string): string {

  for (const [re, key] of CS_TOPIC_RULES) {

    if (re.test(haystack)) return key;

  }

  return "default";

}



export function resolveKeywordImage(haystack: string): string {

  const key = matchGranularTopic(haystack);

  return GRANULAR_TOPIC_IMAGES[key] ?? GRANULAR_TOPIC_IMAGES.default!;

}



function wikiFallbackSuffix(topicKey: string): string {

  if (["genetics_mendel", "punnett_square", "dna", "mendel_pea"].includes(topicKey)) {

    return "genetics diagram";

  }

  if (topicKey.startsWith("chemistry")) return "chemistry diagram";

  if (topicKey.startsWith("physics")) return "physics diagram";

  return "anatomy diagram";

}



export async function verifyImageUrl(url: string): Promise<boolean> {
  const headers = { "User-Agent": "MedScopeBot/1.0 (https://medscopeglobal.com)" };
  try {
    const isWikimedia = /wikimedia\.org|wikipedia\.org/i.test(url);
    if (isWikimedia) {
      const head = await fetch(url, { method: "HEAD", headers, redirect: "follow", signal: AbortSignal.timeout(8000) });
      if (head.ok) return true;
      const get = await fetch(url, {
        method: "GET",
        headers: { ...headers, Range: "bytes=0-1024" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      return get.ok || get.status === 206;
    }
    const head = await fetch(url, { method: "HEAD", headers, redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (head.ok) return true;
    const get = await fetch(url, { method: "GET", headers, redirect: "follow", signal: AbortSignal.timeout(8000) });
    return get.ok;
  } catch {
    return false;
  }
}



export async function searchWikimedia(term: string): Promise<string | null> {

  const q = encodeURIComponent(term.slice(0, 100));

  try {

    const res = await fetch(

      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,

      { signal: AbortSignal.timeout(12000) }

    );

    if (!res.ok) return null;

    const data = await res.json();

    const pages = data?.query?.pages ?? {};

    for (const page of Object.values(pages) as { imageinfo?: { thumburl?: string; url?: string }[] }[]) {

      const url = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;

      if (url?.startsWith("http") && (await verifyImageUrl(url))) return url;

    }

  } catch {

    /* skip */

  }

  return null;

}



export async function resolveSlideImageFromQuery(query: {

  imageSearchQuery?: string;

  wikimediaSearchTerm?: string;

  slideTitle?: string;

  slideBody?: string;

  lessonTitle?: string;

  courseTopic?: string;

}): Promise<{ imageUrl: string; source: SlideImageMatchResult["source"] }> {

  const haystack = query.imageSearchQuery || query.wikimediaSearchTerm || "";

  const wikiTerm = query.wikimediaSearchTerm || query.imageSearchQuery || "";

  const topicKey = matchGranularTopic(

    [query.slideTitle, query.slideBody, query.lessonTitle, query.courseTopic, haystack].filter(Boolean).join(" ")

  );



  if (wikiTerm) {

    const wiki = await searchWikimedia(wikiTerm);

    if (wiki) return { imageUrl: wiki, source: "wikimedia" };

  }



  const curated = resolveKeywordImage(

    [query.slideTitle, query.slideBody, query.lessonTitle, query.courseTopic, haystack].filter(Boolean).join(" ")

  );

  if (curated && !isBrokenSlideImageUrl(curated) && (await verifyImageUrl(curated))) {

    return { imageUrl: curated, source: "keyword_map" };

  }



  if (query.slideTitle) {

    const titleWiki = await searchWikimedia(`${query.slideTitle} ${wikiFallbackSuffix(topicKey)}`);

    if (titleWiki) return { imageUrl: titleWiki, source: "wikimedia" };

  }



  if (await verifyImageUrl(DEFAULT_SLIDE_IMAGE)) {

    return { imageUrl: DEFAULT_SLIDE_IMAGE, source: "default" };

  }

  return { imageUrl: curated ?? DEFAULT_SLIDE_IMAGE, source: "fallback" };

}



export function relevanceScore(slideTitle: string, imageAlt: string): number {

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



const MATCH_SYSTEM = `Jsi vizuální editor medicínské vzdělávací platformy MedScope Academy. Vrať pouze JSON:

{

  "imageSearchQueryEn": "very specific English search phrase for educational illustration (5-12 words)",

  "imageAltCs": "český alt text popisující, co má obrázek zobrazovat (1 věta)",

  "captionCs": "český popisek pod obrázkem — stručný vzdělávací popis (1-2 věty)",

  "wikimediaSearchTerm": "English Wikimedia Commons search query (3-6 words)"

}

Pravidla:

- imageSearchQueryEn a wikimediaSearchTerm v ANGLIČTINĚ (pro vyhledávání na Wikimedia).

- imageAltCs a captionCs v ČEŠTINĚ s diakritikou.

- imageSearchQueryEn MUSÍ odpovídat konkrétnímu obsahu slidu, NE generickému stocku.

- Genetika/Mendel → Gregor Mendel, hrách, Punnettův čtverec, DNA, alely, genotyp.

- Chemie → molekuly, periodická tabulka, vazby. Fyzika → síly, pohyb, energie.

- Anatomie → přesné anatomické termíny. NE jídlo, sport, kancelář.`;



export async function groqSlideImageQuery(input: SlideImageMatchInput) {

  if (!isGroqConfigured()) return null;

  const raw = await groqCompleteJson({

    system: MATCH_SYSTEM,

    user: `Kurz: ${input.courseTopic}\nLekce: ${input.lessonTitle}\nSlide: ${input.slideTitle}\n${input.slideBody.slice(0, 600)}`,

    maxTokens: 512,

    temperature: 0.2,

    model: resolveAiModel(),

  });

  if (!raw) return null;

  try {

    const parsed = JSON.parse(raw) as {

      imageSearchQueryEn?: string;

      imageSearchQuery?: string;

      imageAltCs?: string;

      imageAlt?: string;

      captionCs?: string;

      wikimediaSearchTerm?: string;

    };

    const searchQuery =

      parsed.imageSearchQueryEn ?? parsed.imageSearchQuery ?? parsed.wikimediaSearchTerm ?? "";

    const altCs = parsed.imageAltCs ?? parsed.imageAlt ?? input.slideTitle;

    return {

      imageSearchQuery: searchQuery,

      imageAlt: altCs,

      captionCs: parsed.captionCs ?? altCs,

      wikimediaSearchTerm: parsed.wikimediaSearchTerm ?? searchQuery,

    };

  } catch {

    return null;

  }

}



export async function matchSlideImage(input: SlideImageMatchInput): Promise<SlideImageMatchResult> {

  const groqQuery = await groqSlideImageQuery(input);

  const topicKey = matchGranularTopic(`${input.slideTitle} ${input.slideBody} ${input.lessonTitle}`);

  const fallbackTerms: Record<string, string> = {

    genetics_mendel: "Gregor Mendel pea plant genetics",

    punnett_square: "Punnett square genetics diagram",

    dna: "DNA double helix structure diagram",

    mendel_pea: "Mendelian inheritance pea plant",

    chemistry_molecule: "chemistry molecule structure diagram",

    physics_motion: "physics forces motion diagram",

    cell: "animal cell structure diagram",

  };

  const fallbackTerm = fallbackTerms[topicKey] ?? `${topicKey.replace(/_/g, " ")} education diagram`;

  const query = groqQuery ?? {

    imageSearchQuery: fallbackTerm,

    imageAlt: input.slideTitle,

    captionCs: input.slideTitle,

    wikimediaSearchTerm: fallbackTerm,

  };

  const resolved = await resolveSlideImageFromQuery({ ...query, ...input });

  return { ...query, imageUrl: resolved.imageUrl, source: resolved.source };

}



export function resolveStoredSlideImage(

  slide: { title: string; body: string; imageUrl?: string; imageAlt?: string },

  lessonTitle: string,

  courseTopic: string

): string {

  if (slide.imageUrl && !isBrokenSlideImageUrl(slide.imageUrl)) return slide.imageUrl;

  return resolveKeywordImage(`${courseTopic} ${lessonTitle} ${slide.title} ${slide.body}`);

}


