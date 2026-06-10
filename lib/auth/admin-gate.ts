import { cookies } from "next/headers";

import { getAdminGatePassword } from "@/lib/auth/admin-gate-config";



const COOKIE = "ms_admin_gate";



export async function isAdminGateOpen(): Promise<boolean> {

  const jar = await cookies();

  return jar.get(COOKIE)?.value === getAdminGatePassword();

}



export function adminGateCookieValue(): string {

  return getAdminGatePassword();

}



export const ADMIN_GATE_COOKIE = COOKIE;



export { getAdminGatePassword } from "@/lib/auth/admin-gate-config";


