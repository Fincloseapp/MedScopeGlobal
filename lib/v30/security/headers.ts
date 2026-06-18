import type { NextResponse } from "next/server";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com",
  "media-src 'self' blob: data: https://*.supabase.co https://storage.googleapis.com https://www.w3schools.com https:",
  "frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

export const V30_SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
};

export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(V30_SECURITY_HEADERS)) {
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
