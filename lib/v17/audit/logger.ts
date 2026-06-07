import fs from "fs/promises";
import path from "path";
import { monitor } from "@/lib/v17/monitoring/hooks";
import { getVersion } from "@/lib/v17/versioning/version";

const AUDIT_DIR = path.join(process.cwd(), ".data", "v17-audit");
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.jsonl");

const memoryLog: Record<string, unknown>[] = [];
let diskWritable: boolean | null = null;

/** Whether the last disk write succeeded (null = not yet attempted). */
export function isAuditDiskAvailable(): boolean | null {
  return diskWritable;
}

/** Persist audit record to JSON file (+ in-memory buffer). Never throws on disk errors. */
export async function writeAuditLog(record: any): Promise<void> {
  const entry = {
    requestId: String(record?.requestId ?? "unknown"),
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

  try {
    await fs.mkdir(AUDIT_DIR, { recursive: true });
    await fs.appendFile(AUDIT_FILE, `${JSON.stringify(entry)}\n`, "utf8");
    diskWritable = true;
  } catch (error) {
    diskWritable = false;
    monitor("audit_disk_error", {
      requestId: entry.requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function getMemoryAuditLog(): Record<string, unknown>[] {
  return [...memoryLog];
}
