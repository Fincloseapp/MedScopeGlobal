"use server";

import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminEvent } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

export async function uploadMediaAsset(formData: FormData) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Missing file");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${gate.user.id}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("media")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (upErr) {
    throw upErr;
  }

  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

  const { error: insErr } = await supabase.from("media").insert({
    file_path: path,
    public_url: pub.publicUrl,
    mime_type: file.type,
    uploaded_by: gate.user.id,
  });

  if (insErr) {
    throw insErr;
  }

  await logAdminEvent("MEDIA_UPLOAD", { path, public_url: pub.publicUrl });
  return pub.publicUrl;
}

export async function deleteMediaAsset(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from("media")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row?.file_path) {
    throw new Error("Not found");
  }

  const { error: rmErr } = await supabase.storage
    .from("media")
    .remove([row.file_path]);

  if (rmErr) {
    throw rmErr;
  }

  const { error: delErr } = await supabase.from("media").delete().eq("id", id);
  if (delErr) {
    throw delErr;
  }

  await logAdminEvent("MEDIA_DELETE", { media_id: id });
}
