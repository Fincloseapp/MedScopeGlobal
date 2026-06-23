/** Extract client IP from request headers (Vercel / Cloudflare / proxy). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/** Simple fingerprint from IP + user-agent for login tracking. */
export function getRequestFingerprint(request: Request): string {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "";
  return `${ip}:${ua.slice(0, 120)}`;
}
