import { appendV25Log } from "@/lib/v25/data-store";
import type { V25Alert } from "@/lib/v25/types";
import { loadV25SystemState, saveV25SystemState } from "@/lib/v25/system-state";

export function emitV25Alert(type: string, message: string, logFile?: string) {
  const alert: V25Alert = {
    id: `alert-${Date.now()}`,
    at: new Date().toISOString(),
    type,
    message,
    logFile,
  };
  appendV25Log("alerts", `${type}: ${message}`);
  const state = loadV25SystemState();
  state.alerts = [alert, ...state.alerts].slice(0, 100);
  saveV25SystemState(state);
  return alert;
}
