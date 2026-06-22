import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { upsertMedicalSourceFromRegulatory } from "@/lib/v5plus/regulatory-fetch";

const schema = z.object({
  drugName: z.string().min(2).max(200),
  agency: z.enum(["fda", "ema", "sukl"]),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    action: "v5plus_regulatory_fetch",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await upsertMedicalSourceFromRegulatory(
      body.drugName,
      body.agency
    );
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
