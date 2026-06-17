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
  return NextResponse.json({
    ok: true,
    version: V28_ENGINE_VERSION,
    ui: V28_UI_VERSION,
    buildStamp: V28_UI_BUILD_STAMP,
    service: "medscope-v28",
    email: {
      sendgrid: isSendGridConfigured(),
      smtp: isSmtpConfigured(),
    },
    features: [
      "email-engine-v28",
      "sendgrid-smtp-fallback",
      "ai-email-generator",
      "email-templates",
      "invoice-generator",
      "ai-newsletter",
      "notifications-engine",
      "deliverability-monitor",
      "admin-email-logs",
      "homepage-v28",
      "subscription-monthly-annual",
      "academy-v35-compat",
    ],
    audiences: ["public", "student", "physician", "b2b"],
    ts: new Date().toISOString(),
  });
}
