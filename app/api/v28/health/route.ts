import { NextResponse } from "next/server";
import { isSendGridConfigured } from "@/lib/email/sendgrid";
import { isSmtpConfigured } from "@/lib/email/smtp";
import {
  V28_ENGINE_VERSION,
  V28_UI_BUILD_STAMP,
  V28_UI_VERSION,
} from "@/lib/v28/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V28_UI_VERSION,
    engine: V28_ENGINE_VERSION,
    ui: V28_UI_VERSION,
    buildStamp: V28_UI_BUILD_STAMP,
    timestamp,
    service: "medscope-v28",
    stripe: {
      secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    },
    email: {
      sendgrid: isSendGridConfigured(),
      smtp: isSmtpConfigured(),
    },
    features: [
      "stripe-webhook-v28.2",
      "email-engine-v28",
      "sendgrid-smtp-fallback",
      "ai-email-generator",
      "invoice-generator",
      "ai-newsletter",
      "admin-email-logs",
      "homepage-v28.2",
      "academy-v35-compat",
    ],
    ts: timestamp,
  });
}
