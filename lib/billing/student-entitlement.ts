import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/** Student club unlock — not physician VIP. Paying 149 Kč must open unlimited quiz runs. */
export function studentClubOpenFromProfile(opts: {
  isVip?: boolean;
  accessLevel?: string | null;
}): boolean {
  const tier = String(opts.accessLevel ?? "");
  return Boolean(opts.isVip || tier === "student" || tier === "physician");
}

export async function grantStudentClubAccess(userId: string): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  const { data } = await admin.from("users").select("access_level").eq("id", userId).maybeSingle();
  if (data?.access_level === "physician") return;
  await admin.from("users").update({ access_level: "student" }).eq("id", userId);
}

export async function revokeStudentClubAccess(userId: string): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  const { data } = await admin.from("users").select("access_level").eq("id", userId).maybeSingle();
  if (data?.access_level !== "student") return;
  await admin.from("users").update({ access_level: "public" }).eq("id", userId);
}
