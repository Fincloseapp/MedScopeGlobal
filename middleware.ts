import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import {
  applyV30SecurityMiddleware,
  wrapWithSecurityHeaders,
} from "@/lib/v30/security/middleware";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  normalizeLocale,
} from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";
import { isValidAdminGateCookie, ADMIN_GATE_COOKIE } from "@/lib/auth/admin-gate-config";
import {
  enforceLekarskaZonaMiddleware,
  isLekarskaZonaPath,
} from "@/lib/academy/b2b/verification";

function adminGateRedirect(request: NextRequest): NextResponse {
  const login = new URL("/admin/login", request.url);
  const redirect = NextResponse.redirect(login);
  redirect.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  return redirect;
}

function requiresAdminGate(pathname: string): boolean {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const securityBlock = await applyV30SecurityMiddleware(request);
  if (securityBlock) return securityBlock;

  if (requiresAdminGate(pathname)) {
    const gate = request.cookies.get(ADMIN_GATE_COOKIE)?.value;
    if (!isValidAdminGateCookie(gate)) {
      return adminGateRedirect(request);
    }
  }

  if (pathname === "/stav-systemu") {
    return NextResponse.redirect(new URL("/admin/system", request.url));
  }

  const { supabase, response } = createMiddlewareClient(request);

  // Lékařská zóna / B2B CME — only verified physicians with valid ČLK ID
  if (isLekarskaZonaPath(pathname)) {
    const gated = await enforceLekarskaZonaMiddleware(request, supabase, response);
    if (gated && gated !== response) {
      return wrapWithSecurityHeaders(gated);
    }
  }

  const manual = request.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const acceptLanguage = request.headers.get("accept-language");
  // v20: web je výhradně v češtině (bez automatického přepnutí na EN)
  const autoLocale = DEFAULT_LOCALE;
  void detectLocaleFromAcceptLanguage(acceptLanguage);

  if (!manual) {
    const current = request.cookies.get(LOCALE_COOKIE)?.value;
    const next = normalizeLocale(autoLocale);
    if (!current || normalizeLocale(current) !== next) {
      response.cookies.set(LOCALE_COOKIE, next, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  } else if (!request.cookies.get(LOCALE_COOKIE)?.value) {
    response.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return wrapWithSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/stav-systemu",
    "/academy/lekari/:path*",
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)",
  ],
};
