import { NextResponse } from "next/server";
import { parseSendGridEvents, recordDeliverabilityEvents } from "@/lib/email/monitor";

/** SendGrid Event Webhook — configure in SendGrid dashboard. */
export async function POST(request: Request) {
  const secret = process.env.SENDGRID_WEBHOOK_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events = parseSendGridEvents(body);
  await recordDeliverabilityEvents(events);

  return NextResponse.json({ ok: true, processed: events.length });
}
