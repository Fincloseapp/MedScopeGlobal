import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const V19_RUBRIC_SLUG = "v19-medical-brief";

export function buildV19DedupHash(
  title: string,
  topic: string,
  sourceUrl: string,
  dateIso: string
): string {
  const normalized = `${title}|${topic}|${sourceUrl}|${dateIso.slice(0, 10)}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

export function isSimilarTitle(a: string, b: string): boolean {
  const ka = normalizeTitleKey(a);
  const kb = normalizeTitleKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  return levenshteinRatio(ka, kb) > 0.85;
}

function levenshteinRatio(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export async function findExistingV19Duplicates(params: {
  hashDedup: string;
  title: string;
  topic: string;
  sourceUrl: string;
  maxAgeDays?: number;
}): Promise<{ duplicate: boolean; reason?: string; existingTitle?: string }> {
  const admin = createServiceRoleClient();
  const maxAgeDays = params.maxAgeDays ?? 30;
  const since = new Date();
  since.setDate(since.getDate() - maxAgeDays);

  const { data: byHash } = await admin
    .from("articles")
    .select("id, title")
    .eq("hash_dedup", params.hashDedup)
    .maybeSingle();

  if (byHash?.id) {
    return { duplicate: true, reason: "hash", existingTitle: byHash.title };
  }

  const { data: recent } = await admin
    .from("articles")
    .select("id, title, source_url, quiz_json")
    .eq("rubric_slug", V19_RUBRIC_SLUG)
    .gte("published_at", since.toISOString())
    .limit(200);

  for (const row of recent ?? []) {
    const meta = row.quiz_json as { topic?: string; v19?: boolean } | null;
    if (meta?.topic === params.topic && row.source_url === params.sourceUrl) {
      return { duplicate: true, reason: "topic+source", existingTitle: row.title };
    }
    if (isSimilarTitle(row.title, params.title)) {
      return { duplicate: true, reason: "similar-title", existingTitle: row.title };
    }
  }

  return { duplicate: false };
}

export async function listRecentV19Titles(maxAgeDays = 30): Promise<string[]> {
  const admin = createServiceRoleClient();
  const since = new Date();
  since.setDate(since.getDate() - maxAgeDays);
  const { data } = await admin
    .from("articles")
    .select("title")
    .eq("rubric_slug", V19_RUBRIC_SLUG)
    .gte("published_at", since.toISOString())
    .limit(100);
  return (data ?? []).map((r) => r.title as string);
}
