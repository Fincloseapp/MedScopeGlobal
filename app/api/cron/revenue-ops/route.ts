import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runRevenueOps } from "@/lib/monetization/revenue-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Auto-apply newsletter_subscribers + promote analytics fallbacks.
 * GET/POST /api/cron/revenue-ops
 */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    const bootstrap = process.env.MIGRATION_BOOTSTRAP_TOKEN;
    let cloudflareOk = false;
    if (token && bootstrap && token === bootstrap) {
      cloudflareOk = true;
    } else if (token) {
      try {
        const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { success?: boolean };
        cloudflareOk = Boolean(res.ok && data.success);
      } catch {
        cloudflareOk = false;
      }
    }
    if (!cloudflareOk) return denied;
  }

  try {
    const outcome = await runRevenueOps();
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "revenue ops failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
