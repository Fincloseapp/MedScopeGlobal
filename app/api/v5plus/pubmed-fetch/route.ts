import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { upsertMedicalSourceFromPubMed } from "@/lib/v5plus/pubmed-metadata";

const schema = z.object({
  doi: z.string().optional(),
  pubmedId: z.string().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    action: "v5plus_pubmed_fetch",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!body.doi && !body.pubmedId) {
    return NextResponse.json({ error: "doi or pubmedId required" }, { status: 400 });
  }

  try {
    const result = await upsertMedicalSourceFromPubMed({
      doi: body.doi,
      pubmedId: body.pubmedId,
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
