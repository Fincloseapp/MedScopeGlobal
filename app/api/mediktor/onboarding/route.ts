import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { getDoctorVerification } from "@/lib/mediktor/verification";
import { getIntegration } from "@/lib/mediktor/integration";
import { markOnboardingCompleted } from "@/lib/mediktor/session";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  completed: z.boolean().optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    action: "mediktor_onboarding_get",
    requireAuth: false,
    userId: user?.id,
  });
  if (!guard.ok) return guard.response;

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      needsOnboarding: true,
      step: "welcome",
    });
  }

  const admin = tryCreateServiceRoleClient();
  let onboardingCompleted = false;
  if (admin) {
    const { data } = await admin
      .from("users")
      .select("mediktor_onboarding_completed, access_level, verified_doctor")
      .eq("id", user.id)
      .maybeSingle();
    onboardingCompleted = Boolean(data?.mediktor_onboarding_completed);
    // Existing verified physicians skip wizard
    if (data?.verified_doctor) onboardingCompleted = true;
  }

  const [verification, integration, eligibility] = await Promise.all([
    getDoctorVerification(user.id),
    getIntegration(user.id),
    getDokumentaceEligibility(user.id),
  ]);

  let step: string = "main";
  if (!onboardingCompleted) {
    if (verification.status === "none") step = "verify";
    else if (!integration) step = "integration";
    else step = "main";
  }

  return NextResponse.json({
    authenticated: true,
    needsOnboarding: !onboardingCompleted,
    step,
    verification,
    integration,
    eligibility: {
      eligible: eligibility.eligible,
      message: eligibility.message,
      verifiedDoctor: eligibility.verifiedDoctor,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "mediktor_onboarding_patch",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup." }, { status: 400 });
  }

  if (body.completed) {
    await markOnboardingCompleted(user.id);
  }

  return NextResponse.json({ ok: true });
}
