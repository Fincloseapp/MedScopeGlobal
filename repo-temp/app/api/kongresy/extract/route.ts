import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";

const schema = z.object({
  source_url: z.string().url(),
});

const SEARCH_HINTS = [
  "české univerzity (UK, MU, LF)",
  "evropské univerzity a ESC/EULAR kalendáře",
  "odborné společnosti ČLS JEP",
  "vědecké databáze ClinicalTrials / Conference indexes",
];

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { requireCaptcha: false, action: "congress_extract" });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const url = sanitizeText(body.source_url, 500);
  const { resolveOpenAiKey } = await import("@/lib/ai/openai-key");
  const apiKey = resolveOpenAiKey();
  let extracted = fallbackExtract(url);

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Extrahuj z URL kongresu JSON pole: title, summary, starts_at (ISO), location, price_hint, registration_url, organizer, specialty. Zdroje: ${SEARCH_HINTS.join("; ")}.`,
            },
            { role: "user", content: url },
          ],
          response_format: { type: "json_object" },
          max_tokens: 800,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          extracted = { ...extracted, ...JSON.parse(content) };
        }
      }
    } catch {
      /* keep fallback */
    }
  }

  return NextResponse.json({ extracted, search_hints: SEARCH_HINTS });
}

function fallbackExtract(url: string) {
  const host = new URL(url).hostname.replace("www.", "");
  return {
    title: `Kongres — ${host}`,
    summary: `Automatický návrh shrnutí pro ${host}. Doplňte detaily nebo spusťte AI s OPENAI_API_KEY.`,
    location: "TBD",
    price_hint: null,
    registration_url: url,
    organizer: host,
    starts_at: null,
  };
}
