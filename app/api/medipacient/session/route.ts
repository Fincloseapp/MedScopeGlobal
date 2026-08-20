import { NextResponse } from "next/server";
import { getPacientSession } from "@/lib/medipacient/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getPacientSession();
  return NextResponse.json(session);
}
