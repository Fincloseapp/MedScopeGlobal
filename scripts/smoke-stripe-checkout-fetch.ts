/**
 * Smoke tests for Workers-safe Stripe Checkout (fetch + AbortSignal).
 * Run: pnpm exec tsx scripts/smoke-stripe-checkout-fetch.ts
 */
import {
  createCheckoutSession,
  stripeErrorToJson,
  STRIPE_CHECKOUT_TIMEOUT_MS,
} from "../lib/stripe/checkout-fetch";

async function main() {
  const orig = globalThis.fetch;
  let passed = 0;

  // Keep a ref'd timer so Node does not exit before AbortSignal.timeout (unref'd) fires.
  globalThis.fetch = (_url, init) =>
    new Promise((_resolve, reject) => {
      const hang = setTimeout(() => reject(new Error("fetch hang")), 60_000);
      const signal = init?.signal;
      const onAbort = () => {
        clearTimeout(hang);
        reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
      };
      if (signal?.aborted) {
        onAbort();
        return;
      }
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  const t0 = Date.now();
  try {
    await createCheckoutSession({
      secretKey: "sk_test_x",
      successUrl: "https://example.com/ok",
      cancelUrl: "https://example.com/cancel",
      lineItems: [{ currency: "czk", unitAmount: 100, name: "Test" }],
      timeoutMs: 200,
    });
    console.error("FAIL: expected timeout");
  } catch (e) {
    const ms = Date.now() - t0;
    const mapped = stripeErrorToJson(e);
    console.log("timeout_ms", ms, "status", mapped.status, "timedOut", mapped.body.timedOut, "code", mapped.body.code);
    if (ms < 1500 && mapped.body.timedOut && mapped.status === 504) passed++;
    else console.error("FAIL timeout mapping", mapped);
  }

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          message: "Invalid API Key provided",
          type: "invalid_request_error",
          code: "invalid_api_key",
        },
      }),
      { status: 401 }
    );
  try {
    await createCheckoutSession({
      secretKey: "sk_test_bad",
      successUrl: "https://example.com/ok",
      cancelUrl: "https://example.com/cancel",
      lineItems: [{ currency: "czk", unitAmount: 100, name: "Test" }],
      timeoutMs: 2000,
    });
    console.error("FAIL: expected api error");
  } catch (e) {
    const mapped = stripeErrorToJson(e);
    console.log("api_err", mapped.status, mapped.body.code, mapped.body.enabled, mapped.body.detail);
    if (
      mapped.status === 401 &&
      mapped.body.enabled === false &&
      mapped.body.code === "invalid_api_key" &&
      mapped.body.detail === "Invalid API Key provided"
    ) {
      passed++;
    } else console.error("FAIL api mapping", mapped);
  }

  globalThis.fetch = async (_url, init) => {
    const body = String(init?.body ?? "");
    // URLSearchParams encodes brackets; match encoded keys.
    if (!body.includes("unit_amount") || !body.includes("100") || !body.includes("czk")) {
      return new Response(JSON.stringify({ error: { message: "bad form", body } }), { status: 400 });
    }
    return new Response(
      JSON.stringify({ id: "cs_test_123", url: "https://checkout.stripe.com/c/pay/cs_test_123" }),
      { status: 200 }
    );
  };
  const session = await createCheckoutSession({
    secretKey: "sk_test_ok",
    successUrl: "https://example.com/ok",
    cancelUrl: "https://example.com/cancel",
    lineItems: [{ currency: "czk", unitAmount: 100, name: "Dar" }],
    timeoutMs: 2000,
  });
  console.log("success", session);
  if (session.id === "cs_test_123" && session.url?.includes("checkout.stripe.com")) passed++;

  globalThis.fetch = orig;
  console.log("PASSED", passed, "/ 3", "defaultTimeout", STRIPE_CHECKOUT_TIMEOUT_MS);
  if (passed !== 3) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
