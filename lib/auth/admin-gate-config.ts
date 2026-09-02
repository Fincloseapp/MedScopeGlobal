/** Heslo admin brány — `ADMIN_GATE_PASSWORD` v env, jinak výchozí `David`. */

const DEFAULT_ADMIN_GATE_PASSWORD = "David";
export const ADMIN_GATE_COOKIE = "ms_admin_gate";

export function getAdminGatePassword(): string {
  const configured = process.env.ADMIN_GATE_PASSWORD?.trim();
  return configured || DEFAULT_ADMIN_GATE_PASSWORD;
}

export function isValidAdminGateCookie(value: string | undefined): boolean {
  if (!value) return false;
  return value === getAdminGatePassword();
}

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

/** Dashboard and every /admin page except the password form. */
export function requiresAdminGate(pathname: string): boolean {
  return pathname.startsWith("/admin") && !isAdminLoginPath(pathname);
}

export function hasValidAdminGateCookie(cookies: {
  get(name: string): { value: string } | undefined;
}): boolean {
  return isValidAdminGateCookie(cookies.get(ADMIN_GATE_COOKIE)?.value);
}


