import type { EvidenceLevel } from "@/lib/v17/clinical/evidence";

export type ClinicalAudit = {
  nodeIds: string[];
  edgesUsed: string[];
};

export type DiagnosisCandidate = {
  diagnosis: string;
  confidence: number;
  supportingSymptoms: string[];
  supportingEvidence: string[];
  audit: ClinicalAudit;
};

export type TreatmentRecommendation = {
  treatment: string;
  evidenceLevel: EvidenceLevel;
  guidelineSupport: boolean;
  confidence: number;
  audit: ClinicalAudit;
};

export type RiskFactor = {
  factor: string;
  score: number;
};

export type MitigationItem = {
  treatment: string;
  strength: number;
};

export type RiskProfile = {
  riskScore: number;
  riskFactors: RiskFactor[];
  mitigation: MitigationItem[];
  audit: ClinicalAudit;
};

export type WeightedEvidenceItem = {
  item: string;
  weight: number;
  level: EvidenceLevel;
};

export type ClinicalInferenceResult = {
  diagnosis: DiagnosisCandidate[];
  treatment: TreatmentRecommendation[];
  risk: RiskProfile;
};
