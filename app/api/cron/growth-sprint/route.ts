import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runLegalGrowthSprint } from "@/lib/growth/legal-sprint";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Legal growth sprint: Stripe reconcile/payout, newsletter promote, IndexNow.
 * GET/POST /api/cron/growth-sprint
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
    const light = new URL(request.url).searchParams.get("light") === "1";
    const outcome = await runLegalGrowthSprint({
      includeRevenueOps: !light,
    });
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 207 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "growth sprint failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
