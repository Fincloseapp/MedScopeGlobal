import { NextResponse } from "next/server";
import { marketplaceInboundSecret } from "@/lib/marketplace/config";
import { intakeFromInboundEmail, ingestMarketplaceIntake } from "@/lib/marketplace/intake";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function extractEmail(raw: string): string {
  const angle = raw.match(/<([^>]+@[^>]+)>/);
  if (angle) return angle[1].trim().toLowerCase();
  const plain = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return (plain?.[0] ?? "").trim().toLowerCase();
}

function extractName(raw: string): string | undefined {
  const before = raw.split("<")[0]?.replace(/"/g, "").trim();
  return before || undefined;
}

function parseRfc822(raw: string): { from: string; name?: string; subject: string; text: string } {
  const headerEnd = raw.search(/\r?\n\r?\n/);
  const headers = headerEnd >= 0 ? raw.slice(0, headerEnd) : raw.slice(0, 4000);
  const body = headerEnd >= 0 ? raw.slice(headerEnd).trim() : "";
  const fromLine = headers.match(/^From:\s*(.+)$/im)?.[1]?.trim() ?? "";
  const subject = headers.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ?? "Dotaz k tržišti";
  const textPart = body.includes("Content-Type: text/plain")
    ? body.split(/Content-Type:\s*text\/plain[^\n]*\n/i)[1]?.split(/Content-Type:/i)[0] ?? body
    : body;
  const text = textPart.replace(/--[a-zA-Z0-9._=-]+/g, "").replace(/=\r?\n/g, "").slice(0, 4000);
  return {
    from: extractEmail(fromLine),
    name: extractName(fromLine),
    subject,
    text: text.trim() || subject,
  };
}

export async function POST(request: Request) {
  const secret = marketplaceInboundSecret();
  if (secret) {
    const auth = request.headers.get("authorization");
    const qs = new URL(request.url).searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && qs !== secret) return unauthorized();
  }

  const contentType = request.headers.get("content-type") ?? "";
  let from = "";
  let name: string | undefined;
  let subject = "Dotaz k tržišti";
  let text = "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      from = extractEmail(String(body.from ?? body.sender ?? body.email ?? ""));
      name = typeof body.name === "string" ? body.name : extractName(String(body.from ?? ""));
      subject = String(body.subject ?? subject);
      text = String(body.text ?? body.html ?? body.body ?? "");
      if (!from && typeof body.envelope === "object" && body.envelope) {
        from = extractEmail(String((body.envelope as { from?: string }).from ?? ""));
      }
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      from = extractEmail(String(form.get("from") ?? form.get("sender") ?? ""));
      name = extractName(String(form.get("from") ?? "")) || String(form.get("from_name") ?? "") || undefined;
      subject = String(form.get("subject") ?? subject);
      text = String(form.get("text") ?? form.get("email") ?? form.get("html") ?? "");
    } else {
      const raw = await request.text();
      const parsed = parseRfc822(raw);
      from = parsed.from;
      name = parsed.name;
      subject = parsed.subject;
      text = parsed.text;
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!from) return NextResponse.json({ error: "Missing sender" }, { status: 400 });

  const result = await ingestMarketplaceIntake(
    intakeFromInboundEmail({ fromEmail: from, fromName: name, subject, text })
  );
  return NextResponse.json({
    ok: result.ok,
    autoReplied: result.autoReplied,
    id: result.listing?.id ?? null,
    error: result.error,
  });
}
