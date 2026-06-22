import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { submitClkVerification } from "@/lib/auth/clk-verify";
import { getClientIp } from "@/lib/security/client-ip";
import { withApiGuard } from "@/lib/security/api-guard";
import { z } from "zod";

const schema = z.object({
  clkNumber: z.string().min(4).max(20),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "clk_verify" });
  if (!guard.ok) return guard.response;

  const { user, profile } = await getSessionProfile();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    const raw = await request.json();
    body = schema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await submitClkVerification({
      userId: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      clkNumber: body.clkNumber,
      actorId: user.id,
      ip: getClientIp(request),
    });

    return NextResponse.json({
      ok: result.ok,
      status: result.status,
      method: result.method,
      message: result.message,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { user } = await getSessionProfile();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { getClkVerificationStatus } = await import("@/lib/auth/clk-verify");
  const status = await getClkVerificationStatus(user.id);
  return NextResponse.json({ status });
}
