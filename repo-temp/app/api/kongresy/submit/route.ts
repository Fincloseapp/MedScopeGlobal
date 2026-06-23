import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";

const schema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().max(4000).optional(),
  body: z.string().max(20000).optional(),
  starts_at: z.string().optional(),
  location: z.string().max(200).optional(),
  price_hint: z.string().max(120).optional(),
  registration_url: z.string().url().optional().or(z.literal("")),
  organizer: z.string().max(200).optional(),
  specialty: z.string().max(100).optional(),
  source_url: z.string().url().optional(),
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
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "congress_submit" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("congress_events")
    .insert({
      title: sanitizeText(body.title, 200),
      slug: slugify(body.title),
      summary: body.summary ? sanitizeText(body.summary, 4000) : null,
      body: body.body ? sanitizeText(body.body, 20000) : null,
      starts_at: body.starts_at || null,
      location: body.location ? sanitizeText(body.location, 200) : null,
      price_hint: body.price_hint ? sanitizeText(body.price_hint, 120) : null,
      registration_url: body.registration_url || null,
      organizer: body.organizer ? sanitizeText(body.organizer, 200) : null,
      specialty: body.specialty ? sanitizeText(body.specialty, 100) : null,
      source_url: body.source_url ?? null,
      published: false,
      ai_extracted: body.source_url ? { source_url: body.source_url } : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
