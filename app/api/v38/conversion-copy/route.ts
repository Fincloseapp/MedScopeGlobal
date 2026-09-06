import { NextResponse } from "next/server";
import { resolveConversionCopy } from "@/lib/v38/conversion-engine";
import type { ConversionSlot } from "@/lib/v38/conversion-copy";

export const dynamic = "force-dynamic";

const VALID_SLOTS: ConversionSlot[] = [
  "nav_strip",
  "nav_cta",
  "article_gate",
  "article_inline",
  "video_overlay",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slot = url.searchParams.get("slot") as ConversionSlot | null;
  if (!slot || !VALID_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }
  const locale =
    url.searchParams.get("locale") ??
    request.headers.get("x-medscope-locale") ??
    "en";
  const copy = await resolveConversionCopy(slot, locale);
  return NextResponse.json(copy);
}
