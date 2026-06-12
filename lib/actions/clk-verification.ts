"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { reviewClkVerification, submitClkVerification } from "@/lib/auth/clk-verify";
import { getSessionProfile } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/client-ip";
import { headers } from "next/headers";

export async function submitClkVerificationForm(formData: FormData) {
  const { user, profile } = await getSessionProfile();
  if (!user) return { error: "Přihlaste se pro ověření ČLK." };

  const clkNumber = String(formData.get("clkNumber") ?? "").trim();
  if (!clkNumber) return { error: "Zadejte evidenční číslo ČLK." };

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;

  try {
    const result = await submitClkVerification({
      userId: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      clkNumber,
      actorId: user.id,
      ip: ip ?? getClientIp(new Request("http://local")),
    });

    revalidatePath("/odborna");
    revalidatePath("/account");
    revalidatePath("/admin/clk-verifications");

    return {
      ok: true,
      message: result.message,
      status: result.status,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Ověření se nezdařilo.",
    };
  }
}

export async function adminReviewClkFormAction(formData: FormData): Promise<void> {
  await adminReviewClkForm(formData);
}

export async function adminReviewClkForm(formData: FormData) {
  const gateOpen = await isAdminGateOpen();
  if (!gateOpen) return { error: "Admin gate required" };

  const id = String(formData.get("id") ?? "");
  const decision = formData.get("decision");
  if (!id || (decision !== "verified" && decision !== "rejected")) {
    return { error: "Neplatný požadavek." };
  }

  try {
    await reviewClkVerification({
      id,
      decision,
      note: String(formData.get("note") ?? "") || undefined,
    });
    revalidatePath("/admin/clk-verifications");
    revalidatePath("/odborna");
    redirect("/admin/clk-verifications");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Schválení se nezdařilo.",
    };
  }
}
