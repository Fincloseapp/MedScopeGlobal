import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  getDoctorVerification,
  submitDoctorVerification,
  type VerificationMethod,
} from "@/lib/mediktor/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  methods: z
    .array(z.enum(["id_photo", "license", "facility_ico", "work_email"]))
    .min(1)
    .max(4),
  licenseNumber: z.string().max(80).optional().nullable(),
  facilityIco: z.string().max(20).optional().nullable(),
  workEmail: z.string().max(320).optional().nullable(),
  idPhotoPath: z.string().max(500).optional().nullable(),
  idFileName: z.string().max(260).optional().nullable(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "mediktor_verification_get",
  });
  if (!guard.ok) return guard.response;
  if (!user) {
    return NextResponse.json({ error: "Přihlášení vyžadováno." }, { status: 401 });
  }

  const verification = await getDoctorVerification(user.id);
  return NextResponse.json({ verification });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireAuth: true,
    userId: user?.id,
    action: "mediktor_verification_submit",
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

  const result = await submitDoctorVerification({
    userId: user.id,
    methods: body.methods as VerificationMethod[],
    licenseNumber: body.licenseNumber,
    facilityIco: body.facilityIco,
    workEmail: body.workEmail,
    idPhotoPath: body.idPhotoPath,
    idFileName: body.idFileName,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, verification: result.verification });
}
