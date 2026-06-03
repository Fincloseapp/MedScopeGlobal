import { NextResponse } from "next/server";
import { getContactRecipient, sendContactEmail } from "@/lib/services/contact-mail";

const allowedKinds = new Set(["general", "partner"]);

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;

  if (!allowedKinds.has(kind)) {
    return NextResponse.json({ error: "Unsupported contact kind" }, { status: 400 });
  }

  let payload: {
    name: string;
    email: string;
    organization?: string;
    phone?: string;
    message: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const name = sanitize(payload.name);
  const email = sanitize(payload.email);
  const message = sanitize(payload.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const recipient = getContactRecipient(kind as "general" | "partner");
  const subject = kind === "partner"
    ? `Nová partnerská poptávka z MedScopeGlobal`
    : `Nový kontakt z MedScopeGlobal`;

  const text = [
    `Jméno: ${name}`,
    `E-mail: ${email}`,
    `Organizace: ${sanitize(payload.organization) || "-"}`,
    `Telefon: ${sanitize(payload.phone) || "-"}`,
    "",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1e293b;">
      <h2 style="margin: 0 0 12px;">Nová zpráva z kontaktního formuláře</h2>
      <p style="margin: 0 0 8px;"><strong>Jméno:</strong> ${name}</p>
      <p style="margin: 0 0 8px;"><strong>E-mail:</strong> ${email}</p>
      <p style="margin: 0 0 8px;"><strong>Organizace:</strong> ${sanitize(payload.organization) || "-"}</p>
      <p style="margin: 0 0 8px;"><strong>Telefon:</strong> ${sanitize(payload.phone) || "-"}</p>
      <p style="margin: 16px 0 8px;"><strong>Zpráva:</strong></p>
      <div style="white-space: pre-wrap; line-height: 1.5;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </div>
  `;

  try {
    await sendContactEmail({
      kind: kind as "general" | "partner",
      recipient,
      subject,
      html,
      text,
      payload: {
        name,
        email,
        organization: sanitize(payload.organization),
        phone: sanitize(payload.phone),
        message,
      },
    });

    return NextResponse.json({ ok: true, recipient, kind });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to send contact email",
    }, { status: 500 });
  }
}
