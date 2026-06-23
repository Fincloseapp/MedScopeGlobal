import { V25_PROD_BASE } from "@/lib/v25/config";
import { appendV25Log } from "@/lib/v25/data-store";
import {
  hydrateV25SystemStateFromDb,
  loadV25SystemState,
  saveV25SystemStateAsync,
  updateV25TestStatus,
} from "@/lib/v25/system-state";
import type { V25TestRunRecord } from "@/lib/v25/types";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";

type SuiteModule = {
  runTestSuite: (options?: { base?: string }) => Promise<V25TestRunRecord>;
};

export async function runV25TestSuite(base = V25_PROD_BASE): Promise<V25TestRunRecord & { persisted?: boolean }> {
  await hydrateV25SystemStateFromDb();

  const mod = (await import("./test-suite-runner.mjs")) as unknown as SuiteModule;
  const run = await mod.runTestSuite({ base });

  updateV25TestStatus({
    verifyEngine: run.cases.find((c) => c.id === "apiHealth")?.ok ? "ok" : "fail",
    linkTest: run.cases.find((c) => c.id === "links")?.ok ? "ok" : "fail",
    navigationMonitor: run.cases.find((c) => c.id === "navigation")?.ok ? "ok" : "fail",
  });

  const state = loadV25SystemState();
  state.lastTestSuite = run;
  state.testRuns = [run, ...(state.testRuns ?? [])].slice(0, 30);

  const persisted = await saveV25SystemStateAsync(state);
  appendV25Log(
    "verify",
    `Test suite ${run.ok ? "PASS" : "FAIL"} v${V25_ENGINE_VERSION} ${run.cases.filter((c) => !c.ok).map((c) => c.id).join(",") || "all ok"}`
  );

  return { ...run, persisted };
}
