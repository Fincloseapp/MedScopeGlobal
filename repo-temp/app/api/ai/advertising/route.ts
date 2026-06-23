import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { checkAiDailyLimit, logAiAgentUsage } from "@/lib/security/ai-abuse";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { AD_PLACEMENTS } from "@/lib/ads/placements";

const schema = z.object({
  command: z.string().min(3).max(2000),
});

const SYSTEM = `Jsi AI Advertising Assistant pro MedScopeGlobal (čeština).
Příkazy: vložit reklamu do sekce, aktivovat reklamu, generovat banner popis, text reklamy, nabídku pro firmu, PDF nabídku (jen text).
Dostupné placement klíče: ${Object.values(AD_PLACEMENTS).join(", ")}.
Odpovídej strukturovaně: akce, parametry, návrh textu, SQL hint (jen popis, ne spouštěj).`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    userId: user?.id,
    action: "ai_advertising",
  });
  if (!guard.ok) return guard.response;

  const adminGate = await requireAdmin();
  if (!adminGate.ok) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const command = sanitizeText(body.command, 2000);
  const limit = await checkAiDailyLimit(user!.id);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Daily AI limit reached" }, { status: 429 });
  }

  const executed = await tryExecuteAdCommand(command);

  const { resolveOpenAiKey } = await import("@/lib/ai/openai-key");
  const apiKey = resolveOpenAiKey();
  let reply = executed.summary;

  if (apiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: command },
          ...(executed.context ? [{ role: "assistant", content: executed.context }] : []),
        ],
        max_tokens: 1200,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      reply = json.choices?.[0]?.message?.content ?? reply;
    }
  } else {
    reply = `${executed.summary}\n\n${generateOfflineOffer(command)}`;
  }

  await logAiAgentUsage({
    userId: user!.id,
    agent: "advertising-assistant",
    prompt: command,
    status: "ok",
  });

  return NextResponse.json({ reply, executed: executed.actions });
}

async function tryExecuteAdCommand(command: string) {
  const actions: string[] = [];
  const lower = command.toLowerCase();
  const admin = createServiceRoleClient();

  if (lower.includes("aktivuj reklamu")) {
    const match = command.match(/klienta?\s+(.+)/i);
    const company = match?.[1]?.trim();
    if (company) {
      const { data } = await admin
        .from("ads")
        .update({ active: true, ad_status: "active" })
        .ilike("company", `%${company}%`)
        .select("id, company");
      actions.push(`Aktivováno: ${(data ?? []).length} záznamů pro „${company}“.`);
    }
  }

  if (lower.includes("vlož reklamu") && lower.includes("sidebar")) {
    const diagMatch = command.match(/diagn[oó]z[ey]?\s+(\w+)/i);
    actions.push(
      `Připraven insert: placement=diagnosis_sidebar, kontext=${diagMatch?.[1] ?? "obecné"}.`
    );
  }

  return {
    actions,
    summary: actions.length ? actions.join("\n") : "Příkaz zpracován v režimu návrhu.",
    context: actions.length ? `Provedené akce:\n${actions.join("\n")}` : undefined,
  };
}

function generateOfflineOffer(command: string) {
  const firm = command.match(/firmu?\s+([A-Za-z0-9ěščřžýáíéúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\s.-]+)/i)?.[1]?.trim() ?? "partner";
  return `NABÍDKA PRO ${firm.toUpperCase()}
— Banner homepage mid (30 dní): 32 000 Kč
— Newsletter header: 8 000 Kč
— Sponzorovaná sekce studie: od 42 000 Kč
Kontakt: ads@medscopeglobal.com`;
}
