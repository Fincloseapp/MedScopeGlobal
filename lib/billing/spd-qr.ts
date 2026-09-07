import { getLegalEntity } from "@/lib/config/legal-entity";

export type SpdPayload = {
  iban?: string | null;
  amountCzk: number;
  variableSymbol: string;
  message: string;
};

export function getLegalIban(): string | null {
  return process.env.LEGAL_ENTITY_IBAN?.replace(/\s/g, "").trim() || null;
}

export function getLegalBankAccount(): string | null {
  return process.env.LEGAL_ENTITY_BANK_ACCOUNT?.trim() || null;
}

/** Czech Banking Association SPD 1.0 string for a payment QR. */
export function buildSpdString(input: SpdPayload): string | null {
  const iban = (input.iban ?? getLegalIban() ?? "").replace(/\s/g, "").toUpperCase();
  if (!iban || iban.length < 15) return null;
  const amount = Math.max(0, Number(input.amountCzk) || 0).toFixed(2);
  const vs = String(input.variableSymbol).replace(/\D/g, "").slice(0, 10);
  const msg = String(input.message ?? "")
    .replace(/[*\n\r]/g, " ")
    .slice(0, 60);
  const parts = [`SPD*1.0*ACC:${iban}*AM:${amount}*CC:CZK`];
  if (vs) parts.push(`X-VS:${vs}`);
  if (msg) parts.push(`MSG:${msg}`);
  const entity = getLegalEntity();
  parts.push(`RN:${entity.name.slice(0, 35)}`);
  return parts.join("*");
}
