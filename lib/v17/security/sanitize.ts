export const V17_MAX_INPUT_LENGTH = 50_000;

const HTML_TAG = /<[^>]*>/g;
const SCRIPT_BLOCK = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const BINARY_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

/** Strip HTML, scripts, binary chars; validate length. */
export function sanitizeInput(text: string): { clean: string; issues: string[] } {
  const issues: string[] = [];
  let clean = text;

  if (typeof clean !== "string") {
    return { clean: "", issues: ["input must be a string"] };
  }

  if (SCRIPT_BLOCK.test(clean)) issues.push("removed script tags");
  clean = clean.replace(SCRIPT_BLOCK, "");

  if (HTML_TAG.test(clean)) issues.push("removed HTML tags");
  clean = clean.replace(HTML_TAG, "");

  if (BINARY_PATTERN.test(clean)) issues.push("removed binary or control characters");
  clean = clean.replace(BINARY_PATTERN, "");

  clean = clean.trim();

  if (clean.length > V17_MAX_INPUT_LENGTH) {
    issues.push(`text exceeds maximum length of ${V17_MAX_INPUT_LENGTH}`);
    clean = clean.slice(0, V17_MAX_INPUT_LENGTH);
  }

  return { clean, issues };
}
