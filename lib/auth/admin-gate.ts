import { cookies } from "next/headers";

import {
  ADMIN_GATE_COOKIE,
  getAdminGatePassword,
  isValidAdminGateCookie,
} from "@/lib/auth/admin-gate-config";

export async function isAdminGateOpen(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminGateCookie(jar.get(ADMIN_GATE_COOKIE)?.value);
}

export function adminGateCookieValue(): string {
  return getAdminGatePassword();
}

export {
  ADMIN_GATE_COOKIE,
  ADMIN_GATE_COOKIE_LEGACY,
  DEFAULT_ADMIN_NEXT_PATH,
  canonicalAdminPathname,
  getAdminGatePassword,
  hasValidAdminGateCookie,
  isAdminLoginPath,
  isValidAdminGateCookie,
  requiresAdminGate,
  safeAdminNextPath,
} from "@/lib/auth/admin-gate-config";
