import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { V19_RUBRIC_SLUG, V24_RUBRIC_SLUG } from "@/lib/config/section-article-map";

const CLINICAL_EN =
  /\b(guideline|guidelines|delphi|consensus|acep|patients?|trial|randomized|approved by the|clinical practice|procedural sedation|multidisciplinary)\b/i;

const CZECH_DIACRITICS = /[áčďéěíňóřšťúůýž]/i;

export type ProfessionalArticleLike = {
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  locale?: string | null;
  audience?: string | null;
  public_topic?: string | null;
  rubric_slug?: string | null;
  min_access_level?: string | null;
  metadata?: Record<string, unknown> | null;
};

function hasLayMagazineSignals(article: ProfessionalArticleLike): boolean {
  if (article.public_topic) return true;
  if (article.slug.startsWith("verejnost-")) return true;
  const rubric = article.rubric_slug ?? "";
  return rubric === "verejnost" || rubric === "ai-lay-summary" || rubric === "ai-patient-education";
}

/** Lay magazine pieces stay open. Highly clinical items need ČLK verification. */
export function isPhysicianRestrictedArticle(article: ProfessionalArticleLike): boolean {
  if (hasLayMagazineSignals(article)) return false;

  const level = (article.min_access_level ?? "public").toLowerCase();
  if (level === "physician") return true;

  const audience = (article.audience ?? "").toLowerCase();
  if (audience === "professional" || audience === "physician") return true;

  const rubric = article.rubric_slug ?? "";
  if (rubric === V19_RUBRIC_SLUG || rubric === V24_RUBRIC_SLUG || rubric === "odborna") {
    return true;
  }

  const title = article.title ?? "";
  if (article.locale === "en") return true;
  if (CLINICAL_EN.test(title) && !CZECH_DIACRITICS.test(title)) return true;

  if (resolveWriterAgent(article)) return false;
  return false;
}
