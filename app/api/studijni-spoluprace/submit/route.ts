import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";

const schema = z.object({
  title: z.string().min(3).max(200),
  organization: z.string().min(2).max(200),
  summary: z.string().min(20).max(2000),
  body: z.string().max(20000).optional(),
  specialty: z.string().max(100).optional(),
  phase: z.string().max(80).optional(),
  contact_email: z.string().email().optional(),
  apply_url: z.string().url().optional().or(z.literal("")),
});

function slugify(title: string) {
  return `${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat(`-${Date.now().toString(36)}`);
}

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "study_submit" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("study_collaborations")
    .insert({
      title: sanitizeText(body.title, 200),
      slug: slugify(body.title),
      organization: sanitizeText(body.organization, 200),
      summary: sanitizeText(body.summary, 2000),
      body: body.body ? sanitizeText(body.body, 20000) : null,
      specialty: body.specialty ? sanitizeText(body.specialty, 100) : null,
      phase: body.phase ? sanitizeText(body.phase, 80) : null,
      contact_email: body.contact_email?.trim().toLowerCase() ?? null,
      apply_url: body.apply_url || null,
      published: false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
