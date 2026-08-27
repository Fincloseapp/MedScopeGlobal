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
import {
  buildLocalePath,
  canonicalLocalePathname,
  isLocaleRoutingExcluded,
  resolveLocalePath,
} from "@/lib/i18n/locale-path";
import { localeFromCountry } from "@/lib/ecosystem/locales";
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

function getRequestCountry(request: NextRequest): string | null {
  const geoCountry = (
    request as NextRequest & { geo?: { country?: string | null } }
  ).geo?.country;
  return geoCountry ?? request.headers.get("cf-ipcountry");
}

function detectTargetLocale(request: NextRequest): string {
  const manual = request.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (manual && cookieLocale) {
    return normalizeLocale(cookieLocale);
  }

  const acceptLanguage = request.headers.get("accept-language");
  const cfCountry = getRequestCountry(request);
  const geoLocale = localeFromCountry(cfCountry);
  const browserLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
  return normalizeLocale(cfCountry ? geoLocale : browserLocale);
}

function applyLocaleCookie(
  response: NextResponse,
  request: NextRequest,
  forcedLocale?: string
): void {
  const manual = request.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const acceptLanguage = request.headers.get("accept-language");
  const cfCountry = getRequestCountry(request);
  const geoLocale = localeFromCountry(cfCountry);
  const browserLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
  const autoLocale = cfCountry ? geoLocale : browserLocale;
  const next = forcedLocale
    ? normalizeLocale(forcedLocale)
    : normalizeLocale(autoLocale);

  if (forcedLocale || !manual) {
    const current = request.cookies.get(LOCALE_COOKIE)?.value;
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

  const localeExcluded = isLocaleRoutingExcluded(pathname);
  const { locale: pathLocale, pathname: strippedPath } = localeExcluded
    ? { locale: null, pathname }
    : resolveLocalePath(pathname);

  // Collapse alias prefixes (/ja → /jp, /zh-cn → /cn, /ko → /kr) for a single canonical URL
  if (!localeExcluded && pathLocale) {
    const canonicalPath = canonicalLocalePathname(pathname);
    if (canonicalPath && canonicalPath !== pathname) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = canonicalPath;
      redirectUrl.search = request.nextUrl.search;
      const redirect = NextResponse.redirect(redirectUrl, 308);
      applyLocaleCookie(redirect, request, pathLocale);
      return wrapWithSecurityHeaders(redirect, pathname);
    }
  }

  // Geo / browser locale redirect when URL has no locale prefix
  if (!localeExcluded && !pathLocale) {
    const targetLocale = detectTargetLocale(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = buildLocalePath(targetLocale, pathname);
    redirectUrl.search = request.nextUrl.search;
    const redirect = NextResponse.redirect(redirectUrl);
    applyLocaleCookie(redirect, request, targetLocale);
    return wrapWithSecurityHeaders(redirect, pathname);
  }

  const effectivePathname = pathLocale ? strippedPath : pathname;

  const { supabase, response: baseResponse } = createMiddlewareClient(request);

  let response: NextResponse;
  if (pathLocale) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    rewriteUrl.search = request.nextUrl.search;
    response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: request.headers },
    });
    baseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    applyLocaleCookie(response, request, pathLocale);
  } else {
    response = baseResponse;
    applyLocaleCookie(response, request);
  }

  if (isLekarskaZonaPath(effectivePathname)) {
    const gated = await enforceLekarskaZonaMiddleware(request, supabase, response);
    if (gated && gated !== response) {
      return wrapWithSecurityHeaders(gated, pathname);
    }
  }

  return wrapWithSecurityHeaders(response, pathname);
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
