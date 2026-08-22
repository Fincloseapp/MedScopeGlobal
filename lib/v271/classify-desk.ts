import type { ArticleWithRelations } from "@/types/database";

export type PortalDeskId = "public" | "student" | "physician" | "research";

export function classifyPortalDesk(article: ArticleWithRelations): PortalDeskId {
  const meta = (article.metadata ?? {}) as Record<string, unknown>;
  const extra = article as ArticleWithRelations & {
    student_topic?: string | null;
    med_track?: string | null;
  };
  const hay = [
    article.title,
    article.excerpt,
    article.rubric_slug,
    article.public_topic,
    extra.student_topic,
    extra.med_track,
    meta.section,
    meta.public_topic,
  ]
    .filter(Boolean)
    .join(" ");

  if (article.min_access_level === "student" || extra.student_topic || extra.med_track === "priprava" || extra.med_track === "studium") {
    return "student";
  }
  if (
    /studie|pubmed|nejm|lancet|jama|meta-analýz|doi|pmid|výzkum|vyzkum|research/i.test(hay) ||
    article.rubric_slug === "studie" ||
    article.rubric_slug === "studies"
  ) {
    return "research";
  }
  if (
    /přijímač|prijimac|anatomie|fakult|zkoušk|student|biologie|chemie|fyziolog/i.test(hay)
  ) {
    return "student";
  }
  if (
    article.min_access_level === "physician" ||
    article.audience === "professional" ||
    /guideline|ordinac|cme|sÚkl|sukl|člk|clk|klinick/i.test(hay)
  ) {
    return "physician";
  }
  return "public";
}
