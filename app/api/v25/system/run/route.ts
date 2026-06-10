import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runV25PostPipeline } from "@/lib/v25/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runV25PostPipeline();
  return NextResponse.json(result);
}
