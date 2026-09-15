/** Heslo admin brány — `ADMIN_GATE_PASSWORD` v env, jinak výchozí `David`. */

import { resolveLocalePath } from "@/lib/i18n/locale-path";

const DEFAULT_ADMIN_GATE_PASSWORD = "David";
export const ADMIN_GATE_COOKIE = "ms_admin_session";
/** Previous cookie — cleared on login/logout so an old 8h session cannot skip the form. */
export const ADMIN_GATE_COOKIE_LEGACY = "ms_admin_gate";
export const DEFAULT_ADMIN_NEXT_PATH = "/admin";

export function getAdminGatePassword(): string {
  const configured = process.env.ADMIN_GATE_PASSWORD?.trim();
  return configured || DEFAULT_ADMIN_GATE_PASSWORD;
}

export function isValidAdminGateCookie(value: string | undefined): boolean {
  if (!value) return false;
  return value === getAdminGatePassword();
}

/** `/admin` and `/admin/…`, including locale-prefixed `/cs/admin/sales`. */
export function canonicalAdminPathname(pathname: string): string | null {
  const pathOnly = pathname.split("?")[0]?.split("#")[0] ?? "";
  const stripped = resolveLocalePath(pathOnly).pathname;
  if (stripped === "/admin" || stripped.startsWith("/admin/")) return stripped;
  return null;
}

export function isAdminLoginPath(pathname: string): boolean {
  const path = canonicalAdminPathname(pathname) ?? pathname.split("?")[0] ?? pathname;
  return path === "/admin/login" || path.startsWith("/admin/login/");
}

/** Dashboard and every /admin page except the password form. */
export function requiresAdminGate(pathname: string): boolean {
  const path = canonicalAdminPathname(pathname);
  if (!path) return false;
  return !isAdminLoginPath(path);
}

/**
 * Open-redirect safe return path after the admin password form.
 * Only `/admin` and `/admin/…` (locale prefix stripped) are allowed.
 */
export function safeAdminNextPath(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_ADMIN_NEXT_PATH;
  let value = raw.trim();
  if (!value) return DEFAULT_ADMIN_NEXT_PATH;
  try {
    if (/^https?:\/\//i.test(value)) {
      value = new URL(value).pathname;
    }
  } catch {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  const pathOnly = value.split("?")[0]?.split("#")[0] ?? "";
  if (
    !pathOnly.startsWith("/") ||
    pathOnly.startsWith("//") ||
    pathOnly.includes("\\") ||
    pathOnly.includes("@") ||
    /[\u0000-\u001f]/.test(pathOnly)
  ) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  const canonical = canonicalAdminPathname(pathOnly);
  if (!canonical || isAdminLoginPath(canonical)) return DEFAULT_ADMIN_NEXT_PATH;
  return canonical;
}

export function hasValidAdminGateCookie(cookies: {
  get(name: string): { value: string } | undefined;
}): boolean {
  return isValidAdminGateCookie(cookies.get(ADMIN_GATE_COOKIE)?.value);
}


