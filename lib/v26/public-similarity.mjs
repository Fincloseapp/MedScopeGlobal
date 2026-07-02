/**
 * Similarity guard for public articles — prevents near-duplicate titles/excerpts.
 */

const SIMILARITY_THRESHOLD = Number(process.env.PUBLIC_SIMILARITY_THRESHOLD ?? 0.72);
const TITLE_SIMILARITY_THRESHOLD = 0.85;

export function normalizeTitleKey(title) {
  return String(title ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
}

export function similarityScore(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / Math.max(ta.size, tb.size);
}

function levenshtein(a, b) {
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

function levenshteinRatio(a, b) {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

export function isSimilarTitle(a, b) {
  const ka = normalizeTitleKey(a);
  const kb = normalizeTitleKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  return levenshteinRatio(ka, kb) > TITLE_SIMILARITY_THRESHOLD;
}

/**
 * Check draft against recent DB articles and same-batch articles.
 * @param {{ title: string, excerpt?: string }} draft
 * @param {Array<{ title: string, excerpt?: string }>} recentArticles
 * @param {Array<{ title: string, excerpt?: string }>} batchArticles
 */
export function checkPublicArticleSimilarity(draft, recentArticles = [], batchArticles = []) {
  const pool = [...recentArticles, ...batchArticles];
  const draftText = `${draft.title} ${draft.excerpt ?? ""}`;

  for (const existing of pool) {
    if (!existing?.title) continue;

    if (isSimilarTitle(draft.title, existing.title)) {
      return {
        duplicate: true,
        reason: `similar-title vs "${existing.title.slice(0, 60)}"`,
        score: 1,
        field: "title",
      };
    }

    const titleScore = similarityScore(draft.title, existing.title);
    if (titleScore >= SIMILARITY_THRESHOLD) {
      return {
        duplicate: true,
        reason: `title-overlap ${titleScore.toFixed(2)} vs "${existing.title.slice(0, 60)}"`,
        score: titleScore,
        field: "title",
      };
    }

    const existingText = `${existing.title} ${existing.excerpt ?? ""}`;
    const textScore = similarityScore(draftText, existingText);
    if (textScore >= SIMILARITY_THRESHOLD + 0.08) {
      return {
        duplicate: true,
        reason: `content-overlap ${textScore.toFixed(2)} vs "${existing.title.slice(0, 60)}"`,
        score: textScore,
        field: "content",
      };
    }
  }

  return { duplicate: false, reason: "", score: 0 };
}

/** Load recent public articles from Supabase for similarity checks. */
export async function loadRecentPublicArticles(admin, { maxAgeDays = 21, limit = 120 } = {}) {
  if (!admin) return [];
  const since = new Date();
  since.setDate(since.getDate() - maxAgeDays);

  const { data, error } = await admin
    .from("articles")
    .select("title, excerpt")
    .eq("audience", "public")
    .eq("published", true)
    .gte("published_at", since.toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map((r) => ({ title: r.title, excerpt: r.excerpt }));
}

/** Load recent titles from local public index (fallback when no DB). */
export function loadRecentFromPublicIndex(readJsonFn) {
  try {
    const idx = readJsonFn("public/articles/index.json");
    const articles = idx?.articles ?? [];
    return articles.slice(0, 80).map((a) => ({ title: a.title, excerpt: a.excerpt }));
  } catch {
    return [];
  }
}
