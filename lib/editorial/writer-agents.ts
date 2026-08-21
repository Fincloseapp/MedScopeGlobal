/**
 * Daily public-article cron agents (writer1–5).
 * Visual marks are editorial geometry — no personal portraits or bylines.
 */

export type WriterAgentId = "writer1" | "writer2" | "writer3" | "writer4" | "writer5";

export type WriterAgentMarkKind = "lifestyle" | "clinical" | "shield" | "interview" | "longevity";

export type WriterAgent = {
  id: WriterAgentId;
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

export const WRITER_AGENTS: WriterAgent[] = [
  {
    id: "writer1",
    label: "Životní styl",
    topic: "zivotni-styl",
    topicLabel: "Životní styl",
    hint: "spánek, pohyb, výživa",
    href: "/verejnost/clanky?topic=zivotni-styl",
    cron: "/api/cron/public-articles",
    accent: "#0f7a6c",
    accentSoft: "#e6f6f2",
    mark: "lifestyle",
  },
  {
    id: "writer2",
    label: "Nemoci",
    topic: "nemoci",
    topicLabel: "Nemoci",
    hint: "srozumitelně, bez strašení",
    href: "/verejnost/clanky?topic=nemoci",
    cron: "/api/cron/public-articles",
    accent: "#005B96",
    accentSoft: "#e8f3fb",
    mark: "clinical",
  },
  {
    id: "writer3",
    label: "Prevence",
    topic: "prevence",
    topicLabel: "Prevence",
    hint: "screening a návyky",
    href: "/verejnost/clanky?topic=prevence",
    cron: "/api/cron/public-articles",
    accent: "#b45309",
    accentSoft: "#fef3c7",
    mark: "shield",
  },
  {
    id: "writer4",
    label: "Rozhovory",
    topic: "rozhovory",
    topicLabel: "Rozhovory",
    hint: "příběhy a Q&A",
    href: "/verejnost/clanky?topic=rozhovory",
    cron: "/api/cron/public-articles",
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    mark: "interview",
  },
  {
    id: "writer5",
    label: "Dlouhověkost",
    topic: "dlouhovekost",
    topicLabel: "Dlouhověkost",
    hint: "healthspan a biomarkery",
    href: "/verejnost/clanky?topic=dlouhovekost",
    cron: "/api/cron/public-articles",
    accent: "#0f3d5c",
    accentSoft: "#dbeafe",
    mark: "longevity",
  },
];

export const WRITING_STYLE_MARKS: Record<string, WritingStyleMark> = {
  analytik: { id: "analytik", label: "Analytik", hint: "data a studie" },
  "vypravěč": { id: "vypravěč", label: "Vypravěč", hint: "scény z života" },
  "reportér": { id: "reportér", label: "Reportér", hint: "zpravodajský lead" },
  "komentátor": { id: "komentátor", label: "Komentátor", hint: "kontext z praxe" },
  empatik: { id: "empatik", label: "Empatik", hint: "podpůrný tón" },
  "investigativní": { id: "investigativní", label: "Investigativní", hint: "mýty vs. data" },
  "popularizátor": { id: "popularizátor", label: "Popularizátor", hint: "analogie z běžného dne" },
};

const TOPIC_TO_WRITER: Record<string, WriterAgentId> = {
  "zivotni-styl": "writer1",
  nemoci: "writer2",
  prevence: "writer3",
  rozhovory: "writer4",
  dlouhovekost: "writer5",
};

export type ArticleForWriterAgent = {
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
};

function isWriterAgentId(value: string): value is WriterAgentId {
  return WRITER_AGENTS.some((agent) => agent.id === value);
}

function metadataRecord(metadata: ArticleForWriterAgent["metadata"]): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata;
  }
  return {};
}

export function getWriterAgent(id: WriterAgentId): WriterAgent {
  return WRITER_AGENTS.find((agent) => agent.id === id) ?? WRITER_AGENTS[0]!;
}

export function resolveWritingStyle(article: ArticleForWriterAgent): WritingStyleMark | null {
  const meta = metadataRecord(article.metadata);
  const raw = String(meta.writing_style ?? meta.author_persona ?? "").trim();
  if (!raw) return null;
  return WRITING_STYLE_MARKS[raw] ?? { id: raw, label: raw, hint: "redakční styl" };
}

/** Map a published article to the daily cron writer that produced (or owns) it. */
export function resolveWriterAgent(article: ArticleForWriterAgent): WriterAgent | null {
  const meta = metadataRecord(article.metadata);
  const writerId = String(meta.writer_id ?? "").trim();
  if (isWriterAgentId(writerId)) return getWriterAgent(writerId);

  const internal = String(meta.internal_topic ?? meta.content_pillar ?? "")
    .toLowerCase()
    .trim();
  if (internal === "dlouhovekost") return getWriterAgent("writer5");

  const topic = String(article.public_topic ?? "").toLowerCase().trim();
  if (topic && TOPIC_TO_WRITER[topic]) return getWriterAgent(TOPIC_TO_WRITER[topic]!);

  return null;
}
