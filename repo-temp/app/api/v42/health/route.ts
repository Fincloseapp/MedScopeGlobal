import { NextResponse } from "next/server";

import { V42_UI_VERSION, V42_UI_BUILD_STAMP } from "@/lib/v42/version";

import { runKeyRotationCheck } from "@/lib/v42/key-rotation/monitor";



export const dynamic = "force-dynamic";



export async function GET() {

  const report = await runKeyRotationCheck();

  const hasCritical = report.keys.some((k) => k.status === "critical");



  return NextResponse.json({

    status: hasCritical ? "degraded" : "ok",

    ok: !hasCritical,

    version: V42_UI_VERSION,

    buildStamp: V42_UI_BUILD_STAMP,

    keyRotation: report,

    note: "Rotate OPENAI_API_KEY via platform dashboard when v42 monitor warns",

    cron: "/api/cron/v42-key-rotation-check",

    generatedAt: new Date().toISOString(),

  });

}

