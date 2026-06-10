import { readV25Json, writeV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
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
    ],
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

export function saveV25SystemState(state: V25SystemState) {
  writeV25Json(V25_DATA_PATHS.systemState, state);
}

export function updateV25TestStatus(partial: Partial<V25TestSuite>) {
  const state = loadV25SystemState();
  state.tests = { ...state.tests, ...partial, updatedAt: new Date().toISOString() };
  saveV25SystemState(state);
}

export function recordV25Fix(input: Omit<V25FixRecord, "id" | "at">) {
  const state = loadV25SystemState();
  const record: V25FixRecord = {
    id: `fix-${Date.now()}`,
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
  error?: string
) {
  const state = loadV25SystemState();
  const idx = state.crons.findIndex((c) => c.cronId === cronId);
  const entry = {
    cronId,
    lastRunAt: new Date().toISOString(),
    durationMs: durationMs ?? null,
    status,
    error,
  };
  if (idx >= 0) state.crons[idx] = entry;
  else state.crons.push(entry);
  saveV25SystemState(state);
}
