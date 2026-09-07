/** Cloudflare / edge country on the incoming request. `XX` and Tor (`T1`) stay unknown. */
export function requestCountry(headers: Headers): string | null {
  const raw = (headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? "")
    .trim()
    .toUpperCase();
  if (!raw || raw === "XX" || raw === "T1") return null;
  return raw.replace(/[^A-Z]/g, "").slice(0, 2) || null;
}

export function payloadCountry(payload: Record<string, unknown>): string | null {
  const raw = payload.country ?? payload.cfCountry ?? payload.cf_ipcountry;
  if (raw == null) return null;
  const code = String(raw).trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code.replace(/[^A-Z]/g, "").slice(0, 2) || null;
}
