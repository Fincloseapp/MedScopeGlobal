/** Clinical safety guardrails for ACP output. */
export function validateClinicalSafety(acpOutput: any): { safe: boolean; issues: string[] } {
  const issues: string[] = [];
  const acp = acpOutput?.acp ?? acpOutput;

  const diagnosis = acp?.inference?.diagnosis ?? [];
  const treatment = acp?.inference?.treatment ?? [];
  const evaluated = acp?.reasoning?.evaluated?.items ?? [];
  const graphNodes = acp?.graph?.nodes ?? [];
  const conclusion = acp?.reasoning?.inferred?.conclusion ?? "";
  const risk = acp?.inference?.risk ?? {};
  const extractedRisks = acp?.reasoning?.extracted?.risks ?? [];
  const summaryTreatments = acp?.summary?.recommendedTreatments ?? [];

  const hasDiagnosis = diagnosis.length > 0;
  const hasTreatment = treatment.length > 0;
  const hasEvidence =
    evaluated.length > 0 || graphNodes.some((node: any) => node?.type === "evidence");
  const hasConclusion = Boolean(String(conclusion).trim());
  const hasRiskScoring =
    typeof risk.riskScore === "number" &&
    ((risk.riskFactors?.length ?? 0) > 0 || extractedRisks.length > 0);

  if (hasTreatment && !hasDiagnosis) {
    issues.push("Treatment recommendations present without supporting diagnosis");
  }
  if (hasConclusion && !hasEvidence) {
    issues.push("Clinical conclusion present without supporting evidence");
  }
  if (hasTreatment && !hasRiskScoring) {
    issues.push("Treatment recommendations present without risk scoring profile");
  }
  if (summaryTreatments.length > 0 && !hasDiagnosis) {
    issues.push("Summary recommends treatment without primary diagnosis");
  }

  return { safe: issues.length === 0, issues };
}
