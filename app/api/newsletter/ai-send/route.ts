import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import {
  sendAiNewsletter,
  sendAllSegmentNewsletters,
  type NewsletterSegment,
} from "@/lib/newsletter/ai-newsletter";

const schema = z.object({
  segment: z.enum(["public", "students", "doctors", "all"]).default("all"),
  useAcademyDigest: z.boolean().optional(),
});

/** Admin: trigger AI newsletter engine for one or all segments. */
export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.segment === "all") {
    const results = await sendAllSegmentNewsletters();
    return NextResponse.json({ ok: results.every((r) => r.sent), results });
  }

  const result = await sendAiNewsletter(body.segment as NewsletterSegment, {
    useAcademyDigest: body.useAcademyDigest,
  });
  return NextResponse.json({ ok: result.sent, result });
}
