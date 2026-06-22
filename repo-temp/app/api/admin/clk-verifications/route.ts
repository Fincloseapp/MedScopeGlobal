import { NextResponse } from "next/server";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { reviewClkVerification } from "@/lib/auth/clk-verify";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { readClkStore } from "@/lib/auth/clk-data-store";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const gateOpen = await isAdminGateOpen();
  if (!gateOpen) {
    return NextResponse.json({ error: "Admin gate required" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("clk_verifications")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    const fileStore = readClkStore();
    return NextResponse.json({
      source: "file",
      rows: fileStore.verifications,
    });
  }

  return NextResponse.json({
    source: "supabase",
    rows: data ?? [],
  });
}

const reviewSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["verified", "rejected"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(request: Request) {
  const gateOpen = await isAdminGateOpen();
  if (!gateOpen) {
    return NextResponse.json({ error: "Admin gate required" }, { status: 401 });
  }

  let body: z.infer<typeof reviewSchema>;
  try {
    body = reviewSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const record = await reviewClkVerification({
      id: body.id,
      decision: body.decision,
      note: body.note,
    });
    return NextResponse.json({ ok: true, record });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Review failed" },
      { status: 500 }
    );
  }
}
