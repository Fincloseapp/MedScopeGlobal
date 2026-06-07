import { handleV18Inference } from "@/lib/ai/v18-api";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "guideline",
    engine: "v18",
    message: "POST { query, documentText?, userId? }",
  });
}

export async function POST(request: Request) {
  return handleV18Inference(
    "guideline",
    (query) => `Vytvoř klinické doporučení na základě dotazu: ${query}`,
    request
  );
}
