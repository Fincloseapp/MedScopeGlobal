import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { V25_DATA_ROOT } from "@/lib/v25/config";

const CLK_JSON_PATH =
  process.env.MEDSCOPE_CLK_JSON ??
  join(V25_DATA_ROOT, "auth", "clk.json");

export type ClkVerificationStatus =
  | "pending"
  | "manual_review"
  | "verified"
  | "rejected";

export type ClkVerificationMethod = "api" | "manual";

export interface ClkAuditEntry {
  at: string;
  action: string;
  actor?: string | null;
  details?: Record<string, unknown>;
}

export interface ClkVerificationRecord {
  id: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  clkNumber: string;
  status: ClkVerificationStatus;
  method: ClkVerificationMethod;
  verifiedAt: string | null;
  apiResult: Record<string, unknown> | null;
  auditLog: ClkAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ClkJsonStore {
  version: 1;
  verifications: ClkVerificationRecord[];
}

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function emptyStore(): ClkJsonStore {
  return { version: 1, verifications: [] };
}

export function clkJsonPath() {
  return CLK_JSON_PATH;
}

export function readClkStore(): ClkJsonStore {
  if (!existsSync(CLK_JSON_PATH)) return emptyStore();
  try {
    const parsed = JSON.parse(readFileSync(CLK_JSON_PATH, "utf8")) as ClkJsonStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.verifications)) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function writeClkStore(store: ClkJsonStore) {
  ensureDir(dirname(CLK_JSON_PATH));
  writeFileSync(CLK_JSON_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function appendClkFileLog(line: string) {
  const logPath = join(dirname(CLK_JSON_PATH), "clk-audit.log");
  ensureDir(dirname(logPath));
  appendFileSync(logPath, `[${new Date().toISOString()}] ${line}\n`, "utf8");
}

export function getClkRecordForUser(userId: string): ClkVerificationRecord | null {
  const store = readClkStore();
  return (
    store.verifications
      .filter((v) => v.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

export function upsertClkRecord(record: ClkVerificationRecord) {
  const store = readClkStore();
  const idx = store.verifications.findIndex((v) => v.id === record.id);
  if (idx >= 0) store.verifications[idx] = record;
  else store.verifications.unshift(record);
  writeClkStore(store);
  appendClkFileLog(
    `${record.status} user=${record.userId} clk=${record.clkNumber} method=${record.method}`
  );
  return record;
}
