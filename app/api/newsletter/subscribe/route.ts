import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { isSendGridConfigured, upsertSendGridContact } from "@/lib/email/sendgrid";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

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

  let stored = false;
  let duplicate = false;
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    const { error } = await admin.from("newsletter_subscribers").insert({
      email,
      locale,
      segment,
      source,
    });
    if (!error) {
      stored = true;
    } else if (error.code === "23505") {
      stored = true;
      duplicate = true;
    } else {
      const { error: fallbackError } = await admin.from("analytics").insert({
        event: "newsletter_subscribe",
        payload: { email, locale, segment, source, pending_table: true },
      });
      if (!fallbackError) stored = true;
    }
  }

  let mailed = false;
  if (isSendGridConfigured()) {
    const sg = await upsertSendGridContact(email, listIdForSegment(segment));
    mailed = sg.ok;
  }

  if (!stored && !mailed) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  if (!duplicate) {
    await logMonetizationEvent("newsletter_subscribe", {
      locale,
      segment,
      source,
      stored,
      mailed,
    });
  }

  return NextResponse.json({
    ok: true,
    already: duplicate,
    stored,
    mailed,
  });
}
