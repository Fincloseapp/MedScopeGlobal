import { NextResponse } from "next/server";
import type { V18Endpoint } from "@/lib/ai/engine";
import { runAI } from "@/lib/ai/engine";
import { isGroqConfigured } from "@/lib/ai/groq";

export type V18JsonBody = {
  query?: string;
  documentText?: string;
  userId?: string;
};

export function parseV18Body(body: V18JsonBody): {
  query: string;
  documentText: string;
  userId?: string;
} {
  return {
    query: typeof body.query === "string" ? body.query.trim() : "",
    documentText: typeof body.documentText === "string" ? body.documentText.trim() : "",
    userId: typeof body.userId === "string" ? body.userId : undefined,
  };
}

export async function handleV18Inference(
  endpoint: V18Endpoint,
  promptBuilder: (query: string) => string,
  request: Request
) {
  if (!isGroqConfigured()) {
    return NextResponse.json(
      { status: "error", endpoint, message: "GROQ_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: V18JsonBody = {};
  try {
    body = (await request.json()) as V18JsonBody;
  } catch {
    return NextResponse.json(
      { status: "error", endpoint, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { query, documentText, userId } = parseV18Body(body);
  if (!query && !documentText) {
    return NextResponse.json(
      { status: "error", endpoint, message: "query or documentText is required" },
      { status: 400 }
    );
  }

  const effectiveQuery = query || "Analyzuj přiložený dokument.";
  const prompt = promptBuilder(effectiveQuery);

  try {
    const result = await runAI({
      endpoint,
      query: effectiveQuery,
      documentText,
      userId,
      prompt,
    });

    return NextResponse.json({
      status: "ok",
      endpoint,
      engine: "v18",
      requestId: result.requestId,
      model: result.model,
      risk: result.risk,
      disclaimer: result.disclaimer,
      segments: result.segments,
      blocked: result.blocked,
      answer: result.answer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        endpoint,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
