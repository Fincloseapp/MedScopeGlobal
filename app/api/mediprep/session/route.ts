import { NextResponse } from "next/server";
import { getPrepSession } from "@/lib/mediprep/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getPrepSession();
  return NextResponse.json(session);
}
