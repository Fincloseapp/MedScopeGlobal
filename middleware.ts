import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import {
  applyV30SecurityMiddleware,
  wrapWithSecurityHeaders,
} from "@/lib/v30/security/middleware";
import {
  LOCALE_COOKIE,
  LOCALE_REQUEST_HEADER,
  PATHNAME_REQUEST_HEADER,
  normalizeLocale,
} from "@/lib/i18n/config";
import { localeForUnprefixedEntry } from "@/lib/i18n/detect-locale";
import {
  canonicalLocalePathname,
  isLocaleRoutingExcluded,
  localeToPathSegment,
  resolveLocalePath,
} from "@/lib/i18n/locale-path";
import { isSearchEngineBot } from "@/lib/i18n/search-bots";
import {
  czechFacultyProductForPath,
  isCzechFacultyLocale,
} from "@/lib/i18n/czech-faculty-only-copy";
import {
  hasValidAdminGateCookie,
  requiresAdminGate,
} from "@/lib/auth/admin-gate-config";
import {
  enforceLekarskaZonaMiddleware,
  isLekarskaZonaPath,
} from "@/lib/academy/b2b/middleware-gate";

const LOCALE_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

/** Overlay the path locale onto the incoming Cookie header so RSC sees it now. */
function cookieHeaderWithLocale(raw: string | null, locale: string): string {
  const next = `${LOCALE_COOKIE}=${normalizeLocale(locale)}`;
  if (!raw) return next;
  const parts = raw
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${LOCALE_COOKIE}=`));
  parts.push(next);
  return parts.join("; ");
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const securityBlock = await applyV30SecurityMiddleware(request);
  if (securityBlock) return securityBlock;

  if (requiresAdminGate(pathname) && !hasValidAdminGateCookie(request.cookies)) {
    return adminGateRedirect(request);
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
    if (stripped === "/pro-lekare" || stripped === "/pro-me/lekari") {
      const destPath = pathLocale
        ? `/${localeToPathSegment(pathLocale)}/lekari`
        : "/lekari";
      const redirect = NextResponse.redirect(new URL(destPath, request.url), 308);
      copyResponseCookies(response, redirect);
      return wrapWithSecurityHeaders(redirect, pathname);
    }
    if (pathLocale) {
      const url = request.nextUrl.clone();
      const product =
        !isCzechFacultyLocale(pathLocale) ? czechFacultyProductForPath(stripped) : null;
      url.pathname = product ? "/czech-edition-only" : stripped;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(LOCALE_REQUEST_HEADER, normalizeLocale(pathLocale));
      requestHeaders.set(PATHNAME_REQUEST_HEADER, pathname);
      requestHeaders.set("cookie", cookieHeaderWithLocale(request.headers.get("cookie"), pathLocale));
      if (product) requestHeaders.set("x-czech-faculty-product", product);
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

  // Typing medscopeglobal.com (or any unprefixed public URL) always follows
  // the device/browser language. A previous locale-switcher cookie must not
  // lock the apex domain to English when the phone is Czech.
  const acceptLanguage = request.headers.get("accept-language");
  const bot = isSearchEngineBot(request.headers.get("user-agent"));
  const country = request.headers.get("cf-ipcountry");
  const target = localeForUnprefixedEntry(acceptLanguage, bot, country);

  const prefix = `/${localeToPathSegment(target)}`;
  const destPath = pathname === "/" ? prefix : `${prefix}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const dest = request.nextUrl.clone();
  dest.pathname = destPath;

  if (bot) {
    dest.pathname = pathname === "/" ? "/cs" : `/cs${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    const redirect = NextResponse.redirect(dest, 308);
    copyResponseCookies(response, redirect);
    redirect.headers.set("Vary", "Accept-Language, User-Agent, CF-IPCountry");
    redirect.headers.set("Cache-Control", "public, max-age=300");
    return wrapWithSecurityHeaders(redirect, pathname);
  }

  const redirect = NextResponse.redirect(dest, 302);
  copyResponseCookies(response, redirect);
  redirect.headers.set("Vary", "Accept-Language, User-Agent, CF-IPCountry");
  redirect.headers.set("Cache-Control", "private, no-store, must-revalidate");
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
    "/((?!_next|__ms|relay|favicon.ico|robots.txt|ads.txt|llms.txt|news-sitemap.xml|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|txt)$).*)",
  ],
};
