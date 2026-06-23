import { aggregateAcpResults, attachAudit } from "@/lib/v17/acp/aggregator";
import { buildAcpAudit } from "@/lib/v17/acp/audit";
import { evaluateCompliance } from "@/lib/v17/acp/compliance";
import { buildClinicalSummary } from "@/lib/v17/acp/summarizer";
import type { AcpErrorResult, AcpRequest, AcpSuccessResult } from "@/lib/v17/acp/types";
import { normalizeAcpRequest, validateAcpInput } from "@/lib/v17/acp/validator";
import { generateDiagnosis } from "@/lib/v17/clinical/diagnosis";
import { weightEvidence } from "@/lib/v17/clinical/evidence";
import { calculateRiskProfile } from "@/lib/v17/clinical/risk";
import { generateTreatmentPlan } from "@/lib/v17/clinical/treatment";
import { buildGraph } from "@/lib/v17/graph/builder";
import { linkGraph } from "@/lib/v17/graph/linker";
import { normalizeGraph } from "@/lib/v17/graph/normalizer";
import reasoningEdge from "@/edge/v17/reasoning-edge";

/** Run full Autonomous Clinical Pipeline (ACP). */
export async function runAcpPipeline(request: AcpRequest = {}): Promise<AcpSuccessResult | AcpErrorResult> {
  const validation = validateAcpInput(request);
  if (!validation.valid) {
    return {
      status: "error",
      issues: validation.issues,
    };
  }

  const normalized = normalizeAcpRequest(request);
  const text = normalized.text ?? "";

  const { pipeline: reasoning } = await reasoningEdge(text);
  const built = await buildGraph(reasoning);
  const linked = await linkGraph(built.nodes, reasoning);
  const graph = await normalizeGraph(linked);

  const weightedEvidence = weightEvidence(reasoning.evaluated);

  const diagnosis = await generateDiagnosis({
    ...reasoning,
    graph,
    weightedEvidence,
  });

  const treatment = await generateTreatmentPlan({
    diagnosisList: diagnosis,
    graph,
  });

  const risk = await calculateRiskProfile({
    extracted: reasoning.extracted,
    diagnosisList: diagnosis,
    graph,
  });

  const inference = { diagnosis, treatment, risk };

  const compliance = evaluateCompliance({
    reasoning,
    graph,
    inference,
  });

  const summary = buildClinicalSummary({
    reasoning,
    inference,
    compliance,
  });

  const aggregated = aggregateAcpResults({
    reasoning,
    graph,
    inference,
    compliance,
    summary,
  });

  const audit = buildAcpAudit({
    reasoning,
    graph,
    inference,
    compliance,
    validation,
  });

  return {
    status: "ok",
    acp: attachAudit(aggregated, audit),
  };
}
