import { NextResponse } from "next/server";
import { buildCmeCertificatePdfById } from "@/lib/academy/b2b/certificates";
import {
  physicianGateJsonError,
  requireVerifiedPhysician,
} from "@/lib/academy/b2b/verification";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireVerifiedPhysician();
  if (!gate.ok) return physicianGateJsonError(gate);

  const { id } = await params;

  try {
    const admin = createServiceRoleClient();
    const { data: cert } = await admin
      .from("certificates")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (!cert) {
      return NextResponse.json({ error: "Certifikát nenalezen" }, { status: 404 });
    }

    if (cert.user_id !== gate.userId) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 403 });
    }

    const built = await buildCmeCertificatePdfById(id);
    if (!built) {
      return NextResponse.json({ error: "Certifikát nenalezen" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(built.pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${built.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
