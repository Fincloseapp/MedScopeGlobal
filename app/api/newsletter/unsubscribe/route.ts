import { NextResponse } from "next/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { applyNewsletterSubscriberSchema } from "@/lib/monetization/apply-schema";
import {
  newsletterUnsubToken,
  newsletterUnsubSecret,
} from "@/lib/monetization/vialongevita-brief";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { MAGAZINE } from "@/lib/brand/magazine";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

function tokensEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  const token = (url.searchParams.get("token") ?? "").trim();
  const locale = (url.searchParams.get("locale") ?? "en").trim() || "en";
  const copy = getNewsletterCopy(locale);

  if (!email.includes("@") || !token) {
    return htmlPage(400, copy.invalid, locale);
  }

  const expected = newsletterUnsubToken(email);
  if (!tokensEqual(token, expected) || !newsletterUnsubSecret()) {
    return htmlPage(403, copy.error, locale);
  }

  await applyNewsletterSubscriberSchema();
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    await admin
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email);
  }

  return htmlPage(200, `${copy.unsub}. ${copy.footer}`, locale);
}

function htmlPage(status: number, message: string, locale: string): NextResponse {
  const copy = getNewsletterCopy(locale);
  const body = `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"/><title>${MAGAZINE.name}</title></head>
<body style="font-family:Georgia,serif;background:#f4f7fb;color:#021d33;padding:48px 16px;text-align:center;">
  <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#005B96;">${copy.kicker}</p>
  <h1 style="font-size:28px;">${MAGAZINE.name}</h1>
  <p style="max-width:420px;margin:16px auto;line-height:1.6;">${message}</p>
</body>
</html>`;
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
