import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

export async function generate3dModelSpec(input: { topic: string; format?: "gltf" | "obj" }) {
  if (!isGroqConfigured()) {
    return {
      ok: false as const,
      scaffold: true,
      error: "GROQ_API_KEY not configured",
      modelUrl: null,
      spec: { topic: input.topic, primitives: [] },
    };
  }

  const raw = await groqCompleteJson({
    system: "3D medical model spec. Return JSON: {\"name\":\"...\",\"primitives\":[{\"type\":\"sphere\",\"label\":\"...\",\"position\":[0,0,0]}]}",
    user: `Anatomical 3D model for: ${input.topic}`,
  });

  if (!raw) return { ok: false as const, error: "3D spec generation failed" };

  try {
    const spec = JSON.parse(raw);
    return {
      ok: true as const,
      spec,
      modelUrl: null as string | null,
      format: input.format ?? "gltf",
      message: "3D render scaffold — GLTF export requires Three.js pipeline",
      model: resolveAiModel(),
      provider: "groq" as const,
    };
  } catch {
    return { ok: false as const, error: "Invalid 3D spec JSON" };
  }
}
