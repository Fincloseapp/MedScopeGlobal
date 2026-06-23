import type { V24ContentDraft } from "@/lib/v24/types";

export function generateDiagramSvg(
  draft: V24ContentDraft,
  meta: { alt: string; style: string }
) {
  const items =
    draft.differentialDiagnosis?.slice(0, 4) ??
    draft.treatmentPlan?.slice(0, 4) ??
    draft.keywords.slice(0, 4);

  const nodes = items
    .map(
      (item, i) =>
        `<text x="40" y="${60 + i * 36}" font-family="system-ui,sans-serif" font-size="14" fill="#0f3d5c">${escapeXml(item.slice(0, 48))}</text>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" role="img" aria-label="${escapeXml(meta.alt)}">
  <rect width="100%" height="100%" fill="#f8fbfd"/>
  <rect x="16" y="16" width="608" height="288" rx="12" fill="#ffffff" stroke="#c5d9e8"/>
  <text x="40" y="44" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="#021d33">${escapeXml(draft.title.slice(0, 60))}</text>
  ${nodes}
  <text x="40" y="300" font-size="10" fill="#6b7c8f">MedScopeGlobal v24 — ${escapeXml(draft.section)}</text>
</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
