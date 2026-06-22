import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { sendTestDigestEmail } from "@/lib/academy/marketing/test-digest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { to?: string };
    const result = await sendTestDigestEmail(body.to);
    return NextResponse.json({
      ok: true,
      sent: result.sent,
      mode: result.mode,
      to: result.to,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
