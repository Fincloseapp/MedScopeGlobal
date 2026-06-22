import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { generateEmailContent } from "@/lib/email/ai-generator";
import { sendEmail } from "@/lib/email/engine";
import { isLlmConfigured } from "@/lib/ai/chat-json";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!to) {
    return NextResponse.json({ error: "ADMIN_NOTIFY_EMAIL not set" }, { status: 400 });
  }

  const content = await generateEmailContent({
    kind: "marketing",
    audience: "public",
    subjectHint: "v29 AI email test",
    context: { test: true },
  });

  const result = await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    category: "marketing",
    metadata: { test: "ai", stub: content.stub },
  });

  return NextResponse.json({
    ok: result.ok,
    llmConfigured: isLlmConfigured(),
    content: { subject: content.subject, stub: content.stub, provider: content.provider },
    send: result,
  });
}
