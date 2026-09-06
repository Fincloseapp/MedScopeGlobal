/**
 * Daily public-article cron agents.
 * 5 categories × 4 senior specialists = 20 writers.
 * Visual marks are editorial geometry — no personal portraits or bylines.
 */

export type WriterDeskId = "writer1" | "writer2" | "writer3" | "writer4" | "writer5";

export type WriterSpecialtyId = "practice" | "research" | "trends" | "field";

export type WriterAgentId = WriterDeskId | `${WriterDeskId}-${WriterSpecialtyId}`;

export type WriterAgentMarkKind = "lifestyle" | "clinical" | "shield" | "interview" | "longevity";

export type WriterAgent = {
  id: WriterAgentId;
  deskId: WriterDeskId;
  specialty: WriterSpecialtyId | "desk";
  label: string;
  topic: string;
  topicLabel: string;
  hint: string;
  href: string;
  cron: "/api/cron/public-articles";
  accent: string;
  accentSoft: string;
  mark: WriterAgentMarkKind;
};

export type WritingStyleMark = {
  id: string;
  label: string;
  hint: string;
};

export const WRITER_SPECIALTY_IDS: WriterSpecialtyId[] = [
  "practice",
  "research",
  "trends",
  "field",
];

export const WRITERS_PER_CATEGORY = WRITER_SPECIALTY_IDS.length;

type DeskSeed = {
  deskId: WriterDeskId;
  topic: string;
  topicLabel: string;
  hint: string;
  href: string;
  accent: string;
  accentSoft: string;
  mark: WriterAgentMarkKind;
};

const DESK_SEEDS: DeskSeed[] = [
  {
    deskId: "writer1",
    topic: "zivotni-styl",
    topicLabel: "Životní styl",
    hint: "spánek, pohyb, výživa",
    href: "/verejnost/clanky?topic=zivotni-styl",
    accent: "#0f7a6c",
    accentSoft: "#e6f6f2",
    mark: "lifestyle",
  },
  {
    deskId: "writer2",
    topic: "nemoci",
    topicLabel: "Nemoci",
    hint: "srozumitelně, bez strašení",
    href: "/verejnost/clanky?topic=nemoci",
    accent: "#005B96",
    accentSoft: "#e8f3fb",
    mark: "clinical",
  },
  {
    deskId: "writer3",
    topic: "prevence",
    topicLabel: "Prevence",
    hint: "screening a návyky",
    href: "/verejnost/clanky?topic=prevence",
    accent: "#b45309",
    accentSoft: "#fef3c7",
    mark: "shield",
  },
  {
    deskId: "writer4",
    topic: "rozhovory",
    topicLabel: "Rozhovory",
    hint: "příběhy a Q&A",
    href: "/verejnost/clanky?topic=rozhovory",
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    mark: "interview",
  },
  {
    deskId: "writer5",
    topic: "dlouhovekost",
    topicLabel: "Dlouhověkost",
    hint: "healthspan a biomarkery",
    href: "/verejnost/clanky?topic=dlouhovekost",
    accent: "#0f3d5c",
    accentSoft: "#dbeafe",
    mark: "longevity",
  },
];

export const WRITER_SPECIALTY_COPY: Record<
  WriterSpecialtyId,
  Record<"cs" | "en" | "de" | "fr", { label: string; hint: string }>
> = {
  practice: {
    cs: { label: "Klinická praxe", hint: "seniorní praxe i ordinace" },
    en: { label: "Clinical practice", hint: "senior bedside experience" },
    de: { label: "Klinische Praxis", hint: "langjährige Praxis" },
    fr: { label: "Pratique clinique", hint: "expérience de cabinet" },
  },
  research: {
    cs: { label: "Výzkum", hint: "studie a přenos do praxe" },
    en: { label: "Research", hint: "studies into practice" },
    de: { label: "Forschung", hint: "Studien in die Praxis" },
    fr: { label: "Recherche", hint: "études vers la pratique" },
  },
  trends: {
    cs: { label: "Trendy", hint: "aktivní hledání témat" },
    en: { label: "Trends", hint: "active topic scouting" },
    de: { label: "Trends", hint: "aktive Themensuche" },
    fr: { label: "Tendances", hint: "veille des sujets" },
  },
  field: {
    cs: { label: "Přehled z terénu", hint: "užitečnost a návrat ke čtení" },
    en: { label: "Field overview", hint: "usefulness and return reading" },
    de: { label: "Überblick", hint: "Alltag und Wiederkehr" },
    fr: { label: "Terrain", hint: "utilité et fidélité" },
  },
};

function deskAgent(seed: DeskSeed): WriterAgent {
  return {
    id: seed.deskId,
    deskId: seed.deskId,
    specialty: "desk",
    label: seed.topicLabel,
    topic: seed.topic,
    topicLabel: seed.topicLabel,
    hint: seed.hint,
    href: seed.href,
    cron: "/api/cron/public-articles",
    accent: seed.accent,
    accentSoft: seed.accentSoft,
    mark: seed.mark,
  };
}

