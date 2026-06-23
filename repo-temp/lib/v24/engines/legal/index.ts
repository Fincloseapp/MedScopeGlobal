import type { V24ContentDraft, V24LegalReport } from "@/lib/v24/types";
import { buildMedicalDisclaimer } from "@/lib/v24/engines/legal/medical-disclaimer";
import { checkLegalRisk } from "@/lib/v24/engines/legal/risk-checker";
import { validateClaims } from "@/lib/v24/engines/legal/claims-validator";

export function runV24LegalPipeline(draft: V24ContentDraft): V24LegalReport {
  const disclaimer = buildMedicalDisclaimer(draft);
  const risk = checkLegalRisk(draft);
  const claims = validateClaims(draft);
  const issues = [...risk.issues, ...claims.issues];
  const passed = risk.passed && claims.passed;
  return { passed, disclaimer, issues };
}
