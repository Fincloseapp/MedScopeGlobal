import { NextResponse } from "next/server";
import { isCloudflareRuntime } from "@/lib/config/runtime";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runV25PostPipeline, type V25PipelineMode } from "@/lib/v25/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function pipelineMode(raw: string | null): V25PipelineMode {
  if (raw === "full" || raw === "quick" || raw === "suite") return raw;
  return isCloudflareRuntime() ? "quick" : "full";
}

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const result = await runV25PostPipeline({ mode: pipelineMode(url.searchParams.get("mode")) });
  return NextResponse.json(result);
}
