import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/content";
import { createEventIcs } from "@/lib/ics";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const event = getEventBySlug(slug); if (!event) return NextResponse.json({ error: "Událost nebyla nalezena." }, { status: 404 }); return new NextResponse(createEventIcs(event), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${event.slug}.ics"` } }); }
