import { generate3dModelSpec } from "@/lib/v47/three/generator";
import { parseV47Body, v47Json } from "@/lib/v47/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseV47Body<{ topic?: string; format?: "gltf" | "obj" }>(req);
  if (!body?.topic?.trim()) return v47Json({ error: "topic required" }, 400);
  const result = await generate3dModelSpec({ topic: body.topic, format: body.format });
  return v47Json(result, result.ok ? 200 : 503);
}
