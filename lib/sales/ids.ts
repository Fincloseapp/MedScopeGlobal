export function slugifyCompany(name: string): string {
  const ascii = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii || "partner";
}

export function addDaysIso(from: Date, days: number): string {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export function addMonthsIso(from: Date, months = 1): string {
  const next = new Date(from);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next.toISOString();
}

export function dateOnly(iso: string | Date): string {
  return (typeof iso === "string" ? iso : iso.toISOString()).slice(0, 10);
}

export function startOfMonthIso(at = new Date()): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function randomToken(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function nextInvoiceNumber(seq: number, at = new Date()): string {
  const ym = `${at.getUTCFullYear()}${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
  return `MSG-SAL-${ym}-${String(seq).padStart(4, "0")}`;
}

export function salesVariableSymbol(seed: string, at = new Date()): string {
  const digits = String(seed).replace(/\D/g, "");
  const stamp =
    String(at.getUTCFullYear()).slice(2) +
    String(at.getUTCMonth() + 1).padStart(2, "0") +
    String(at.getUTCDate()).padStart(2, "0");
  const tail = (digits || "7").slice(-4).padStart(4, "0");
  return `${stamp}${tail}`.slice(0, 10);
}
