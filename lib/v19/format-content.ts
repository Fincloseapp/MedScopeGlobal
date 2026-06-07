import type { V19ArticlePayload } from "@/lib/v19/types";
import { specialtyLabel } from "@/lib/v19/specialties";

/** Mobile-optimized HTML — max 2 paragraphs, bullets, no tables. */
export function formatV19ContentHtml(article: V19ArticlePayload, locale: string): string {
  const label = specialtyLabel(article.specialty, locale);
  const bullets = article.keyPoints
    .slice(0, 6)
    .map((p) => `<li>${escapeHtml(p)}</li>`)
    .join("");

  return [
    `<p class="v19-summary">${escapeHtml(article.summary)}</p>`,
  article.summary.includes(".")
    ? ""
    : "",
    `<ul class="v19-keypoints">${bullets}</ul>`,
    `<p class="v19-impact"><strong>${locale === "cs" ? "Dopad na praxi" : "Clinical impact"}:</strong> ${escapeHtml(article.clinicalImpact)}</p>`,
    `<p class="v19-meta"><span class="v19-specialty">${escapeHtml(label)}</span> · <time datetime="${article.date}">${article.date.slice(0, 10)}</time></p>`,
    `<p class="v19-source"><a href="${escapeHtml(article.sourceUrl)}" rel="noopener noreferrer">${escapeHtml(article.sourceName)}</a></p>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
