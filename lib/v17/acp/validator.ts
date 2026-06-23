import type { AcpClinicalContext, AcpMetadata, AcpRequest, ValidationResult } from "@/lib/v17/acp/types";

const MAX_TEXT_LENGTH = 50_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateMetadata(metadata: AcpMetadata | undefined, issues: string[]): void {
  if (metadata === undefined) return;
  if (!isPlainObject(metadata)) {
    issues.push("metadata must be a plain object");
    return;
  }
  if (metadata.source !== undefined && typeof metadata.source !== "string") {
    issues.push("metadata.source must be a string");
  }
  if (metadata.locale !== undefined && typeof metadata.locale !== "string") {
    issues.push("metadata.locale must be a string");
  }
  if (metadata.requestId !== undefined && typeof metadata.requestId !== "string") {
    issues.push("metadata.requestId must be a string");
  }
}

function validateClinicalContext(
  clinicalContext: AcpClinicalContext | undefined,
  issues: string[]
): void {
  if (clinicalContext === undefined) return;
  if (!isPlainObject(clinicalContext)) {
    issues.push("clinicalContext must be a plain object");
    return;
  }
  if (clinicalContext.specialty !== undefined && typeof clinicalContext.specialty !== "string") {
    issues.push("clinicalContext.specialty must be a string");
  }
  if (
    clinicalContext.patientAge !== undefined &&
    (typeof clinicalContext.patientAge !== "number" || clinicalContext.patientAge < 0)
  ) {
    issues.push("clinicalContext.patientAge must be a non-negative number");
  }
  if (clinicalContext.setting !== undefined && typeof clinicalContext.setting !== "string") {
    issues.push("clinicalContext.setting must be a string");
  }
}

/** Validate ACP input text, metadata, and clinical context. */
export function validateAcpInput(input: AcpRequest = {}): ValidationResult {
  const issues: string[] = [];
  const text = typeof input.text === "string" ? input.text.trim() : "";

  if (!text) {
    issues.push("text is required and must be non-empty");
  } else if (text.length > MAX_TEXT_LENGTH) {
    issues.push(`text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }

  validateMetadata(input.metadata, issues);
  validateClinicalContext(input.clinicalContext, issues);

  return {
    valid: issues.length === 0,
    issues,
  };
}

/** Normalize request into canonical ACP input. */
export function normalizeAcpRequest(input: AcpRequest = {}): Required<Pick<AcpRequest, "text">> & AcpRequest {
  return {
    ...input,
    text: typeof input.text === "string" ? input.text.trim() : "",
  };
}
