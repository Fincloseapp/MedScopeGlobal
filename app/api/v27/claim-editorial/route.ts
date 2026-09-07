import { NextResponse } from "next/server";
import { claimEditorialSession } from "@/lib/auth/claim-editorial";
import {
  EDITORIAL_PAID_COOKIE,
  editorialCookieMaxAgeSec,
} from "@/lib/auth/editorial-cookie";
import { safeEditorialReturnPath } from "@/lib/editorial/return-path";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const NO_STORE = "private, no-cache, no-store, must-revalidate";

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function attachClaimCookie(res: NextResponse, periodEndMs: number) {
  res.headers.set("Cache-Control", NO_STORE);
  res.cookies.set(
    EDITORIAL_PAID_COOKIE,
    String(periodEndMs),
    cookieBase(editorialCookieMaxAgeSec(periodEndMs))
  );
  return res;
}

export async function POST(request: Request) {
  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = String(body.sessionId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const claimed = await claimEditorialSession(sessionId);
  if (!claimed.ok) {
    return NextResponse.json({ error: claimed.error }, { status: claimed.status });
  }
  const res = NextResponse.json({ ok: true, until: new Date(claimed.periodEndMs).toISOString() });
  return attachClaimCookie(res, claimed.periodEndMs);
}

/** Stripe success_url lands here so the cookie is set before JS. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("session_id") ?? "").trim();
  const locale = normalizeLocale(url.searchParams.get("locale") ?? "cs");
  const product = String(url.searchParams.get("product") ?? "");
  const gift = url.searchParams.get("gift") === "1";
  const ret = safeEditorialReturnPath(url.searchParams.get("return"));

  const claimed = await claimEditorialSession(sessionId);
  const next = new URLSearchParams();
  if (sessionId) next.set("session_id", sessionId);
  if (gift) next.set("gift", "1");
  if (product) next.set("product", product);
  else if (claimed.ok) next.set("product", claimed.productId);
  next.set("locale", locale);
  if (ret) next.set("return", ret);
  if (claimed.ok) next.set("claimed", "1");

  const dest = localizePublicHref(`/checkout/uspesne?${next.toString()}`, locale);
  const res = NextResponse.redirect(new URL(dest, url.origin), 303);
  if (claimed.ok) attachClaimCookie(res, claimed.periodEndMs);
  else res.headers.set("Cache-Control", NO_STORE);
  return res;
}
