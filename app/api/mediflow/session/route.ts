import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getMediFlowSession();
  return NextResponse.json(session);
}
