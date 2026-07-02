import { NextResponse } from "next/server";
import { getV19UxListing } from "@/lib/v19/ux-ls";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "v19",
    engineVersion: V19_ENGINE_VERSION,
    ...getV19UxListing(),
  });
}
