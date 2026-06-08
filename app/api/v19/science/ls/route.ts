import { NextResponse } from "next/server";
import { getV19ScienceListing } from "@/lib/v19/science-ls";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "v19",
    engineVersion: V19_ENGINE_VERSION,
    ...getV19ScienceListing(),
  });
}
