import { NextResponse } from "next/server";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
} from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";

/** Clears manual override and applies browser/device language again. */
export async function POST(request: Request) {
  const accept = request.headers.get("accept-language");
  const locale = detectLocaleFromAcceptLanguage(accept);

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  res.cookies.set(LOCALE_MANUAL_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
}
