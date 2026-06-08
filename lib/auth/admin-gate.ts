import { cookies } from "next/headers";

const COOKIE = "ms_admin_gate";
const PASSWORD = "David3";

export async function isAdminGateOpen(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === PASSWORD;
}

export function adminGateCookieValue(): string {
  return PASSWORD;
}

export const ADMIN_GATE_COOKIE = COOKIE;
