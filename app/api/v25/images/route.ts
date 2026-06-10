import { NextResponse } from "next/server";
import { loadImageReportAsync, loadImageFixLogLocal } from "@/lib/v25/images/persist";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await loadImageReportAsync();
  const fixLog = loadImageFixLogLocal();
  return NextResponse.json({ report, fixLog });
}
