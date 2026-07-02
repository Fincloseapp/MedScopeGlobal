import { getSecurityHeadersStatus } from "@/lib/v30/security/headers";
import { getRateLimitConfig } from "@/lib/v30/security/rate-limit";
import { getWafStatus } from "@/lib/v30/security/waf";
import { writeAuditLog } from "@/lib/v30/security/audit-log";

export async function runSecurityAudit(): Promise<{
  ok: boolean;
  findings: number;
  checks: Record<string, unknown>;
}> {
  const headers = getSecurityHeadersStatus();
  const rateLimit = getRateLimitConfig();
  const waf = getWafStatus();

  const findings: string[] = [];
  if (!headers.enabled) findings.push("security_headers_disabled");
  if (!waf.enabled) findings.push("waf_disabled");
  if (rateLimit.backend === "memory") findings.push("rate_limit_memory_only");

  if (findings.length > 0) {
    await writeAuditLog({
      type: "autopilot:security_audit",
      severity: findings.length > 1 ? "warning" : "info",
      details: { findings, headers, rateLimit, waf },
    });
  }

  return {
    ok: findings.length === 0,
    findings: findings.length,
    checks: { headers, rateLimit, waf, findings },
  };
}
