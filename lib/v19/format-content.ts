import type { V19ArticlePayload, V19ContentMode } from "@/lib/v19/types";
import { specialtyLabel } from "@/lib/v19/specialties";
import { applyV19Mode } from "@/lib/v19/modes";
import { formatSourceAttribution } from "@/lib/v19/legal";

/** Mobile-optimized HTML — max 2 paragraphs, bullets, no tables. */
export function formatV19ContentHtml(
  article: V19ArticlePayload,
  locale: string,
  mode: V19ContentMode = "doctor"
): string {
  const view = applyV19Mode(article, mode);
  const label = specialtyLabel(view.specialty, locale);
  const bullets = view.keyPoints
    .slice(0, 6)
    .map((p) => `<li>${escapeHtml(p)}</li>`)
    .join("");

  const sourceLabel = formatSourceAttribution(view.sourceName, view.sourceUrl);
  const isCs = locale === "cs" || locale.startsWith("cs");

  const sections = [
    `<p class="v19-summary">${escapeHtml(view.summary)}</p>`,
    `<ul class="v19-keypoints">${bullets}</ul>`,
    `<p class="v19-impact"><strong>${isCs ? "Dopad na praxi" : "Clinical impact"}:</strong> ${escapeHtml(view.clinicalImpact)}</p>`,
  ];

  if (view.scientificContext) {
    sections.push(
      `<p class="v19-science"><strong>${isCs ? "Vědecký kontext" : "Scientific context"}:</strong> ${escapeHtml(view.scientificContext)}</p>`
    );
  }

  if (view.patientEducation && (mode === "patient" || mode === "doctor")) {
    sections.push(
      `<p class="v19-education"><strong>${isCs ? "Edukace pro laiky" : "Patient education"}:</strong> ${escapeHtml(view.patientEducation)}</p>`
    );
  }

  if (view.nzipContext?.trim()) {
    sections.push(
      `<p class="v19-nzip"><strong>${isCs ? "NZIP kontext" : "NZIP context"}:</strong> ${escapeHtml(view.nzipContext)}</p>`
    );
  }

  sections.push(
    `<p class="v19-meta"><span class="v19-specialty">${escapeHtml(label)}</span> · <time datetime="${view.date}">${view.date.slice(0, 10)}</time></p>`,
    `<p class="v19-source"><a href="${escapeHtml(view.sourceUrl)}" rel="noopener noreferrer">${escapeHtml(sourceLabel)}</a></p>`,
    `<p class="v19-disclaimer text-xs text-muted-foreground">${isCs ? "Informativní shrnutí — není lékařská rada." : "Informational summary — not medical advice."}</p>`
  );

  return sections.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
