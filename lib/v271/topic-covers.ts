/** Topic-matched covers — prefer a real stored URL, then a curated Unsplash pool. */

import { hasBadUnsplashId } from "@/lib/v25/images/bad-unsplash-ids";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=675&fit=crop&q=80&auto=format&fm=webp`;

/** Known-good clinical / campus stock — no IDs from BAD_UNSPLASH_IDS. */
export const FALLBACK_DISPLAY_COVER = "/assets/medscopeglobal-research-workstation.png";

const ORIGINAL = {
  cardiology: "/assets/medscope-cardiology-editorial-v2.png",
  neuroscience: "/assets/medscope-neuroscience-editorial-v2.png",
  pharmacology: "/assets/medscope-pharmacology-editorial.png",
  students: "/assets/medscope-students-editorial.png",
  prevention: "/assets/medscope-prevention-editorial.png",
  sleep: "/assets/medscope-sleep-editorial.png",
  research: "/assets/medscopeglobal-research-workstation.png",
  digital: "/assets/medscopeglobal-digital-health-specialist.png",
} as const;

const POOLS: Record<string, string[]> = {
  kardiologie: [ORIGINAL.cardiology],
  farmakologie: [
    ORIGINAL.pharmacology,
    unsplash("1584308664744-24d5c474f2ae"),
    unsplash("1576602976047-174e57a47881"),
  ],
  studenti: [
    ORIGINAL.students,
    unsplash("1481627834876-b7833e8f5570"),
    unsplash("1434030216411-0b793f4b4173"),
    unsplash("1523050854058-8df90110c9f1"),
  ],
  dlouhovekost: [
    unsplash("1474413039615-0b2219e019d0"),
    unsplash("1469474968028-56623f02e42e"),
    unsplash("1544367567-0f2fcb009e0b"),
  ],
  prevence: [
    ORIGINAL.prevention,
    unsplash("1576091160399-112ba8d25d1d"),
    unsplash("1516545595035-b494dd0161e4"),
  ],
  "zivotni-styl": [
    ORIGINAL.prevention,
    unsplash("1490645935967-10de6ba17061"),
    unsplash("1517836357463-d25dfeac3438"),
  ],
  nemoci: [
    unsplash("1576086213369-97a306d36557"),
    unsplash("1582719471384-894fbb16e074"),
    unsplash("1559757175-0eb30cd8c063"),
  ],
  spanku: [ORIGINAL.sleep],
  vyziva: [unsplash("1490645935967-10de6ba17061"), unsplash("1512621776951-a57141f2eefd")],
  zpravy: [
    unsplash("1504711434969-e33886168f5c"),
    unsplash("1454165804606-c3d57bc86b40"),
    unsplash("1450101215322-bf5cd27642fc"),
  ],
  vyzkum: [
    ORIGINAL.research,
    unsplash("1532187863486-abf9dbad1b69"),
    unsplash("1582719471384-894fbb16e074"),
  ],
  digitalni: [ORIGINAL.digital],
  medicina: [ORIGINAL.prevention, ORIGINAL.research, unsplash("1584515930387-285e4804f4cb")],
  mozek: [ORIGINAL.neuroscience],
  plice: [unsplash("1576091160399-112ba8d25d1d"), unsplash("1584515930387-285e4804f4cb")],
  tehotenstvi: [unsplash("1555255707-c07966088b7b"), unsplash("1476703993599-aa3d1c2cdcee")],
  zuby: [unsplash("1606811841689-23dfddce3e95"), unsplash("1576091160399-112ba8d25d1d")],
};

const TOPIC_RULES: Array<{ key: keyof typeof POOLS; re: RegExp }> = [
  { key: "spanku", re: /spánek|spanek|spánkov|spankov|nespavost|melatonin|circadian/i },
  { key: "kardiologie", re: /kardio|srdce|infarkt|tlak|cholesterol|apob|ecg|ekg|fibril|tep/i },
  { key: "mozek", re: /mozek|mozku|neurol|alzheimer|migré|migre|demenc|depres|úzkost|uzkost/i },
  { key: "plice", re: /plíc|plic|astma|chřip|chrip|covid|respir|kašel|kasel/i },
  { key: "tehotenstvi", re: /těhot|tehot|porod|kojen|prenat/i },
  { key: "zuby", re: /zub|dentál|dental|ústní|ustni hyg/i },
  { key: "digitalni", re: /\bai\b|umělá inteligence|umela inteligence|digitální|digitalni|software|aplikac|telemed|počítač|pocitac|databáz|databaz/i },
  {
    key: "farmakologie",
    re: /\blék(?:y|u|ů|ům|em|ách|ový|ová|ové)?\b|\blek(?:y|u|um|em|ach|ovy|ova|ove)?\b|léčiv|leciv|glp-1|vakcín|vakcin|súkl|sukl|farmako|pilul|dávkov/i,
  },
  {
    key: "studenti",
    re: /student|přijímač|prijimac|anatomie|fakult|zkoušk|zkousk|učebn|semestr|výuc|vyuc|vzděláv|vzdelav/i,
  },
  {
    key: "dlouhovekost",
    re: /dlouhověk|dlouhovek|longevity|healthspan|stárnut|starnut|vo2|sarkopen|žít déle|zit dele|biologický věk|biologicky vek/i,
  },
  { key: "vyziva", re: /výživ|vyziv|jídel|jideln|protein|kalor|obezit/i },
  { key: "prevence", re: /prevenc|screening|očkov|ockov|mammograf|prohlídk/i },
  {
    key: "zivotni-styl",
    re: /pohyb|fitness|stres|životní styl|zivotni styl|pohybov|lepší zdraví|lepsi zdravi|zdravý život|zdravy zivot|praktické rady|prakticke rady|zdraví pro každého|zdravi pro kazdeho|kouč|kouc/i,
  },
  { key: "nemoci", re: /nemoc|diagnóz|onemocn|diabet|infekc|rakovin|vir|bakter|potíž|potiz/i },
  { key: "zpravy", re: /who|ema|cdc|mzčr|mzd|epidem|outbreak|zpráv|úřad/i },
  { key: "vyzkum", re: /studie|výzkum|vyzkum|nejm|lancet|pubmed|meta-analýz|rct|doi/i },
];

function hashTitle(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i += 1) h = (h * 31 + title.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function resolveTopicKey(title: string, category?: string | null, excerpt?: string | null) {
  for (const rule of TOPIC_RULES) {
    if (rule.re.test(title)) return rule.key;
  }
  const context = `${category ?? ""} ${excerpt ?? ""}`;
  for (const rule of TOPIC_RULES) {
    if (rule.re.test(context)) return rule.key;
  }
  return "medicina";
}

const LOCAL_FALLBACK_BY_TOPIC: Record<string, string> = {
  kardiologie: ORIGINAL.cardiology,
  farmakologie: ORIGINAL.pharmacology,
  studenti: ORIGINAL.students,
  dlouhovekost: ORIGINAL.prevention,
  prevence: ORIGINAL.prevention,
  "zivotni-styl": ORIGINAL.prevention,
  nemoci: ORIGINAL.research,
  spanku: ORIGINAL.sleep,
  vyziva: ORIGINAL.prevention,
  zpravy: ORIGINAL.research,
  vyzkum: ORIGINAL.research,
  digitalni: ORIGINAL.digital,
  medicina: ORIGINAL.research,
  mozek: ORIGINAL.neuroscience,
  plice: ORIGINAL.prevention,
  tehotenstvi: ORIGINAL.prevention,
  zuby: ORIGINAL.prevention,
};

export function resolveTopicFallbackCover(input: {
  title: string;
  category?: string | null;
  excerpt?: string | null;
}) {
  const key = resolveTopicKey(input.title, input.category, input.excerpt);
  return LOCAL_FALLBACK_BY_TOPIC[key] ?? FALLBACK_DISPLAY_COVER;
}

export function isUsableCoverUrl(url?: string | null): boolean {
  const u = url?.trim() ?? "";
  if (!u) return false;
  if (!/^https?:\/\//i.test(u) && !u.startsWith("/assets/")) return false;
  if (/\.svg(\?|$)/i.test(u)) return false;
  if (/\/api\/v25\/images\/render/i.test(u)) return false;
  if (hasBadUnsplashId(u)) return false;
  return true;
}

export function resolveDisplayCover(input: {
  title: string;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
}) {
  const stored = input.coverUrl?.trim();
  // Preserve owned assets and real editorial uploads. Legacy pipeline images and stock
  // URLs are re-selected from the article text so stale generic visuals cannot dominate.
  const isLegacyGeneratedCover =
    /\/storage\/v1\/object\/public\/media\/v25-images\/images\//i.test(stored ?? "");
  const isSharedEditorialFallback =
    /^\/assets\/(?:medscopeglobal-(?:research-workstation|digital-health-specialist)|medscope-(?:cardiology-editorial-v2|neuroscience-editorial-v2|pharmacology-editorial|students-editorial|prevention-editorial|sleep-editorial))\.png$/i.test(
      stored ?? ""
    );
  if (
    isUsableCoverUrl(stored) &&
    !/images\.unsplash\.com/i.test(stored!) &&
    !isLegacyGeneratedCover &&
    !isSharedEditorialFallback
  ) {
    return stored!;
  }
  const key = resolveTopicKey(input.title, input.category, input.excerpt);
  const pool = POOLS[key] ?? POOLS.medicina;
  return pool[hashTitle(`${input.title}|${key}`) % pool.length] ?? FALLBACK_DISPLAY_COVER;
}

export function isGenericCoverUrl(url?: string | null) {
  return !isUsableCoverUrl(url);
}
