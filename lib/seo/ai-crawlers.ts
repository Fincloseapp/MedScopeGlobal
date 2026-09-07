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
  "Claude-Web",
  "Google-Extended",
  "Google-CloudVertexBot",
  "Gemini-App",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
  "GrokBot",
  "xAI-Grok",
  "DeepSeekBot",
  "MistralAI-User",
  "CursorBot",
  "meta-externalagent",
  "FacebookBot",
] as const;

/** User-Agent match for middleware — do not geo-bounce these onto a random locale. */
export const AI_CRAWLER_UA_RE =
  /gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|claude-searchbot|claude-user|claude-web|google-extended|google-cloudvertexbot|gemini-app|perplexitybot|perplexity-user|amazonbot|applebot-extended|bytespider|ccbot|cohere-ai|youbot|duckassistbot|grokbot|xai-grok|deepseekbot|mistralai-user|cursorbot|meta-externalagent|facebookbot/i;
