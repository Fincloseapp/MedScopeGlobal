import "server-only";

import { extractDocument } from "@/lib/doc/extract";
import { isGeminiConfigured, resolveGeminiKey } from "@/lib/ai/gemini-key";
import { isGroqConfigured, resolveGroqKey } from "@/lib/ai/groq-client";
import { isOpenAiConfigured, resolveOpenAiKey } from "@/lib/ai/openai-key";
import {
  EXTRACT_FAILED_CS,
  MIN_OCR_CHARS,
  MedicalExtractError,
  anonymizePhi,
  isUsableMedicalText,
} from "@/lib/medipacient/patient-summary";
import { extractPdfStreamImages } from "@/lib/medipacient/pdf-stream-images";

function isImageMime(mime: string, filename: string): boolean {
  const m = (mime || "").toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return m.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"].includes(ext);
}

function isPdfMime(mime: string, filename: string): boolean {
  return (mime || "").toLowerCase().includes("pdf") || filename.toLowerCase().endsWith(".pdf");
}

function visionMime(mimeType: string | undefined, filename: string): string {
  const m = (mimeType || "").toLowerCase();
  if (m === "image/jpg") return "image/jpeg";
  if (m.startsWith("image/") || m === "application/pdf") return m;
  if (filename.toLowerCase().endsWith(".pdf")) return "application/pdf";
  if (filename.toLowerCase().endsWith(".png")) return "image/png";
  if (filename.toLowerCase().endsWith(".webp")) return "image/webp";
  if (filename.toLowerCase().endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

const VISION_OCR_PROMPT =
  "Přepiš veškerý čitelný text z této lékařské zprávy (čeština i latina). Je to celá stránka dokumentu. Zachovej řádky a tabulky. Nevysvětluj a nic nepřidávej. Jen přepis textu.";

const VISION_TIMEOUT_MS = 75_000;

function firstUsable(text: string | null | undefined): string {
  const clean = anonymizePhi(text || "").trim();
  return isUsableMedicalText(clean) ? clean : "";
}

async function visionOcrOpenAi(buffer: Buffer, mime: string): Promise<string | null> {
  if (!isOpenAiConfigured()) return null;
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;
  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";
  const content =
    mime === "application/pdf"
      ? [
          { type: "text", text: VISION_OCR_PROMPT },
          {
            type: "file",
            file: {
              filename: "zprava.pdf",
              file_data: `data:application/pdf;base64,${buffer.toString("base64")}`,
            },
          },
        ]
      : [
          { type: "text", text: VISION_OCR_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${buffer.toString("base64")}`, detail: "high" },
          },
        ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4000,
      messages: [{ role: "user", content }],
    }),
    signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
  });
  if (!res.ok) {
    if (mime === "application/pdf") {
      const responses = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: VISION_OCR_PROMPT },
                {
                  type: "input_file",
                  filename: "zprava.pdf",
                  file_data: `data:application/pdf;base64,${buffer.toString("base64")}`,
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      });
      if (!responses.ok) {
        console.warn("[medipacient] vision-openai", { status: res.status, responses: responses.status, mime });
        return null;
      }
      const payload = (await responses.json()) as {
        output_text?: string;
        output?: Array<{ content?: Array<{ text?: string }> }>;
      };
      const nested = payload.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\n");
      return payload.output_text?.trim() || nested?.trim() || null;
    }
    console.warn("[medipacient] vision-openai", { status: res.status, mime });
    return null;
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function visionOcrGemini(buffer: Buffer, mime: string): Promise<string | null> {
  if (!isGeminiConfigured()) return null;
  const apiKey = resolveGeminiKey();
  if (!apiKey) return null;
  const models = [
    process.env.GEMINI_VISION_MODEL?.trim(),
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ].filter((name, i, all): name is string => Boolean(name) && all.indexOf(name) === i);
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: VISION_OCR_PROMPT },
                { inline_data: { mime_type: mime, data: buffer.toString("base64") } },
              ],
            },
          ],
          generationConfig: { temperature: 0, maxOutputTokens: 8192 },
        }),
        signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.warn("[medipacient] vision-gemini", { status: res.status, model, mime });
        continue;
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (data.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text || "")
        .join("\n")
        .trim();
      if (text) return text;
    } catch (error) {
      console.warn("[medipacient] vision-gemini", {
        model,
        mime,
        error: error instanceof Error ? error.message : "fail",
      });
    }
  }
  return null;
}

async function visionOcrGroq(buffer: Buffer, mime: string): Promise<string | null> {
  if (!isGroqConfigured() || mime === "application/pdf") return null;
  const apiKey = resolveGroqKey();
  if (!apiKey) return null;
  const model = process.env.GROQ_VISION_MODEL?.trim() || "meta-llama/llama-4-scout-17b-16e-instruct";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_OCR_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${buffer.toString("base64")}` },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.warn("[medipacient] vision-groq", { status: res.status, mime });
    return null;
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export function isMedicalVisionConfigured(): boolean {
  return isGeminiConfigured() || isOpenAiConfigured() || isGroqConfigured();
}

async function ocrImageWithVision(buffer: Buffer, mime: string): Promise<string> {
  if (!isMedicalVisionConfigured()) {
    console.warn("[medipacient] vision-unconfigured", { mime, bytes: buffer.byteLength });
    return "";
  }
  const attempts =
    mime === "application/pdf"
      ? [() => visionOcrGemini(buffer, mime), () => visionOcrOpenAi(buffer, mime)]
      : [() => visionOcrGroq(buffer, mime), () => visionOcrOpenAi(buffer, mime), () => visionOcrGemini(buffer, mime)];
  for (const attempt of attempts) {
    try {
      const hit = firstUsable(await attempt());
      if (hit) return hit;
    } catch (error) {
      console.warn("[medipacient] vision-attempt", {
        mime,
        error: error instanceof Error ? error.message : "fail",
      });
    }
  }
  return "";
}

async function ocrImageBuffers(images: Array<{ buffer: Buffer; mime: string }>, method: string): Promise<string> {
  const usable = images.filter((item) => item.buffer.byteLength >= 8_000).slice(0, 8);
  if (!usable.length) return "";
  const chunks: string[] = [];
  for (const [index, item] of usable.entries()) {
    const text = await ocrImageWithVision(item.buffer, item.mime);
    if (text) chunks.push(usable.length > 1 ? `--- strana ${index + 1} ---\n${text}` : text);
  }
  const joined = chunks.join("\n\n").trim();
  if (joined) {
    console.info("[medipacient] ocr", { method, pages: usable.length, chars: joined.length });
  }
  return joined;
}

/** Photo-scan PDFs often embed full-page JPEGs. Tiny logos are ignored. */
function extractLargeJpegsFromPdf(buffer: Buffer, minBytes = 24_000): Buffer[] {
  const out: Buffer[] = [];
  let i = 0;
  while (i < buffer.length - 1) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd8) {
      let j = i + 2;
      while (j < buffer.length - 1 && !(buffer[j] === 0xff && buffer[j + 1] === 0xd9)) j += 1;
      if (j < buffer.length - 1) {
        const jpeg = buffer.subarray(i, j + 2);
        if (jpeg.byteLength >= minBytes) out.push(Buffer.from(jpeg));
        i = j + 2;
        continue;
      }
    }
    i += 1;
  }
  return out.slice(0, 8);
}

async function extractPdfMedicalText(buffer: Buffer): Promise<string> {
  let layer = "";
  try {
    const extracted = await extractDocument(buffer, "zprava.pdf", "application/pdf");
    layer = anonymizePhi(extracted.text);
  } catch (error) {
    console.warn("[medipacient] pdf-text-layer", {
      error: error instanceof Error ? error.message : "fail",
    });
  }
  if (isUsableMedicalText(layer)) {
    console.info("[medipacient] ocr", { method: "text-layer", chars: layer.length });
    return layer;
  }

  const streamImages = await extractPdfStreamImages(buffer);
  const fromStreams = await ocrImageBuffers(streamImages, "pdf-stream-image");
  if (isUsableMedicalText(fromStreams)) return fromStreams;

  const jpegs = extractLargeJpegsFromPdf(buffer).map((buffer) => ({ buffer, mime: "image/jpeg" as const }));
  const fromJpegs = await ocrImageBuffers(jpegs, "embedded-jpeg");
  if (isUsableMedicalText(fromJpegs)) return fromJpegs;

  const native = await ocrImageWithVision(buffer, "application/pdf");
  if (isUsableMedicalText(native)) {
    console.info("[medipacient] ocr", { method: "pdf-native", chars: native.length });
    return native;
  }

  const combined = [layer, fromStreams, fromJpegs, native]
    .filter((part) => part.trim().length >= MIN_OCR_CHARS)
    .join("\n");
  if (isUsableMedicalText(combined)) return anonymizePhi(combined);
  return "";
}

export async function extractTextFromMedicalFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
): Promise<string> {
  if (isPdfMime(mimeType || "", filename)) {
    const text = await extractPdfMedicalText(buffer);
    if (isUsableMedicalText(text)) return anonymizePhi(text);
    throw new MedicalExtractError(EXTRACT_FAILED_CS);
  }

  let text = "";
  try {
    const result = await extractDocument(buffer, filename, mimeType);
    text = anonymizePhi(result.text);
  } catch {
    text = "";
  }
  if (isUsableMedicalText(text)) return text;
  if (isImageMime(mimeType || "", filename)) {
    const vision = await ocrImageWithVision(buffer, visionMime(mimeType, filename));
    if (isUsableMedicalText(vision)) return vision;
    if (vision.trim().length >= 40) return anonymizePhi(vision);
  }
  if (text.trim().length >= 40) return text;
  throw new MedicalExtractError(EXTRACT_FAILED_CS);
}
