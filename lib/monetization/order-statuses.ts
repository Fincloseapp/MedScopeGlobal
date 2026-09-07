/**
 * v27_orders.status vs Stripe balance.pending — two different "pending" words.
 * Admin copy only. Never treat unpaid checkout as money you will receive.
 */

export const V27_ORDER_STATUSES = [
  "pending",
  "paid",
  "completed",
  "expired",
  "canceled",
  "refunded",
  "failed",
] as const;

export type V27OrderStatus = (typeof V27_ORDER_STATUSES)[number];

export type OrderStatusExplain = {
  status: V27OrderStatus;
  label: string;
  money: "none" | "in_stripe" | "returned";
  detail: string;
};

const EXPLAIN: Record<V27OrderStatus, Omit<OrderStatusExplain, "status">> = {
  pending: {
    label: "Čeká na platbu",
    money: "none",
    detail:
      "Checkout je otevřený, karta ještě neprošla. Tohle NENÍ Stripe pending a na účet z toho 0 Kč.",
  },
  paid: {
    label: "Zaplaceno",
    money: "in_stripe",
    detail:
      "Webhook potvrdil platbu. Částka je ve Stripe (available nebo pending) po odečtení poplatku.",
  },
  completed: {
    label: "Dokončeno",
    money: "in_stripe",
    detail: "Stejné jako zaplaceno — produkt je doručen. Peníze jsou ve Stripe.",
  },
  expired: {
    label: "Vypršelo",
    money: "none",
    detail: "Session vypršela bez platby. 0 Kč. Nový checkout může poslat Stripe recovery e-mail.",
  },
  canceled: {
    label: "Zrušeno",
    money: "none",
    detail: "Zákazník checkout zrušil. 0 Kč.",
  },
  refunded: {
    label: "Vráceno",
    money: "returned",
    detail: "Platba se vrátila. Zůstatek ve Stripe klesne, na účet z tohoto řádku 0 Kč.",
  },
  failed: {
    label: "Selhalo",
    money: "none",
    detail: "Platba neprošla. 0 Kč.",
  },
};

export function normalizeV27OrderStatus(raw?: string | null): V27OrderStatus {
  const key = String(raw ?? "").trim().toLowerCase();
  if ((V27_ORDER_STATUSES as readonly string[]).includes(key)) {
    return key as V27OrderStatus;
  }
  return "pending";
}

export function explainV27OrderStatus(raw?: string | null): OrderStatusExplain {
  const status = normalizeV27OrderStatus(raw);
  return { status, ...EXPLAIN[status] };
}

export const STRIPE_PENDING_EXPLAIN =
  "Stripe pending = čistý zůstatek, který Stripe ještě drží (obvykle 2–7 pracovních dní u nového účtu, jinak rolling). Není to nezaplacená objednávka. Až se přesune do available, jde výplata na firemní účet podle plánu Stripe.";

export const STRIPE_AVAILABLE_EXPLAIN =
  "Stripe available = čistá částka po poplatku Stripe, kterou lze vyplatit teď (nebo kterou Stripe pošle sám, pokud máte automatické výplaty).";

export const V27_GROSS_EXPLAIN =
  "Tržby v27 v Kč jsou ceníkové částky z objednávek. Na účet přijde méně: Stripe strhne poplatek a měna může být EUR/USD/GBP.";

export function youWillReceiveLines(input: {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
  inTransit: { amount: number; currency: string }[];
}): { amount: number; currency: string }[] {
  const map = new Map<string, number>();
  for (const row of [...input.available, ...input.pending, ...input.inTransit]) {
    const code = row.currency.toLowerCase();
    map.set(code, (map.get(code) ?? 0) + row.amount);
  }
  return [...map.entries()].map(([currency, amount]) => ({ amount, currency }));
}
