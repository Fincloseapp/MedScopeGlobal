import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";

const schema = z.object({
  title: z.string().min(3).max(200),
  company: z.string().min(2).max(200),
  specialization: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  employment_type: z.string().max(40).optional(),
  description: z.string().min(20).max(20000),
  requirements: z.string().max(10000).optional(),
  salary_hint: z.string().max(200).optional(),
  contact_email: z.string().email().optional(),
  apply_url: z.string().url().optional().or(z.literal("")),
});

function slugify(title: string, company: string) {
  const base = `${company}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "job_submit" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const slug = slugify(body.title, body.company);

  const { data, error } = await admin
    .from("job_postings")
    .insert({
      title: sanitizeText(body.title, 200),
      slug,
      company: sanitizeText(body.company, 200),
      specialization: body.specialization ? sanitizeText(body.specialization, 100) : null,
      region: body.region ? sanitizeText(body.region, 100) : null,
      employment_type: body.employment_type ? sanitizeText(body.employment_type, 40) : null,
      description: sanitizeText(body.description, 20000),
      requirements: body.requirements ? sanitizeText(body.requirements, 10000) : null,
      salary_hint: body.salary_hint ? sanitizeText(body.salary_hint, 200) : null,
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
