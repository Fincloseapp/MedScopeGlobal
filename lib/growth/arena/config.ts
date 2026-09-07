/** Competing AI teams for legal organic growth. Priority 3 → 2 → 1. */

export const ARENA_TEAM_SLUGS = ["alfa", "beta"] as const;
export type ArenaTeamSlug = (typeof ARENA_TEAM_SLUGS)[number];

export const ARENA_ROLES = ["content", "distribution", "analyst"] as const;
export type ArenaRole = (typeof ARENA_ROLES)[number];

export const ARENA_SECTIONS = [
  {
    id: "vialongevita",
    priority: 3,
    path: "/predplatne",
    label: "ViaLongeVita",
    czechOnly: false,
    affiliateFree: false,
  },
  {
    id: "dokscope",
    priority: 2,
    path: "/lekari",
    label: "DokScope",
    czechOnly: false,
    affiliateFree: true,
  },
  {
    id: "mediprep",
    priority: 1,
    path: "/mediprep",
    label: "MeDiprep",
    czechOnly: true,
    affiliateFree: true,
  },
] as const;

export type ArenaSectionId = (typeof ARENA_SECTIONS)[number]["id"];

export const ARENA_SECTION_IDS = ARENA_SECTIONS.map((row) => row.id);

export const K_FACTOR_SHARE_THRESHOLD = 1.5;
export const K_FACTOR_WINDOW_MS = 10 * 60 * 1000;
export const HOURLY_WINDOW_MS = 60 * 60 * 1000;
export const SPAM_TEAM_PENALTY = -50_000;
export const SECTION3_MILESTONE = 50_000;
export const SECTION3_MILESTONE_POINTS = 8_000;
export const LOSING_STREAK_KILL = 6;
export const REACH_QUOTA_MIN = 22;
export const REACH_QUOTA_MAX = 240;
export const REACH_QUOTA_DEFAULT = 80;
export const MESSAGE_LIMIT_DEFAULT = 80;

export const CONTENT_STYLES = [
  "clinical-short",
  "prevention-habit",
  "sleep-focus",
  "movement-nudge",
  "nutrition-evidence",
] as const;
export type ContentStyle = (typeof CONTENT_STYLES)[number];

export type SocialNetwork =
  | "x"
  | "reddit"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "linkedin";

export type SocialAccount = {
  id: string;
  network: SocialNetwork;
  handle: string;
  organicWeight: number;
};

export const HUMAN_SOCIAL_NETWORKS = ["instagram", "facebook", "whatsapp", "linkedin"] as const;

export const TEAM_SEED: Record<
  ArenaTeamSlug,
  { name: string; accounts: SocialAccount[]; styleBias: ContentStyle }
> = {
  alfa: {
    name: "Tým Alfa",
    styleBias: "clinical-short",
    accounts: [
      { id: "alfa-x", network: "x", handle: "@vialongevita_alfa", organicWeight: 1 },
      { id: "alfa-reddit", network: "reddit", handle: "u/vialongevita_alfa", organicWeight: 0.9 },
      { id: "alfa-tiktok", network: "tiktok", handle: "@vialongevita_alfa", organicWeight: 0.7 },
      { id: "alfa-ig", network: "instagram", handle: "instagram (fronta draftů)", organicWeight: 1.1 },
      { id: "alfa-fb", network: "facebook", handle: "facebook (fronta draftů)", organicWeight: 1.1 },
      { id: "alfa-wa", network: "whatsapp", handle: "whatsapp (fronta draftů)", organicWeight: 1.2 },
      { id: "alfa-li", network: "linkedin", handle: "linkedin (fronta draftů)", organicWeight: 1 },
    ],
  },
  beta: {
    name: "Tým Beta",
    styleBias: "prevention-habit",
    accounts: [
      { id: "beta-x", network: "x", handle: "@vialongevita_beta", organicWeight: 0.85 },
      { id: "beta-reddit", network: "reddit", handle: "u/vialongevita_beta", organicWeight: 0.8 },
      { id: "beta-tiktok", network: "tiktok", handle: "@vialongevita_beta", organicWeight: 0.6 },
      { id: "beta-ig", network: "instagram", handle: "instagram (fronta draftů)", organicWeight: 1 },
      { id: "beta-fb", network: "facebook", handle: "facebook (fronta draftů)", organicWeight: 1 },
      { id: "beta-wa", network: "whatsapp", handle: "whatsapp (fronta draftů)", organicWeight: 1.15 },
      { id: "beta-li", network: "linkedin", handle: "linkedin (fronta draftů)", organicWeight: 0.95 },
    ],
  },
};

export function sectionsByPriority(): typeof ARENA_SECTIONS {
  return [...ARENA_SECTIONS].sort((a, b) => b.priority - a.priority) as unknown as typeof ARENA_SECTIONS;
}

export function sectionById(id?: string | null) {
  return ARENA_SECTIONS.find((row) => row.id === id) ?? ARENA_SECTIONS[0];
}

export function isArenaTeamSlug(value?: string | null): value is ArenaTeamSlug {
  return ARENA_TEAM_SLUGS.includes(String(value ?? "") as ArenaTeamSlug);
}
