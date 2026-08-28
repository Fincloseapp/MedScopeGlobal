/**
 * Stripe Checkout via fetch — Cloudflare Workers compatible.
 * Avoids the Node Stripe SDK, which can hang indefinitely on Workers.
 */

export const STRIPE_CHECKOUT_TIMEOUT_MS = 12_000;

export type StripeCheckoutLineItem = {
  currency: string;
  unitAmount: number;
  name: string;
  description?: string;
  quantity?: number;
};

export type CreateCheckoutSessionInput = {
  secretKey: string;
  mode?: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  lineItems: StripeCheckoutLineItem[];
  metadata?: Record<string, string>;
  clientReferenceId?: string | null;
  paymentMethodTypes?: string[];
  timeoutMs?: number;
  /**
   * Stripe Connect destination (`acct_…`).
   * Applied as a destination charge (`transfer_data.destination` + `on_behalf_of`)
   * so funds land on the connected account while the session stays on the platform
   * (existing `/api/stripe/webhook` still receives `checkout.session.completed`).
   * Do not send a `Stripe-Account` header here — that would be a direct charge.
   */
  connectedAccountId?: string | null;
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

export class StripeCheckoutError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly type?: string;
  readonly stripeMessage: string;
  readonly timedOut: boolean;

  constructor(opts: {
    message: string;
    status?: number;
    code?: string;
    type?: string;
    timedOut?: boolean;
  }) {
    super(opts.message);
    this.name = "StripeCheckoutError";
    this.status = opts.status ?? 503;
    this.code = opts.code;
    this.type = opts.type;
    this.stripeMessage = opts.message;
    this.timedOut = Boolean(opts.timedOut);
  }
}

function appendForm(params: URLSearchParams, key: string, value: string) {
  params.append(key, value);
}

/**
 * Create a Checkout Session with AbortSignal timeout so Workers never hang.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<StripeCheckoutSession> {
  const timeoutMs = input.timeoutMs ?? STRIPE_CHECKOUT_TIMEOUT_MS;
  const body = new URLSearchParams();

  appendForm(body, "mode", input.mode ?? "payment");
  appendForm(body, "success_url", input.successUrl);
  appendForm(body, "cancel_url", input.cancelUrl);

  const methods = input.paymentMethodTypes?.length ? input.paymentMethodTypes : ["card"];
  methods.forEach((method, i) => {
    appendForm(body, `payment_method_types[${i}]`, method);
  });

  input.lineItems.forEach((item, i) => {
    appendForm(body, `line_items[${i}][quantity]`, String(item.quantity ?? 1));
    appendForm(body, `line_items[${i}][price_data][currency]`, item.currency.toLowerCase());
    appendForm(body, `line_items[${i}][price_data][unit_amount]`, String(item.unitAmount));
    appendForm(body, `line_items[${i}][price_data][product_data][name]`, item.name);
    if (item.description) {
      appendForm(
        body,
        `line_items[${i}][price_data][product_data][description]`,
        item.description
      );
    }
  });

  if (input.metadata) {
    for (const [key, value] of Object.entries(input.metadata)) {
      if (value != null && value !== "") {
        appendForm(body, `metadata[${key}]`, String(value));
      }
    }
  }

  if (input.clientReferenceId) {
    appendForm(body, "client_reference_id", input.clientReferenceId);
  }

  const destination = input.connectedAccountId?.trim();
  if (destination) {
    const mode = input.mode ?? "payment";
    if (mode === "subscription") {
      appendForm(body, "subscription_data[transfer_data][destination]", destination);
      appendForm(body, "subscription_data[on_behalf_of]", destination);
    } else {
      appendForm(body, "payment_intent_data[transfer_data][destination]", destination);
      appendForm(body, "payment_intent_data[on_behalf_of]", destination);
    }
  }

  let res: Response;
  try {
    res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : String(err);
    const timedOut =
      name === "TimeoutError" ||
      name === "AbortError" ||
      /aborted|timeout/i.test(message);
    throw new StripeCheckoutError({
      message: timedOut
        ? `Stripe Checkout timeout po ${timeoutMs}ms`
        : `Stripe síťová chyba: ${message}`,
      status: 504,
      timedOut,
      code: timedOut ? "checkout_timeout" : "network_error",
    });
  }

  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new StripeCheckoutError({
      message: `Stripe vrátil neplatnou odpověď (HTTP ${res.status})`,
      status: res.status >= 400 ? res.status : 502,
      code: "invalid_response",
    });
  }

  if (!res.ok) {
    const errObj =
      json.error && typeof json.error === "object"
        ? (json.error as Record<string, unknown>)
        : null;
    const stripeMessage =
      (typeof errObj?.message === "string" && errObj.message) ||
      (typeof json.message === "string" && json.message) ||
      `Stripe API chyba HTTP ${res.status}`;
    const code = typeof errObj?.code === "string" ? errObj.code : undefined;
    const type = typeof errObj?.type === "string" ? errObj.type : undefined;
    throw new StripeCheckoutError({
      message: stripeMessage,
      status: res.status,
      code,
      type,
    });
  }

  const id = typeof json.id === "string" ? json.id : "";
  const url = typeof json.url === "string" ? json.url : null;
  if (!id) {
    throw new StripeCheckoutError({
      message: "Stripe nevrátil session id",
      status: 502,
      code: "missing_session_id",
    });
  }

  return { id, url };
}

/** Map StripeCheckoutError → JSON body for API routes. */
export function stripeErrorToJson(err: unknown): {
  status: number;
  body: {
    error: string;
    enabled: boolean;
    detail?: string;
    code?: string;
    type?: string;
    timedOut?: boolean;
  };
} {
  if (err instanceof StripeCheckoutError) {
    const isConfig =
      /invalid api key|no such api key|authentication|api_key/i.test(err.stripeMessage) ||
      err.code === "api_key_expired" ||
      err.status === 401;
    return {
      status: err.timedOut ? 504 : err.status >= 400 && err.status < 600 ? err.status : 503,
      body: {
        error: isConfig
          ? "Stripe klíč je neplatný nebo neúplný — zkontrolujte STRIPE_SECRET_KEY na Workeru"
          : err.timedOut
            ? "Stripe neodpověděl včas — zkuste to znovu"
            : err.stripeMessage || "Chyba při vytváření platby",
        enabled: !isConfig,
        detail: err.stripeMessage,
        code: err.code,
        type: err.type,
        timedOut: err.timedOut || undefined,
      },
    };
  }

  const message = err instanceof Error ? err.message : "unknown";
  const isConfig =
    /invalid api key|no such api key|authentication|api_key/i.test(message) ||
    message.includes("Invalid API Key");
  return {
    status: 503,
    body: {
      error: isConfig
        ? "Stripe klíč je neplatný nebo neúplný — zkontrolujte STRIPE_SECRET_KEY na Workeru"
        : "Chyba při vytváření platby",
      enabled: !isConfig,
      detail: message,
    },
  };
}
