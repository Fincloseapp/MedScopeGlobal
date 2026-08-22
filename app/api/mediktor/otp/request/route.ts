import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getClientIp } from "@/lib/security/client-ip";
import { createAndSendOtp } from "@/lib/mediktor/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().max(320).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
});

export async function POST(request: Request) {
  // www/apex Origin both allowed via assertSameOrigin (api-guard).
  const guard = await withApiGuard(request, { action: "mediktor_otp_request" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup." }, { status: 400 });
  }

  const result = await createAndSendOtp({
    email: body.email,
    phone: body.phone,
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
        phone: result.phone,
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    ok: true,
    channel: result.channel,
    destinationMasked: result.destinationMasked,
    challengeId: result.challengeId,
    expiresInSec: result.expiresInSec,
    smsGap: result.smsGap ?? false,
    ...(result.debugCode ? { debugCode: result.debugCode } : {}),
  });
}
