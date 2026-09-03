import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { isSendGridConfigured, upsertSendGridContact } from "@/lib/email/sendgrid";
import { logMonetizationEvent } from "@/lib/monetization/log-event";
import { applyNewsletterSubscriberSchema } from "@/lib/monetization/apply-schema";
import { notifyNewsletterSignup } from "@/lib/monetization/revenue-ops";
import {
  sendViaLongeVitaFirstBrief,
  sendViaLongeVitaWelcome,
} from "@/lib/monetization/vialongevita-brief";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(200),
  locale: z.string().max(16).optional(),
  segment: z.enum(["public", "doctors"]).optional(),
  source: z.string().max(80).optional(),
});

function listIdForSegment(segment: "public" | "doctors"): string | undefined {
  if (segment === "doctors") {
    return process.env.NEWSLETTER_DOCTORS_LIST?.trim() || undefined;
  }
  return (
    process.env.NEWSLETTER_PUBLIC_LIST?.trim() ||
    process.env.SENDGRID_ACADEMY_LIST_ID?.trim() ||
    undefined
  );
}

type Destination = "subscribers" | "analytics" | "sendgrid";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    action: "newsletter_subscribe",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const locale = (body.locale ?? "cs").trim() || "cs";
  const segment = body.segment ?? "public";
  const source = (body.source ?? "site").trim() || "site";

  const schemaApply = await applyNewsletterSubscriberSchema();

  let stored = false;
  let duplicate = false;
  let destination: Destination | null = null;
  const admin = tryCreateServiceRoleClient();

  async function insertSubscriber(): Promise<"ok" | "dup" | "missing" | "fail"> {
    if (!admin) return "fail";
    const { error } = await admin.from("newsletter_subscribers").insert({
      email,
      locale,
      segment,
      source,
    });
    if (!error) return "ok";
    if (error.code === "23505") return "dup";
    if (error.code === "PGRST205" || /newsletter_subscribers/i.test(error.message)) {
      return "missing";
    }
    return "fail";
  }

  if (admin) {
    let result = await insertSubscriber();
    if (result === "missing") {
      await applyNewsletterSubscriberSchema();
      result = await insertSubscriber();
    }
    if (result === "ok") {
      stored = true;
      destination = "subscribers";
    } else if (result === "dup") {
      stored = true;
      duplicate = true;
      destination = "subscribers";
      await admin
        .from("newsletter_subscribers")
        .update({ locale, source })
        .eq("email", email)
        .eq("segment", segment)
        .is("unsubscribed_at", null);
    } else {
      const { error: fallbackError } = await admin.from("analytics").insert({
        event: "newsletter_subscribe",
        payload: { email, locale, segment, source, pending_table: true },
      });
      if (!fallbackError) {
        stored = true;
        destination = "analytics";
      }
    }
  }

  let mailed = false;
  if (isSendGridConfigured()) {
    const sg = await upsertSendGridContact(email, listIdForSegment(segment));
    mailed = sg.ok;
    if (mailed && !destination) destination = "sendgrid";
  }

  if (!stored && !mailed) {
    return NextResponse.json(
      { error: "unavailable", schema: schemaApply },
      { status: 503 }
    );
  }

  let welcome = false;
  let firstBrief = false;
  let mailError: string | null = null;

  const shouldMail = stored || mailed;
  let needsFirstBrief = segment === "public" && !duplicate;
  if (shouldMail && duplicate && admin && segment === "public") {
    const { data: existing } = await admin
      .from("newsletter_subscribers")
      .select("last_brief_sent_at")
      .eq("email", email)
      .eq("segment", segment)
      .is("unsubscribed_at", null)
      .maybeSingle();
    needsFirstBrief = !existing?.last_brief_sent_at;
  }

  if (shouldMail) {
    if (!duplicate) {
      await logMonetizationEvent("newsletter_subscribe", {
        locale,
        segment,
        source,
        stored,
        mailed,
        destination,
      });
      await notifyNewsletterSignup({ email, locale, segment, source }).catch(() => undefined);
      welcome = await sendViaLongeVitaWelcome({ email, locale }).catch(() => false);
    }
    if (needsFirstBrief) {
      const brief = await sendViaLongeVitaFirstBrief({ email, locale }).catch((error) => ({
        ok: false,
        error: error instanceof Error ? error.message : "brief_failed",
      }));
      firstBrief = brief.ok && !("skipped" in brief && brief.skipped);
      if (!brief.ok) {
        mailError = brief.error ?? "brief_failed";
      }
    }
  }

  return NextResponse.json({
    ok: true,
    already: duplicate,
    stored,
    mailed,
    welcome,
    firstBrief,
    mailError,
    destination,
    schema: schemaApply.ok,
  });
}
