import { V18_VERSION } from "@/lib/v18/health";

export type V18MonitoringSnapshot = {
  timestamp: string;
  version: string;
  engine: "v18";
  metrics: {
    requestsLastHour: number;
    avgLatencyMs: number;
    errorRate: number;
    auditWritesLastHour: number;
  };
  endpoints: string[];
};

export function getV18MonitoringSnapshot(): V18MonitoringSnapshot {
  return {
    timestamp: new Date().toISOString(),
    version: V18_VERSION,
    engine: "v18",
    metrics: {
      requestsLastHour: 0,
      avgLatencyMs: 0,
      errorRate: 0,
      auditWritesLastHour: 0,
    },
    endpoints: [
      "/api/v18/upload",
      "/api/v18/summarize",
      "/api/v18/guideline",
      "/api/v18/clinical-check",
      "/api/v18/health",
      "/api/v18/monitoring",
    ],
  };
}
