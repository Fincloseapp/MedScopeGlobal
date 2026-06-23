import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  REGION_COOKIE,
  normalizeLocale,
  type RegionCode,
} from "@/lib/i18n/config";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const cookieLocale = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  const accept = request.headers.get("accept-language");
  const browserLocale = accept?.split(",")[0]?.trim();

  const locale = normalizeLocale(
    cookieLocale ? decodeURIComponent(cookieLocale) : browserLocale
  );

  const regionMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REGION_COOKIE}=`))
    ?.split("=")[1] as RegionCode | undefined;

  return NextResponse.json({
    locale,
    region: regionMatch ?? "EU",
    source: cookieLocale ? "cookie" : browserLocale ? "browser" : "default",
    defaultLocale: DEFAULT_LOCALE,
  });
}
