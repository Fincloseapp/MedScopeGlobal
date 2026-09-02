import type { NextRequest } from "next/server";
import {
  hasValidAdminGateCookie,
  isAdminLoginPath,
} from "@/lib/auth/admin-gate-config";
import { getClientIp } from "@/lib/security/client-ip";

function parseAllowlist(): string[] {
  const raw = process.env.ADMIN_IP_ALLOWLIST?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminIpAllowed(request: NextRequest): boolean {
  const allowlist = parseAllowlist();
  if (allowlist.length === 0) return true;
  const ip = getClientIp(request);
  return allowlist.includes(ip) || allowlist.includes("*");
}

/**
 * HTML /admin: password cookie is the only lock. Login is always reachable.
 * /api/admin: password cookie unlocks from any IP; otherwise honor allowlist.
 */
export function canAccessAdminSurface(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (isAdminLoginPath(pathname)) return true;
  if (hasValidAdminGateCookie(request.cookies)) return true;
  if (pathname.startsWith("/admin")) return true;
  return isAdminIpAllowed(request);
}

export function getAdminGuardStatus() {
  const allowlist = parseAllowlist();
  return {
    enabled: allowlist.length > 0,
    allowlistCount: allowlist.length,
    note: "Supabase Auth handles password hashing; session cookies use admin gate + HTTPS.",
  };
}
