import { writeAuditLog } from "@/lib/v17/audit/logger";
import { monitor } from "@/lib/v17/monitoring/hooks";
import { checkRateLimit } from "@/lib/v17/security/rate-limit";
import { sanitizeInput } from "@/lib/v17/security/sanitize";
import { getVersion } from "@/lib/v17/versioning/version";

export type V17ProductionJobSlug =
  | "reason"
  | "clinical"
  | "graph"
  | "summarize"
  | "guideline";

export type ProductionJobOptions = {
  ip?: string;
  requestId?: string;
};

export type ProductionJobResult =
  | {
      status: "ok";
      result: unknown;
      requestId: string;
      version: string;
    }
  | {
      status: "error";
      code: "rate_limited" | "validation" | "pipeline";
      issues: string[];
      requestId: string;
    };

/** Production wrapper for V17 job routes (rate limit → sanitize → job → audit). */
export async function runProductionJob(
  job: V17ProductionJobSlug,
  input: string,
  runFn: (sanitizedInput: string) => Promise<unknown>,
  options: ProductionJobOptions = {}
): Promise<ProductionJobResult> {
  const started = Date.now();
  const requestId = options.requestId ?? `v17-${job}-${started}`;
  monitor("job_start", { requestId, job });

  const rate = await checkRateLimit(options.ip ?? "unknown", job);
  if (!rate.allowed) {
    monitor("rate_limited", { requestId, job, ip: options.ip });
    return {
      status: "error",
      code: "rate_limited",
      issues: ["Rate limit exceeded"],
      requestId,
    };
  }

  const sanitized = sanitizeInput(input ?? "");
  if (sanitized.issues.some((issue) => issue.includes("exceeds maximum length"))) {
    return {
      status: "error",
      code: "validation",
      issues: sanitized.issues,
      requestId,
    };
  }

  try {
    const result = await runFn(sanitized.clean);

    await writeAuditLog({
      requestId,
      jobSlug: job,
      nodesUsed: [],
      edgesUsed: [],
      edgeScores: [],
      inferenceChain: [],
      constants: {
        version: getVersion(),
        job,
        inputLength: sanitized.clean.length,
      },
    });

    monitor("job_end", { requestId, job, durationMs: Date.now() - started });

    return {
      status: "ok",
      result,
      requestId,
      version: getVersion(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    monitor("job_error", { requestId, job, issues: [message] });
    return {
      status: "error",
      code: "pipeline",
      issues: [message],
      requestId,
    };
  }
}
