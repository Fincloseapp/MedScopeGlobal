/** Heslo admin brány — nastavte ADMIN_GATE_PASSWORD ve Vercel env (výchozí pro dev: David3). */

const DEFAULT_ADMIN_GATE_PASSWORD = "David3";
export const ADMIN_GATE_COOKIE = "ms_admin_gate";

export function getAdminGatePassword(): string {
  const configured = process.env.ADMIN_GATE_PASSWORD?.trim();
  return configured || DEFAULT_ADMIN_GATE_PASSWORD;
}

export function isValidAdminGateCookie(value: string | undefined): boolean {
  if (!value) return false;
  return value === getAdminGatePassword();
}


