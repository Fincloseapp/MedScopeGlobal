import { cookies } from "next/headers";
import { ADMIN_GATE_COOKIE, getAdminGatePassword } from "@/lib/auth/admin-gate";

export async function isAdminApiAuthorized(request: Request): Promise<boolean> {
  const jar = await cookies();
  if (jar.get(ADMIN_GATE_COOKIE)?.value === getAdminGatePassword()) return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return auth === `Bearer ${secret}` || querySecret === secret;
}