function specialistAgent(seed: DeskSeed, specialty: WriterSpecialtyId): WriterAgent {
  const spec = WRITER_SPECIALTY_COPY[specialty].cs;
  return {
    id: `${seed.deskId}-${specialty}`,
    deskId: seed.deskId,
    specialty,
    label: `${seed.topicLabel} · ${spec.label}`,
    topic: seed.topic,
    topicLabel: seed.topicLabel,
    hint: spec.hint,
    href: seed.href,
    cron: "/api/cron/public-articles",
    accent: seed.accent,
    accentSoft: seed.accentSoft,
    mark: seed.mark,
  };
}

/** Five category desks — public navigation / topic mapping. */
export const WRITER_DESKS: WriterAgent[] = DESK_SEEDS.map(deskAgent);

/** Twenty senior specialists — 4 per category, daily production roster. */
export const WRITER_SPECIALISTS: WriterAgent[] = DESK_SEEDS.flatMap((seed) =>
  WRITER_SPECIALTY_IDS.map((specialty) => specialistAgent(seed, specialty))
);

/** Deployed autonomous public writers (20). */
export const WRITER_AGENTS: WriterAgent[] = WRITER_SPECIALISTS;

const ALL_WRITER_AGENTS: WriterAgent[] = [...WRITER_DESKS, ...WRITER_SPECIALISTS];

export const WRITING_STYLE_MARKS: Record<string, WritingStyleMark> = {
  analytik: { id: "analytik", label: "Analytik", hint: "data a studie" },
  "vypravěč": { id: "vypravěč", label: "Vypravěč", hint: "scény z života" },
  "reportér": { id: "reportér", label: "Reportér", hint: "zpravodajský lead" },
  "komentátor": { id: "komentátor", label: "Komentátor", hint: "kontext z praxe" },
  empatik: { id: "empatik", label: "Empatik", hint: "podpůrný tón" },
  "investigativní": { id: "investigativní", label: "Investigativní", hint: "mýty vs. data" },
  "popularizátor": { id: "popularizátor", label: "Popularizátor", hint: "analogie z běžného dne" },
};

const TOPIC_TO_DESK: Record<string, WriterDeskId> = {
  "zivotni-styl": "writer1",
  nemoci: "writer2",
  prevence: "writer3",
  rozhovory: "writer4",
  dlouhovekost: "writer5",
};

export function writerSpecialtyCopy(
  specialty: WriterSpecialtyId,
  locale: string = "cs"
): { label: string; hint: string } {
  const row = WRITER_SPECIALTY_COPY[specialty];
  const key = locale.toLowerCase();
  if (key.startsWith("cs")) return row.cs;
  if (key.startsWith("de")) return row.de;
  if (key.startsWith("fr")) return row.fr;
  return row.en;
}

export function isWriterDeskId(value: string): value is WriterDeskId {
  return WRITER_DESKS.some((desk) => desk.id === value);
}

export function isWriterAgentId(value: string): value is WriterAgentId {
  return ALL_WRITER_AGENTS.some((agent) => agent.id === value);
}

export function getWriterDesk(id: WriterDeskId): WriterAgent {
  return WRITER_DESKS.find((desk) => desk.id === id) ?? WRITER_DESKS[0]!;
}

export function getWriterAgent(id: WriterAgentId): WriterAgent {
  return ALL_WRITER_AGENTS.find((agent) => agent.id === id) ?? WRITER_SPECIALISTS[0]!;
}

export function specialistsForDesk(deskId: WriterDeskId): WriterAgent[] {
  return WRITER_SPECIALISTS.filter((agent) => agent.deskId === deskId);
}

export type ArticleForWriterAgent = {
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
};

function metadataRecord(article: ArticleForWriterAgent): Record<string, unknown> {
  const metadata = article.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata;
  }
  return {};
}

export function resolveWritingStyle(article: ArticleForWriterAgent): WritingStyleMark | null {
  const meta = metadataRecord(article);
  const raw = String(meta.writing_style ?? meta.author_persona ?? "").trim();
  if (!raw) return null;
  return WRITING_STYLE_MARKS[raw] ?? { id: raw, label: raw, hint: "redakční styl" };
}

/** Map a published article to the daily cron writer that produced (or owns) it. */
export function resolveWriterAgent(article: ArticleForWriterAgent): WriterAgent | null {
  const meta = metadataRecord(article);
  const writerId = String(meta.writer_id ?? "").trim();
  if (isWriterAgentId(writerId)) return getWriterAgent(writerId);

  const specialtyRaw = String(meta.writer_specialty ?? "").trim();
  const internal = String(meta.internal_topic ?? meta.content_pillar ?? "")
    .toLowerCase()
    .trim();
  if (internal === "dlouhovekost") {
    if (WRITER_SPECIALTY_IDS.includes(specialtyRaw as WriterSpecialtyId)) {
      return getWriterAgent(`writer5-${specialtyRaw as WriterSpecialtyId}`);
    }
    return getWriterDesk("writer5");
  }

  const topic = String(article.public_topic ?? "").toLowerCase().trim();
  if (topic && TOPIC_TO_DESK[topic]) {
    const deskId = TOPIC_TO_DESK[topic]!;
    if (WRITER_SPECIALTY_IDS.includes(specialtyRaw as WriterSpecialtyId)) {
      return getWriterAgent(`${deskId}-${specialtyRaw as WriterSpecialtyId}`);
    }
    return getWriterDesk(deskId);
  }

  return null;
}
