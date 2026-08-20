import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPrepOtp } from "@/lib/mediprep/otp";
import { withApiGuard } from "@/lib/security/api-guard";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "mediprep_otp_request" });
  if (!guard.ok) return guard.response;
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Zadejte platný e-mail." }, { status: 400 });
  }
  const result = await requestPrepOtp(parsed.data.email);
  return NextResponse.json(result);
}
