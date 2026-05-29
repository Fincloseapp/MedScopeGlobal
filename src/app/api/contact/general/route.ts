import { NextResponse } from "next/server";
import { contactSubmissionSchema, sendContactEmail } from "@/lib/contact";
import { persistContactSubmission } from "@/lib/persistence";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security";
export async function POST(request: Request) { if (!assertSameOrigin(request)) return NextResponse.json({ error: "Neplatný původ požadavku." }, { status: 403 }); const limited = rateLimit(`contact:general:${getClientIp(request)}`); if (!limited.ok) return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to prosím později." }, { status: 429 }); const parsed = contactSubmissionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success || parsed.data.website) return NextResponse.json({ error: "Zkontrolujte prosím vyplněná pole." }, { status: 400 }); const { targetEmail } = await sendContactEmail("general", parsed.data); await persistContactSubmission("general", targetEmail, parsed.data); return NextResponse.json({ ok: true, message: "Děkujeme za zprávu, ozveme se vám co nejdříve." }); }
