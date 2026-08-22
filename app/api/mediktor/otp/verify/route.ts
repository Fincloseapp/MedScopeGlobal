import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { verifyOtpChallenge } from "@/lib/mediktor/otp";
import { establishMediktorSession } from "@/lib/mediktor/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().min(4).max(12),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "mediktor_otp_verify" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup." }, { status: 400 });
  }

  const verified = await verifyOtpChallenge({
    challengeId: body.challengeId,
    code: body.code,
  });

  if (!verified.ok) {
    return NextResponse.json(
      { error: verified.error, code: verified.code },
      { status: verified.status }
    );
  }

  const email =
    verified.channel === "email" ? verified.destination : null;
  const phone =
    verified.phone ||
    (verified.channel === "sms" ? verified.destination : null);

  const session = await establishMediktorSession({ email, phone });
  if (!session.ok) {
    return NextResponse.json(
      { error: session.error },
      { status: session.status }
    );
  }

  return NextResponse.json({
    ok: true,
    created: session.user.created,
    user: {
      id: session.user.id,
      email: session.user.email,
      phone: session.user.phone,
    },
    next: "/app/dokumentace",
  });
}
