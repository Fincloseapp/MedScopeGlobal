import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics";
import { logger } from "@/lib/logger";
import { persistAnalyticsEvent } from "@/lib/persistence";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";
export async function POST(request: Request) { const limited = rateLimit(`analytics:${getClientIp(request)}`, 60, 60_000); if (!limited.ok) return NextResponse.json({ ok: false }, { status: 202 }); const parsed = analyticsEventSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 202 }); logger.info("analytics_event", { name: parsed.data.name, role: parsed.data.role, source: parsed.data.source }); await persistAnalyticsEvent(parsed.data); return NextResponse.json({ ok: true }); }
