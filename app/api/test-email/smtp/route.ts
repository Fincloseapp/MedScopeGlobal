import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { isSmtpConfigured, sendViaSmtp } from "@/lib/email/smtp";
import { persistEmailLog } from "@/lib/email/log";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim() ?? process.env.SMTP_USER?.trim();
  if (!to) {
    return NextResponse.json({ error: "ADMIN_NOTIFY_EMAIL or SMTP_USER not set" }, { status: 400 });
  }

  const configured = isSmtpConfigured();
  const result = await sendViaSmtp({
    to,
    subject: "[v29 test] SMTP health check",
    html: "<p>MedScope v29 SMTP test — OK.</p>",
    text: "MedScope v29 SMTP test — OK.",
    category: "system",
    metadata: { test: "smtp" },
  });

  await persistEmailLog({
    sent_at: new Date().toISOString(),
    email_type: "system",
    recipient: to,
    subject: "[v29 test] SMTP health check",
    status: result.ok ? "sent" : "failed",
    response_code: result.statusCode || null,
    provider: "smtp",
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
