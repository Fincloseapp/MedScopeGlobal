import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { sendViaSendGrid, isSendGridConfigured } from "@/lib/email/sendgrid";
import { persistEmailLog } from "@/lib/email/log";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim() ?? process.env.ACADEMY_NEWSLETTER_TO?.trim();
  if (!to) {
    return NextResponse.json({ error: "ADMIN_NOTIFY_EMAIL not set" }, { status: 400 });
  }

  const configured = isSendGridConfigured();
  const result = await sendViaSendGrid({
    to,
    subject: "[v29 test] SendGrid health check",
    html: "<p>MedScope v29 SendGrid test — OK.</p>",
    text: "MedScope v29 SendGrid test — OK.",
    category: "system",
    metadata: { test: "sendgrid" },
  });

  await persistEmailLog({
    sent_at: new Date().toISOString(),
    email_type: "system",
    recipient: to,
    subject: "[v29 test] SendGrid health check",
    status: result.ok ? "sent" : "failed",
    response_code: result.statusCode || null,
    provider: "sendgrid",
    fallback_used: false,
    message_id: result.messageId ?? null,
    error: result.error ?? null,
    metadata: { test: true, configured },
  });

  return NextResponse.json({
    ok: result.ok,
    configured,
    statusCode: result.statusCode,
    messageId: result.messageId,
    error: result.error,
  });
}
