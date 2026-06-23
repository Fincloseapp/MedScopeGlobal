import { createServiceRoleClient } from "@/lib/supabase/service";

const DAILY_AI_LIMIT = 20;

const TOXICITY_PATTERNS = [
  /\b(kill|murder|suicide)\s+(yourself|myself|him|her|them)\b/i,
  /\b(hate\s+all\s+\w+)\b/i,
];

const SPAM_PATTERNS = [
  /(.)\1{10,}/,
  /(https?:\/\/[^\s]+\s*){5,}/i,
  /\b(viagra|casino|crypto\s+giveaway)\b/i,
];

export function detectToxicity(text: string): number {
  let score = 0;
  for (const p of TOXICITY_PATTERNS) {
    if (p.test(text)) score += 0.5;
  }
  return Math.min(score, 1);
}

export function detectSpam(text: string): number {
  let score = 0;
  for (const p of SPAM_PATTERNS) {
    if (p.test(text)) score += 0.4;
  }
  if (text.length > 5000) score += 0.2;
  return Math.min(score, 1);
}

export async function checkAiDailyLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const admin = createServiceRoleClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await admin
      .from("ai_agent_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);

    const used = count ?? 0;
    return {
      allowed: used < DAILY_AI_LIMIT,
      remaining: Math.max(0, DAILY_AI_LIMIT - used),
    };
  } catch {
    return { allowed: true, remaining: DAILY_AI_LIMIT };
  }
}

export async function logAiAgentUsage(params: {
  userId?: string | null;
  agent: string;
  prompt: string;
  tokensUsed?: number;
  status?: string;
}) {
  const toxicity = detectToxicity(params.prompt);
  const spam = detectSpam(params.prompt);

  try {
    const admin = createServiceRoleClient();
    await admin.from("ai_agent_logs").insert({
      user_id: params.userId ?? null,
      agent: params.agent,
      prompt_hash: hashPrompt(params.prompt),
      tokens_used: params.tokensUsed ?? null,
      status: params.status ?? "ok",
      toxicity_score: toxicity,
      spam_score: spam,
      details: { length: params.prompt.length },
    });
  } catch (e) {
    console.error("logAiAgentUsage failed", e);
  }

  return { toxicity, spam, blocked: toxicity >= 0.5 || spam >= 0.8 };
}

function hashPrompt(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `p${Math.abs(h).toString(36)}`;
}
