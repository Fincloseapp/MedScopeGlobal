import { NextResponse } from "next/server";
import { eventSubmissionSchema } from "@/lib/contact";
import { logger } from "@/lib/logger";
import { persistEventSubmission } from "@/lib/persistence";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security";
function withOffset(value: unknown) { if (typeof value !== "string") return value; return value.includes("+") || value.endsWith("Z") ? value : `${value}:00+02:00`; }
export async function POST(request: Request) { if (!assertSameOrigin(request)) return NextResponse.json({ error: "Neplatný původ požadavku." }, { status: 403 }); const limited = rateLimit(`event-submission:${getClientIp(request)}`, 3, 60_000); if (!limited.ok) return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to prosím později." }, { status: 429 }); const body = await request.json().catch(() => null); const parsed = eventSubmissionSchema.safeParse({ ...body, startsAt: withOffset(body?.startsAt), endsAt: withOffset(body?.endsAt) }); if (!parsed.success || parsed.data.website) return NextResponse.json({ error: "Zkontrolujte prosím vyplněná pole." }, { status: 400 }); await persistEventSubmission(parsed.data); logger.info("event_submission_pending_approval", { title: parsed.data.title, organizer: parsed.data.organizer }); return NextResponse.json({ ok: true, approvalStatus: "pending" }); }
