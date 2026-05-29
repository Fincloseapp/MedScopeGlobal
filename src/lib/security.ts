import { siteConfig } from "./site";
export function getClientIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"; }
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestHost = request.headers.get("host");
  const expectedHosts = new Set([requestHost, new URL(siteConfig.url).host, "localhost:3000", "127.0.0.1:3000"].filter(Boolean));
  try {
    return expectedHosts.has(new URL(origin).host);
  } catch {
    return false;
  }
}
export function sanitizeText(value: string) { return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim(); }
