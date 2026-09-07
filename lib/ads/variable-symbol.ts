/** Ten-digit Czech variable symbol from a request id + clock. Digits only. */
export function makeAdVariableSymbol(requestId: string, at = new Date()): string {
  const digits = String(requestId).replace(/\D/g, "");
  const stamp = String(at.getUTCFullYear()).slice(2) + String(at.getUTCMonth() + 1).padStart(2, "0") + String(at.getUTCDate()).padStart(2, "0");
  const tail = (digits || "0").slice(-4).padStart(4, "0");
  return `${stamp}${tail}`.slice(0, 10);
}
