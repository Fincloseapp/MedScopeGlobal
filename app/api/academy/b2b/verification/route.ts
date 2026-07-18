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

    // Self-attestation with unique ČLK ID unlocks Lékařská zóna immediately.
    // Trigger sync_verified_doctor_from_clk keeps users.verified_doctor consistent.
    const { data: existing } = await admin
      .from("clk_verifications")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("clk_number", parsed.data.clk_id)
      .maybeSingle();

    if (existing?.id) {
      const { error: updErr } = await admin
        .from("clk_verifications")
        .update({
          status: "verified",
          full_name: fullName,
          email: auth.user.email,
          method: "self_attestation",
        })
        .eq("id", existing.id);
      if (updErr) {
        return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
      }
    } else {
      const { error: insErr } = await admin.from("clk_verifications").insert({
        user_id: auth.user.id,
        email: auth.user.email,
        full_name: fullName,
        clk_number: parsed.data.clk_id,
        status: "verified",
        method: "self_attestation",
        audit_log: [
          {
            at: new Date().toISOString(),
            event: "self_attested_for_cme_access",
            specialization: parsed.data.specialization,
          },
        ],
      });
      if (insErr) {
        return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
      }
    }

    const { error: userErr } = await admin
      .from("users")
      .update({
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        full_name: fullName,
        clk_id: parsed.data.clk_id,
        specialization: parsed.data.specialization,
        verified_doctor: true,
      })
      .eq("id", auth.user.id);

    if (userErr) {
      return NextResponse.json({ ok: false, error: userErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      message: "ČLK ověření uloženo. Máte přístup do Lékařské zóny.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
