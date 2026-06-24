import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendContactEmail, getContactRecipient } from "@/lib/services/contact-mail";

const schema = z.object({
  company: z.string().min(2).max(200),
  contact_person: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().max(4000).optional(),
  inquiry_type: z.string().max(60),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "b2b_inquiry" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.from("b2b_inquiries").insert({
    company: sanitizeText(body.company, 200),
    contact_person: sanitizeText(body.contact_person, 120),
    email: body.email.trim().toLowerCase(),
    phone: body.phone ? sanitizeText(body.phone, 40) : null,
    message: body.message ? sanitizeText(body.message, 4000) : null,
    inquiry_type: sanitizeText(body.inquiry_type, 60),
  });

  if (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  await sendContactEmail({
    kind: "partner",
    recipient: getContactRecipient("general"),
    subject: `[B2B] ${body.inquiry_type} — ${body.company}`,
    html: `<p>${body.company} — ${body.contact_person} (${body.email})</p><p>${body.message ?? ""}</p>`,
    text: `B2B ${body.inquiry_type}: ${body.company}`,
    payload: body,
  });

  return NextResponse.json({ ok: true });
}
