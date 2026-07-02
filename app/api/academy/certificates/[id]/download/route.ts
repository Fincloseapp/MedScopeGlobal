import { NextResponse } from "next/server";
import { generateCertificatePdf } from "@/lib/academy/certificates/generator";
import { getCertificateById, getCourseById } from "@/lib/academy/db";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();

    const cert = await getCertificateById(id);
    if (!cert) {
      return NextResponse.json({ error: "Certifikát nenalezen" }, { status: 404 });
    }

    if (!auth.user || auth.user.id !== cert.user_id) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }

    const course = await getCourseById(cert.course_id);
    const admin = createServiceRoleClient();
    const { data: userData } = await admin.auth.admin.getUserById(cert.user_id);
    const recipientName =
      userData.user?.user_metadata?.full_name ??
      userData.user?.email?.split("@")[0] ??
      "Student MedScope Academy";

    const meta = cert.metadata as { score?: number };
    const pdf = generateCertificatePdf({
      recipientName,
      courseTitle: course?.title ?? "MedScope Academy kurz",
      certificateCode: cert.certificate_code,
      issuedAt: new Date(cert.issued_at),
      score: meta.score,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certifikat-${cert.certificate_code}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
