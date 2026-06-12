import { cookies } from "next/headers";

import {
  ADMIN_GATE_COOKIE,
  getAdminGatePassword,
  isValidAdminGateCookie,
} from "@/lib/auth/admin-gate-config";

const COOKIE = ADMIN_GATE_COOKIE;

export async function isAdminGateOpen(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminGateCookie(jar.get(COOKIE)?.value);
}

export { isValidAdminGateCookie } from "@/lib/auth/admin-gate-config";



export function adminGateCookieValue(): string {

  return getAdminGatePassword();

}



export const ADMIN_GATE_COOKIE = COOKIE;



export { getAdminGatePassword } from "@/lib/auth/admin-gate-config";


