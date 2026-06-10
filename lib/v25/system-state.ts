import { readV25Json, writeV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
import {
  loadV25SystemStateFromDb,
  persistV25SystemStateToDb,
} from "@/lib/v25/system-state-persist";
import type {
  V25FixRecord,
  V25SystemState,
  V25TestStatus,
  V25TestSuite,
} from "@/lib/v25/types";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";

function defaultTests(): V25TestSuite {
  return {
    linkTest: "pending",
    screenshotTest: "pending",
    navigationMonitor: "pending",
    imagePipeline: "pending",
    verifyEngine: "pending",
    buildStatus: "ok",
    ciStatus: "ok",
    updatedAt: new Date().toISOString(),
  };
}

export function defaultV25SystemState(): V25SystemState {
  return {
    version: V25_ENGINE_VERSION,
    tests: defaultTests(),
    fixHistory: [],
    crons: [
      { cronId: "v24-ultra", lastRunAt: null, durationMs: null, status: "pending" },
      { cronId: "v25-enterprise", lastRunAt: null, durationMs: null, status: "pending" },
      { cronId: "v25-nav-monitor", lastRunAt: null, durationMs: null, status: "pending" },
      { cronId: "v25-universities", lastRunAt: null, durationMs: null, status: "pending" },
      { cronId: "v25-images", lastRunAt: null, durationMs: null, status: "pending" },
    ],
    providers: [],
    apis: [],
    navigation: {
      totalLinks: 0,
      working: 0,
      broken: 0,
      brokenUrls: [],
      lastCheckAt: new Date().toISOString(),
    },
    screenshots: [],
    alerts: [],
  };
}

export function loadV25SystemState(): V25SystemState {
  return readV25Json<V25SystemState>(V25_DATA_PATHS.systemState) ?? defaultV25SystemState();
}

export async function loadV25SystemStateAsync(): Promise<V25SystemState> {
  const fromDb = await loadV25SystemStateFromDb();
  if (fromDb) return fromDb;
  return loadV25SystemState();
}

export function saveV25SystemState(state: V25SystemState) {
  writeV25Json(V25_DATA_PATHS.systemState, state);
  void persistV25SystemStateToDb(state);
}

export async function saveV25SystemStateAsync(state: V25SystemState): Promise<boolean> {
  writeV25Json(V25_DATA_PATHS.systemState, state);
  return persistV25SystemStateToDb(state);
}

export function updateV25TestStatus(partial: Partial<V25TestSuite>) {
  const state = loadV25SystemState();
  state.tests = { ...state.tests, ...partial, updatedAt: new Date().toISOString() };
  saveV25SystemState(state);
}

export function recordV25Fix(input: Omit<V25FixRecord, "id" | "at">) {
  const state = loadV25SystemState();
  const record: V25FixRecord = {
    id: `fix-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...input,
  };
  state.fixHistory = [record, ...state.fixHistory].slice(0, 200);
  saveV25SystemState(state);
  return record;
}

export function mergeV25SystemState(partial: Partial<V25SystemState>) {
  const state = { ...loadV25SystemState(), ...partial };
  saveV25SystemState(state);
  return state;
}

export function setCronStatus(
  cronId: string,
  status: V25TestStatus,
  durationMs?: number,
  error?: string,
  metrics?: V25SystemState["crons"][0]["metrics"]
) {
  const state = loadV25SystemState();
  const idx = state.crons.findIndex((c) => c.cronId === cronId);
  const entry = {
    cronId,
    lastRunAt: new Date().toISOString(),
    durationMs: durationMs ?? null,
    status,
    error,
    metrics,
  };
  if (idx >= 0) state.crons[idx] = entry;
  else state.crons.push(entry);
  saveV25SystemState(state);
}

/** Záznam že autofix/redeploy/rollback nebyl potřeba (vše prošlo). */
export function recordV25PipelineSkippedFixes() {
  const stamp = new Date().toISOString();
  const state = loadV25SystemState();
  const rows: V25FixRecord[] = (
    [
      ["autofix", "není potřeba — testy prošly"],
      ["redeploy", "není potřeba — bez chyb"],
      ["rollback", "není potřeba — bez chyb"],
    ] as const
  ).map(([action, detail]) => ({
    id: `fix-skip-${action}-${Date.now()}`,
    at: stamp,
    errorType: "none",
    module: "v25-pipeline",
    action,
    result: "ok" as const,
    detail,
  }));
  state.fixHistory = [...rows, ...state.fixHistory].slice(0, 200);
  saveV25SystemState(state);
}
