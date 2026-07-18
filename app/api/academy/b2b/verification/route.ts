import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isValidClkId } from "@/lib/academy/b2b/verification";
import { MEDICAL_SPECIALIZATIONS } from "@/types/academy-b2b";

export const dynamic = "force-dynamic";

const specializationValues = MEDICAL_SPECIALIZATIONS.map((s) => s.value) as [
  string,
  ...string[],
];

const bodySchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  clk_id: z.string().trim().min(3).max(32),
  specialization: z.enum(specializationValues),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Auth není dostupná" }, { status: 401 });
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: "Přihlaste se" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!isValidClkId(parsed.data.clk_id)) {
      return NextResponse.json(
        { ok: false, error: "Neplatný formát ČLK čísla" },
        { status: 400 }
      );
    }

    const admin = createServiceRoleClient();
    const fullName = `${parsed.data.first_name} ${parsed.data.last_name}`.trim();

    // Unique CLK across users
    const { data: clash } = await admin
      .from("users")
      .select("id")
      .eq("clk_id", parsed.data.clk_id)
      .neq("id", auth.user.id)
      .maybeSingle();

    if (clash?.id) {
      return NextResponse.json(
        { ok: false, error: "Toto ČLK číslo je již přiřazeno jinému účtu" },
        { status: 409 }
      );
    }

    // Check existing verified record
    const { data: existingVerification } = await admin
      .from("clk_verifications")
      .select("id, status")
      .eq("user_id", auth.user.id)
      .eq("clk_number", parsed.data.clk_id)
      .eq("status", "verified")
      .maybeSingle();

    const verified = Boolean(existingVerification?.id);

    const { error: userErr } = await admin
      .from("users")
      .update({
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        full_name: fullName,
        clk_id: parsed.data.clk_id,
        specialization: parsed.data.specialization,
        verified_doctor: verified,
      })
      .eq("id", auth.user.id);

    if (userErr) {
      return NextResponse.json({ ok: false, error: userErr.message }, { status: 500 });
    }

    if (!verified) {
      await admin.from("clk_verifications").insert({
        user_id: auth.user.id,
        email: auth.user.email,
        full_name: fullName,
        clk_number: parsed.data.clk_id,
        status: "manual_review",
        method: "manual",
        audit_log: [
          {
            at: new Date().toISOString(),
            event: "submitted_for_cme_access",
            specialization: parsed.data.specialization,
          },
        ],
      });
    }

    return NextResponse.json({
      ok: true,
      verified,
      message: verified
        ? undefined
        : "Údaje uloženy. Po manuálním ověření ČLK získáte přístup do Lékařské zóny.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
