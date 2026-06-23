import type { NextRequest } from "next/server";
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

export function getAdminGuardStatus() {
  const allowlist = parseAllowlist();
  return {
    enabled: allowlist.length > 0,
    allowlistCount: allowlist.length,
    note: "Supabase Auth handles password hashing; session cookies use admin gate + HTTPS.",
  };
}
