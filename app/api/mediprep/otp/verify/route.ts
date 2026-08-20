import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPrepOtp } from "@/lib/mediprep/otp";
import { MEDIPREP_OTP_COOKIE } from "@/lib/mediprep/session";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "mediprep_otp_verify" });
  if (!guard.ok) return guard.response;
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "E-mail a kód jsou povinné." }, { status: 400 });
  }
  const result = verifyPrepOtp(parsed.data.email, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }
  const res = NextResponse.json({
    ok: true,
    message: `E-mail ${result.email} je ověřený. První test je odemčený.`,
    email: result.email,
  });
  res.cookies.set(MEDIPREP_OTP_COOKIE, result.email, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}
