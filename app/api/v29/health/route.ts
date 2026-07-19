import { NextResponse } from "next/server";
import { isSendGridConfigured } from "@/lib/email/sendgrid";
import { isSmtpConfigured } from "@/lib/email/smtp";
import {
  V29_ENGINE_VERSION,
  V29_UI_BUILD_STAMP,
  V29_UI_VERSION,
} from "@/lib/v29/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V29_UI_VERSION,
    engine: V29_ENGINE_VERSION,
    ui: V29_UI_VERSION,
    buildStamp: V29_UI_BUILD_STAMP,
    timestamp,
    service: "medscope-v29",
    stripe: {
      secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
      webhookUrl: "https://www.medscopeglobal.com/api/stripe/webhook",
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
      "stripe-webhook-v29",
      "email-engine-v29",
      "sendgrid-smtp-fallback",
      "ai-email-generator",
      "invoice-generator",
      "ai-newsletter",
      "admin-email-logs",
      "homepage-v32.0",
      "academy-v35-compat",
      "subscription-monthly-annual",
      "image-purge-v29",
      "security-v30",
      "performance-v31",
      "autopilot-v32",
    ],
    compat: {
      v28: "/api/v28/health",
      v27: "/api/v27/health",
      v30: "/api/v30/health",
      v31: "/api/v31/health",
      v32: "/api/v32/health",
    },
    ts: timestamp,
  });
}
