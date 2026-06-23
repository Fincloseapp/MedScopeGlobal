"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const BUCKET = "verification-documents";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function uploadVerificationDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Přihlaste se pro nahrání dokladu." };
  }

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vyberte soubor (PDF nebo obrázek)." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Soubor je příliš velký (max 8 MB)." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { error: "Povolené formáty: PDF, JPG, PNG, WebP." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const admin = createServiceRoleClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadErr) {
    if (uploadErr.message.includes("Bucket not found")) {
      return {
        error:
          "Úložiště verification-documents není v Supabase. Vytvořte private bucket v Storage.",
      };
    }
    return { error: uploadErr.message };
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  const documentUrl = urlData.publicUrl;

  const { error: updateErr } = await admin
    .from("users")
    .update({
      verification_document_url: documentUrl,
      verification_status: "ai_review",
      profession: (formData.get("profession") as string) || undefined,
    })
    .eq("id", user.id);

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath("/account");
  revalidatePath("/access-levels");
  return { ok: true, status: "ai_review" as const };
}

export async function requestPhysicianAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nepřihlášen" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("users")
    .update({
      access_level: "physician",
      verification_status: "pending",
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account");
  return { ok: true };
}

export async function approveVerificationForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  await reviewVerification(userId, "approved");
}

export async function rejectVerificationForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  await reviewVerification(userId, "rejected");
}

export async function reviewVerification(
  userId: string,
  decision: "approved" | "rejected"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") return { error: "Admin only" };

  const admin = createServiceRoleClient();
  const patch =
    decision === "approved"
      ? {
          verification_status: "approved",
          access_level: "physician",
        }
      : { verification_status: "rejected" };

  const { error } = await admin.from("users").update(patch).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/verification");
  return { ok: true };
}
