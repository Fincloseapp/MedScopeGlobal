/**
 * Crawlers that answer users (ChatGPT, Claude, Perplexity, Gemini, …).
 * They must be allowed to read the magazine so answers can cite ViaLongeVita
 * on medscopeglobal.com. Same admin/API disallows as Google.
 */

export const AI_CRAWLER_NAMES = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Google-CloudVertexBot",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
  "meta-externalagent",
  "FacebookBot",
] as const;

/** User-Agent match for middleware — do not geo-bounce these onto a random locale. */
export const AI_CRAWLER_UA_RE =
  /gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|claude-searchbot|claude-user|google-extended|google-cloudvertexbot|perplexitybot|perplexity-user|amazonbot|applebot-extended|bytespider|ccbot|cohere-ai|youbot|duckassistbot|meta-externalagent|facebookbot/i;
