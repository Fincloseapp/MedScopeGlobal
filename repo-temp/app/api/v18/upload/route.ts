import { NextResponse } from "next/server";
import {
  DocumentExtractError,
  extractDocument,
  MAX_DOCUMENT_BYTES,
} from "@/lib/doc/extract";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "upload",
    engine: "v18",
    maxBytes: MAX_DOCUMENT_BYTES,
    supported: ["pdf", "docx", "txt", "jpg", "png"],
    message: "POST multipart/form-data with field `file`",
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { status: "error", message: "Missing file field in multipart form" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractDocument(buffer, file.name, file.type);

    return NextResponse.json({
      status: "ok",
      engine: "v18",
      filename: result.filename,
      mimeType: result.mimeType,
      method: result.method,
      byteLength: result.byteLength,
      length: result.text.length,
      documentText: result.text,
    });
  } catch (error) {
    if (error instanceof DocumentExtractError) {
      const status =
        error.code === "too_large" ? 413 : error.code === "unsupported" ? 415 : 422;
      return NextResponse.json(
        { status: "error", code: error.code, message: error.message },
        { status }
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
