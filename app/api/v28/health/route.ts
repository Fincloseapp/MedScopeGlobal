import { NextResponse } from "next/server";
import { isSendGridConfigured } from "@/lib/email/sendgrid";
import { isSmtpConfigured } from "@/lib/email/smtp";
import {
  V28_ENGINE_VERSION,
  V28_SITE_UI_VERSION,
  V28_UI_BUILD_STAMP,
  V28_UI_VERSION,
} from "@/lib/v28/version";
import { V29_UI_VERSION } from "@/lib/v29/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V28_UI_VERSION,
    engine: V28_ENGINE_VERSION,
    ui: V28_UI_VERSION,
    siteUi: V28_SITE_UI_VERSION,
    currentVersion: V29_UI_VERSION,
    buildStamp: V28_UI_BUILD_STAMP,
    timestamp,
    service: "medscope-v28",
    compat: {
      note: "v28.2 compat layer — live site runs v29.0",
      v29Health: "/api/v29/health",
    },
    stripe: {
      secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    },
    email: {
      sendgrid: isSendGridConfigured(),
      smtp: isSmtpConfigured(),
      resend: Boolean(process.env.RESEND_API_KEY?.trim()),
      ready:
        isSendGridConfigured() ||
        isSmtpConfigured() ||
        Boolean(process.env.RESEND_API_KEY?.trim()),
    },
    features: [
      "stripe-webhook-v28.2",
      "stripe-webhook-v29",
      "email-engine-v28",
      "email-engine-v29",
      "sendgrid-smtp-fallback",
      "ai-email-generator",
      "invoice-generator",
      "ai-newsletter",
      "admin-email-logs",
      "homepage-v29.0",
      "academy-v35-compat",
    ],
    ts: timestamp,
  });
}
