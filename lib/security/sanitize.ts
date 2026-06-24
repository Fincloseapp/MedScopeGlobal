const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG = /<[^>]+>/g;
const INJECTION_PATTERNS = [
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:\s*text\/html/gi,
  /<\s*iframe/gi,
  /union\s+select/gi,
  /;\s*drop\s+table/gi,
];

/** Strip HTML, scripts, and common injection patterns from user input. */
export function sanitizeText(value: string, maxLength = 10000): string {
  let out = value
    .replace(SCRIPT_TAG, "")
    .replace(HTML_TAG, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of INJECTION_PATTERNS) {
    out = out.replace(pattern, "");
  }

  return out.slice(0, maxLength);
}

/** Sanitize object string fields recursively. */
export function sanitizeRecord(
  input: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const out = { ...input };
  for (const key of keys) {
    if (typeof out[key] === "string") {
      out[key] = sanitizeText(out[key] as string);
    }
  }
  return out;
}
