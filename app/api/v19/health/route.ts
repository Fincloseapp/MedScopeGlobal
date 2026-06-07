import { NextResponse } from "next/server";
import { isGroqConfigured } from "@/lib/ai/groq";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "v19",
    version: "V19.0.0",
    groq: isGroqConfigured(),
    endpoints: ["/api/v19/articles", "/api/v19/monitoring", "/api/v19/health"],
  });
}
