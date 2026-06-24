import type { StudyRow } from "@/lib/queries/v4c/studies";

/** Detect circular placeholder study copy from automated ingest. */
export function isGenericPlaceholderStudy(study: StudyRow): boolean {
  const blob = [study.title, study.summary, study.abstract].filter(Boolean).join(" ").toLowerCase();

  if (/zaměřuje na revmatologie v kontextu revmatologie/i.test(blob)) return true;
  if (/v kontextu revmatologie/i.test(blob) && /zaměřuje na revmatologie/i.test(blob)) return true;
  if (/^[^:]+:\s*revmatologie$/i.test((study.title ?? "").trim())) return true;
  if (
    /cílem je poskytnout klinicky relevantní důkazy/i.test(blob) &&
    /revmatologie/i.test(blob) &&
    (study.summary?.length ?? 0) < 120
  ) {
    return true;
  }

  return false;
}

export function filterQualityStudies(studies: StudyRow[]): StudyRow[] {
  return studies.filter((s) => !isGenericPlaceholderStudy(s));
}
