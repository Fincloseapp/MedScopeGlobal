/** Cloudflare Workers / OpenNext — the only production runtime. */
export function isCloudflareRuntime(): boolean {
  return (
    process.env.MEDSCOPE_RUNTIME === "cloudflare-workers" ||
    Boolean(process.env.CF_PAGES)
  );
}

/** Workers, Pages, or GitHub Actions — no persisted Windows D: tree. */
export function isEphemeralRuntime(): boolean {
  return isCloudflareRuntime() || process.env.GITHUB_ACTIONS === "true";
}
