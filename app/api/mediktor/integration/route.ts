import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  getIntegration,
  upsertIntegration,
  INTEGRATION_PRESETS,
} from "@/lib/mediktor/integration";
import { markOnboardingCompleted } from "@/lib/mediktor/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  skip: z.boolean().optional(),
  active: z.boolean().optional(),
  integrationType: z
    .enum(["export", "webhook", "hl7", "fhir", "api"])
    .optional(),
  presetTarget: z.string().max(80).optional().nullable(),
  formats: z
    .array(z.enum(["text", "pdf", "docx", "hl7", "fhir"]))
    .optional(),
  webhookUrl: z.string().max(2000).optional().nullable(),
  apiKeyHint: z.string().max(200).optional().nullable(),
  completeOnboarding: z.boolean().optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "mediktor_integration_get",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  const integration = await getIntegration(user.id);
  return NextResponse.json({ integration, presets: INTEGRATION_PRESETS });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "mediktor_integration_upsert",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Neplatný vstup." }, { status: 400 });
  }

  const result = await upsertIntegration(user.id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (body.completeOnboarding || body.skip) {
    await markOnboardingCompleted(user.id);
  }

  return NextResponse.json({ ok: true, integration: result.integration });
}
