import { NextResponse } from "next/server";
import { isValidCloudflareApiToken } from "@/lib/v6/verify-cloudflare-token";

export function verifyCronRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Cron secret, optional bootstrap token, or a valid Cloudflare API token
 * (user token or account-owned token).
 */
export async function verifyCronOrCloudflareOperator(
  request: Request
): Promise<NextResponse | null> {
  if (!verifyCronRequest(request)) return null;

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bootstrap = process.env.MIGRATION_BOOTSTRAP_TOKEN;
  if (bootstrap && token === bootstrap) return null;

  if (await isValidCloudflareApiToken(token)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
