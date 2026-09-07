import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { EDITORIAL_PAID_COOKIE, isEditorialCookieValid } from "@/lib/auth/editorial-cookie";

export function editorialAccessFromFlags(input: {
  isVip?: boolean;
  accessLevel?: string | null;
  hasPaidSubscription?: boolean;
}): boolean {
  const level = String(input.accessLevel ?? "").toLowerCase();
  return (
    input.isVip === true ||
    input.hasPaidSubscription === true ||
    level === "student" ||
    level === "physician"
  );
}

/** Active or trialing Stripe row — any paid plan also opens the magazine teaser. */
export async function hasActiveReaderSubscription(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .limit(5);

    if (!data?.length) return false;
    const now = Date.now();
    return data.some((row) => {
      const raw = row.current_period_end;
      if (!raw) return true;
      const end = new Date(String(raw)).getTime();
      return Number.isNaN(end) || end > now;
    });
  } catch {
    return false;
  }
}

/** Guest Editorial unlock after Stripe — cookie set by /api/v27/claim-editorial. */
export async function hasEditorialCookieAccess(): Promise<boolean> {
  try {
    const jar = await cookies();
    return isEditorialCookieValid(jar.get(EDITORIAL_PAID_COOKIE)?.value);
  } catch {
    return false;
  }
}
