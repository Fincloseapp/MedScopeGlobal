import Link from "next/link";
import { specialtyLabel } from "@/lib/v19/specialties";
import type { V19ContentMode, V19Specialty } from "@/lib/v19/types";
import { V19NzipTagChips } from "@/components/v19/nzip-topic-card";

export type V19BriefArticle = {
  id?: string;
  slug?: string;
  title: string;
  date: string;
  summary: string;
  keyPoints?: string[];
  clinicalImpact?: string;
  scientificContext?: string;
  patientEducation?: string;
  nzipContext?: string;
  nzipTopicTags?: string[];
  nzipCategoryTags?: string[];
  specialty?: string;
  sourceUrl?: string;
  sourceName?: string;
  mode?: V19ContentMode;
  articleType?: string;
  keywords?: string[];
};

export function V19ArticleBriefCard({
  article,
  locale = "cs",
}: {
  article: V19BriefArticle;
  locale?: string;
}) {
  const href = article.slug ? `/article/${article.slug}` : "#";
  const points = (article.keyPoints ?? []).slice(0, 6);
  const dateLabel = article.date?.slice(0, 10) ?? "";
  const specLabel =
    article.specialty &&
    specialtyLabel(article.specialty as V19Specialty, locale);
  const isPatient = article.mode === "patient";

  return (
    <article className="v19-brief-card rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <header className="mb-3 space-y-1">
        {specLabel && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            {specLabel}
          </p>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-medical-navy sm:text-xl">
          <Link href={href} className="hover:text-[#005B96]">
            {article.title}
          </Link>
        </h3>
        {dateLabel && (
          <time className="text-xs text-muted-foreground" dateTime={article.date}>
            {dateLabel}
          </time>
        )}
      </header>

      <p className="text-sm leading-6 text-slate-700">{article.summary}</p>

      {points.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
          {points.map((point) => (
            <li key={point.slice(0, 40)}>{point}</li>
          ))}
        </ul>
      )}

      {article.clinicalImpact && !isPatient && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            {locale === "cs" ? "Dopad: " : "Impact: "}
          </span>
          {article.clinicalImpact}
        </p>
      )}

      {article.patientEducation && isPatient && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            {locale === "cs" ? "Pro pacienty: " : "For patients: "}
          </span>
          {article.patientEducation}
        </p>
      )}

      {article.scientificContext && article.mode === "scientist" && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            {locale === "cs" ? "Věda: " : "Science: "}
          </span>
          {article.scientificContext}
        </p>
      )}

      <V19NzipTagChips
        tags={[...(article.nzipTopicTags ?? []), ...(article.nzipCategoryTags ?? [])]}
      />

      {article.nzipContext && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">NZIP: </span>
          {article.nzipContext}
        </p>
      )}

      {article.sourceUrl && article.sourceName && (
        <p className="mt-3 text-xs">
          <a
            href={article.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="font-medium text-[#005B96] underline-offset-2 hover:underline"
          >
            {article.sourceName}
          </a>
        </p>
      )}
    </article>
  );
}
