import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { applySecurityMiddleware } from "@/lib/security/middleware-security";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  normalizeLocale,
} from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";

export async function middleware(request: NextRequest) {
  const securityBlock = await applySecurityMiddleware(request);
  if (securityBlock) return securityBlock;

  const { supabase, response } = createMiddlewareClient(request);

  const manual = request.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const acceptLanguage = request.headers.get("accept-language");
  const deviceLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
  // Primární jazyk webu je čeština; angličtina jen pokud ji prohlížeč výslovně preferuje
  const autoLocale =
    deviceLocale === "en" || deviceLocale.startsWith("en-") ? deviceLocale : DEFAULT_LOCALE;

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

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith("/admin") && !user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
