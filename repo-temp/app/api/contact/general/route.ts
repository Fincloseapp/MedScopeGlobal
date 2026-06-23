import { NextResponse } from "next/server";
import { getContactRecipient, sendContactEmail } from "@/lib/services/contact-mail";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    action: "contact_general",
  });
  if (!guard.ok) return guard.response;

  try {
    const payload = await request.json();
    const name = sanitizeText(String(payload.name ?? ""), 200);
    const email = sanitizeText(String(payload.email ?? ""), 320);
    const organization = sanitizeText(String(payload.organization ?? ""), 200);
    const message = sanitizeText(String(payload.message ?? ""), 5000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const recipient = getContactRecipient("general");
    await sendContactEmail({
      kind: "general",
      recipient,
      subject: `Nová zpráva z kontaktního formuláře: ${name}`,
      html: `
        <h2>Nová zpráva</h2>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Organizace:</strong> ${organization || "neuvedeno"}</p>
        <p><strong>Zpráva:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
      text: `Jméno: ${name}\nE-mail: ${email}\nOrganizace: ${organization || "neuvedeno"}\n\n${message}`,
      payload: {
        name,
        email,
        organization,
        message,
      },
    });

    return NextResponse.json({ ok: true, message: "Děkujeme za zprávu, ozveme se vám co nejdříve." });
  } catch (error) {
    console.error("contact/general failed", error);
    return NextResponse.json({ error: "Unable to submit message" }, { status: 500 });
  }
}
