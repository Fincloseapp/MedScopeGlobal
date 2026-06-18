import { NextResponse } from "next/server";
import { getVideoJobStatus } from "@/lib/v40/video/pipeline";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const job = await getVideoJobStatus(id);

  if (!job) {
    return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    version: "v40.0",
    job: {
      id: job.id,
      title: job.title,
      status: job.status,
      video_asset_id: job.video_asset_id,
      metadata: job.metadata,
      created_at: job.created_at,
      updated_at: job.updated_at,
    },
  });
}
