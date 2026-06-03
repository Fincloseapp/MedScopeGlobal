import { NextResponse } from "next/server";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  LOCALES,
  REGION_COOKIE,
  REGIONS,
  normalizeLocale,
  type RegionCode,
} from "@/lib/i18n/config";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    locale?: string;
    region?: string;
  };

  const locale = normalizeLocale(body.locale);
  if (!LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  res.cookies.set(LOCALE_MANUAL_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  if (body.region && REGIONS.includes(body.region as RegionCode)) {
    res.cookies.set(REGION_COOKIE, body.region, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true, locale, region: body.region });
  }

  return res;
}
