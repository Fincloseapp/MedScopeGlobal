import { getDatabaseStatus, getDatabaseWarning, hasDatabaseConfigured } from "@/lib/portal/runtime";
import { jsonResponse } from "@/lib/portal/request";

export async function GET() {
  return jsonResponse({
    ok: true,
    service: "medscopeglobal-portal",
    database: getDatabaseStatus(),
    configured: hasDatabaseConfigured(),
    warning: getDatabaseWarning(),
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com"
  });
}
