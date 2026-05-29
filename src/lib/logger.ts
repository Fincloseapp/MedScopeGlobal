type LogMeta = Record<string, unknown>;
function safe(meta: LogMeta = {}) {
  return Object.fromEntries(Object.entries(meta).map(([key, value]) => [key, typeof value === "string" && /token|secret|password|authorization/i.test(key) ? "[REDACTED]" : value]));
}
export const logger = {
  info(message: string, meta?: LogMeta) { console.info(JSON.stringify({ level: "info", message, ...safe(meta) })); },
  warn(message: string, meta?: LogMeta) { console.warn(JSON.stringify({ level: "warn", message, ...safe(meta) })); },
  error(message: string, meta?: LogMeta) { console.error(JSON.stringify({ level: "error", message, ...safe(meta) })); }
};
