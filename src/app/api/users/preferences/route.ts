import { NextResponse } from "next/server";
import { z } from "zod";
import { persistUserPreferences } from "@/lib/persistence";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, getClientIp, sanitizeText } from "@/lib/security";
const schema = z.object({ email: z.string().email().max(180).transform((value) => value.toLowerCase()), name: z.string().max(120).optional().transform((value) => (value ? sanitizeText(value) : value)), role: z.enum(["doctor", "student", "scientist", "partner"]), preferences: z.record(z.string(), z.unknown()).default({}) });
export async function POST(request: Request) { if (!assertSameOrigin(request)) return NextResponse.json({ error: "Neplatný původ požadavku." }, { status: 403 }); const limited = rateLimit(`preferences:${getClientIp(request)}`, 10, 60_000); if (!limited.ok) return NextResponse.json({ error: "Příliš mnoho pokusů." }, { status: 429 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Neplatná data preferencí." }, { status: 400 }); await persistUserPreferences(parsed.data); return NextResponse.json({ ok: true }); }
