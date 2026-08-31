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
  LOCALE_REQUEST_HEADER,
  normalizeLocale,
} from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";
import {
  canonicalLocalePathname,
  isLocaleRoutingExcluded,
  localeToPathSegment,
  resolveLocalePath,
} from "@/lib/i18n/locale-path";
import { isSearchEngineBot } from "@/lib/i18n/search-bots";
import { isValidAdminGateCookie, ADMIN_GATE_COOKIE } from "@/lib/auth/admin-gate-config";
import {
  enforceLekarskaZonaMiddleware,
  isLekarskaZonaPath,
} from "@/lib/academy/b2b/middleware-gate";

const LOCALE_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

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
      return wrapWithSecurityHeaders(gated, pathname);
    }
  }

  if (!isLocaleRoutingExcluded(pathname)) {
    const alias = canonicalLocalePathname(pathname);
    if (alias) {
      const url = request.nextUrl.clone();
      url.pathname = alias;
      const redirect = NextResponse.redirect(url, 308);
      copyResponseCookies(response, redirect);
      return wrapWithSecurityHeaders(redirect, pathname);
    }

    const { locale: pathLocale, pathname: stripped } = resolveLocalePath(pathname);
    if (pathLocale) {
      const url = request.nextUrl.clone();
      url.pathname = stripped;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(LOCALE_REQUEST_HEADER, normalizeLocale(pathLocale));
      const rewrite = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
      copyResponseCookies(response, rewrite);
      rewrite.cookies.set(LOCALE_COOKIE, normalizeLocale(pathLocale), LOCALE_COOKIE_OPTS);
      return wrapWithSecurityHeaders(rewrite, pathname);
    }
  } else {
    return wrapWithSecurityHeaders(response, pathname);
  }

  const manual = request.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const acceptLanguage = request.headers.get("accept-language");
  const detected = detectLocaleFromAcceptLanguage(acceptLanguage);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const bot = isSearchEngineBot(request.headers.get("user-agent"));

  let target = DEFAULT_LOCALE;
  if (manual && cookieLocale) {
    target = normalizeLocale(cookieLocale);
  } else if (!bot) {
    target = detected;
  }

  const prefix = `/${localeToPathSegment(target)}`;
  const destPath = pathname === "/" ? prefix : `${prefix}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const dest = request.nextUrl.clone();
  dest.pathname = destPath;

  if (bot) {
    dest.pathname = pathname === "/" ? "/cs" : `/cs${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    const redirect = NextResponse.redirect(dest, 308);
    copyResponseCookies(response, redirect);
    return wrapWithSecurityHeaders(redirect, pathname);
  }

  const redirect = NextResponse.redirect(dest, 302);
  copyResponseCookies(response, redirect);
  redirect.cookies.set(LOCALE_COOKIE, normalizeLocale(target), LOCALE_COOKIE_OPTS);
  return wrapWithSecurityHeaders(redirect, pathname);
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
