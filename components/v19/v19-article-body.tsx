import type { V19BriefArticle } from "@/components/v19/article-brief-card";
import { specialtyLabel } from "@/lib/v19/specialties";
import type { V19Specialty } from "@/lib/v19/types";

/** Mobile-first renderer for v19 medical briefs on article detail pages. */
export function V19ArticleBody({
  article,
  locale = "cs",
}: {
  article: V19BriefArticle & { specialty?: string };
  locale?: string;
}) {
  const points = (article.keyPoints ?? []).slice(0, 6);
  const spec =
    article.specialty &&
    specialtyLabel(article.specialty as V19Specialty, locale);

  return (
    <article className="v19-article-body max-w-3xl overflow-x-hidden text-base leading-relaxed text-slate-800">
      {spec && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          {spec}
        </p>
      )}
      <p className="text-sm leading-6 sm:text-base">{article.summary}</p>
      {points.length > 0 && (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 sm:text-base">
          {points.map((point) => (
            <li key={point.slice(0, 48)}>{point}</li>
          ))}
        </ul>
      )}
      {article.clinicalImpact && (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6">
          <span className="font-semibold text-slate-900">
            {locale === "cs" ? "Dopad na klinickou praxi: " : "Clinical impact: "}
          </span>
          {article.clinicalImpact}
        </p>
      )}
      {article.sourceUrl && article.sourceName && (
        <p className="mt-4 text-sm">
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
      <p className="mt-6 text-xs text-muted-foreground">
        {locale === "cs"
          ? "Informativní shrnutí — není lékařská rada. Vždy konzultujte odborníka."
          : "Informational summary — not medical advice. Consult a qualified professional."}
      </p>
    </article>
  );
}
