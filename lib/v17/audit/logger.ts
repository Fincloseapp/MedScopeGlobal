import fs from "fs/promises";
import path from "path";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { monitor } from "@/lib/v17/monitoring/hooks";
import { getVersion } from "@/lib/v17/versioning/version";

const AUDIT_DIR = path.join(process.cwd(), ".data", "v17-audit");
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.jsonl");

const memoryLog: Record<string, unknown>[] = [];
let diskWritable: boolean | null = null;
let supabaseWritable: boolean | null = null;

export type AuditLogRecord = {
  requestId?: string;
  jobSlug?: string;
  timestamp?: string;
  nodesUsed?: unknown[];
  edgesUsed?: unknown[];
  edgeScores?: unknown[];
  inferenceChain?: unknown[];
  constants?: Record<string, unknown>;
  version?: string;
};

/** Whether the last disk write succeeded (null = not yet attempted). */
export function isAuditDiskAvailable(): boolean | null {
  return diskWritable;
}

/** Whether the last Supabase write succeeded (null = not yet attempted). */
export function isAuditSupabaseAvailable(): boolean | null {
  return supabaseWritable;
}

async function writeAuditToSupabase(entry: Record<string, unknown>): Promise<boolean> {
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("v17_audit_logs").insert({
      request_id: String(entry.requestId ?? "unknown"),
      job_slug: String(entry.jobSlug ?? "acp"),
      nodes_used: entry.nodesUsed ?? [],
      edges_used: entry.edgesUsed ?? [],
      edge_scores: entry.edgeScores ?? [],
      inference_chain: entry.inferenceChain ?? [],
      constants: entry.constants ?? {},
      version: entry.version ?? getVersion(),
    });
    if (error) {
      monitor("audit_supabase_error", {
        requestId: entry.requestId,
        error: error.message,
      });
      return false;
    }
    return true;
  } catch (error) {
    monitor("audit_supabase_error", {
      requestId: entry.requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/** Persist audit record (Supabase → disk → memory). Never throws. */
export async function writeAuditLog(record: AuditLogRecord): Promise<void> {
  const entry = {
    requestId: String(record?.requestId ?? "unknown"),
    jobSlug: String(record?.jobSlug ?? "acp"),
    timestamp: record?.timestamp ?? new Date().toISOString(),
    nodesUsed: record?.nodesUsed ?? [],
    edgesUsed: record?.edgesUsed ?? [],
    edgeScores: record?.edgeScores ?? [],
    inferenceChain: record?.inferenceChain ?? [],
    constants: record?.constants ?? {},
    version: record?.version ?? getVersion(),
  };

  memoryLog.push(entry);
  if (memoryLog.length > 500) memoryLog.shift();

  supabaseWritable = await writeAuditToSupabase(entry);

  try {
    await fs.mkdir(AUDIT_DIR, { recursive: true });
    await fs.appendFile(AUDIT_FILE, `${JSON.stringify(entry)}\n`, "utf8");
    diskWritable = true;
  } catch (error) {
    diskWritable = false;
    if (!supabaseWritable) {
      monitor("audit_disk_error", {
        requestId: entry.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export function getMemoryAuditLog(): Record<string, unknown>[] {
  return [...memoryLog];
}
