/** Return fixed V17 production blueprint version. */
export function getVersion(): string {
  return "V17.0.0";
}

/** Backward-compatible alias. */
export function getV17Version(): string {
  return getVersion();
}

export function getV17VersionInfo() {
  return {
    version: getVersion(),
    api: "v17",
    build: "production-blueprint-1",
    components: { acp: "1.0.0", mkg: "1.0.0", eil: "1.0.0", esl: "1.0.0" },
  };
}
