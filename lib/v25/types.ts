export type V25TestStatus = "ok" | "fail" | "pending" | "skipped";

export type V25TestSuite = {
  linkTest: V25TestStatus;
  screenshotTest: V25TestStatus;
  navigationMonitor: V25TestStatus;
  verifyEngine: V25TestStatus;
  buildStatus: V25TestStatus;
  ciStatus: V25TestStatus;
  updatedAt: string;
};

export type V25FixRecord = {
  id: string;
  at: string;
  errorType: string;
  module: string;
  action: "autofix" | "redeploy" | "rollback";
  result: "ok" | "fail" | "partial";
  detail?: string;
};

export type V25CronStatus = {
  cronId: string;
  lastRunAt: string | null;
  durationMs: number | null;
  status: V25TestStatus;
  error?: string;
};

export type V25ApiStatus = {
  path: string;
  status: number;
  ok: boolean;
  version?: string;
};

export type V25NavStatus = {
  totalLinks: number;
  working: number;
  broken: number;
  brokenUrls: string[];
  lastCheckAt: string;
};

export type V25ScreenshotEntry = {
  id: string;
  path: string;
  file?: string;
  ok: boolean;
  timestamp: string;
  title?: string;
};

export type V25Alert = {
  id: string;
  at: string;
  type: string;
  message: string;
  logFile?: string;
};

export type V25SystemState = {
  version: string;
  tests: V25TestSuite;
  fixHistory: V25FixRecord[];
  crons: V25CronStatus[];
  apis: V25ApiStatus[];
  navigation: V25NavStatus;
  screenshots: V25ScreenshotEntry[];
  alerts: V25Alert[];
};

export type V25PipelinePhase =
  | "qa"
  | "seo"
  | "legal"
  | "dedupe"
  | "image"
  | "publish"
  | "verify"
  | "linktest"
  | "screenshots"
  | "navmonitor"
  | "autofix"
  | "redeploy"
  | "rollback";

export type V25EnterpriseResult = {
  ok: boolean;
  version: string;
  phases: Record<string, { ok: boolean; detail?: string }>;
  autofixAttempted: boolean;
  redeployTriggered: boolean;
  rollbackTriggered: boolean;
  errors: string[];
};
