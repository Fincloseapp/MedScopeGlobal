import type { NextResponse } from "next/server";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://serve.affiliate.heureka.cz",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://*.supabase.co https: http:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://serve.affiliate.heureka.cz",
  "media-src 'self' blob: data: https://*.supabase.co https://storage.googleapis.com https://www.w3schools.com https:",
  "frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

export function permissionsPolicyForPath(pathname?: string): string {
  if (!pathname) return "camera=(), microphone=(), geolocation=()";
  if (pathname.startsWith("/app/dokumentace") || pathname.startsWith("/lekari/dokumentace")) {
    return "camera=(), microphone=(self), geolocation=()";
  }
  if (pathname.startsWith("/app/pacient") || pathname.startsWith("/medipacient")) {
    return "camera=(self), microphone=(), geolocation=()";
  }
  return "camera=(), microphone=(), geolocation=()";
}

export const V30_SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": permissionsPolicyForPath(),
  "X-XSS-Protection": "1; mode=block",
};

export function applySecurityHeaders(response: NextResponse, pathname?: string): NextResponse {
  for (const [key, value] of Object.entries(V30_SECURITY_HEADERS)) {
    if (key === "Permissions-Policy") {
      response.headers.set(key, permissionsPolicyForPath(pathname));
      continue;
    }
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export function getSecurityHeadersStatus() {
  return {
    enabled: true,
    headers: Object.keys(V30_SECURITY_HEADERS),
    csp: true,
    hsts: true,
  };
}
