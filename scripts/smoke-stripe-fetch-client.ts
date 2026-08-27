/**
 * Smoke: Stripe createFetchHttpClient fails fast (not ~240s Workers hang).
 * Run: pnpm exec tsx scripts/smoke-stripe-fetch-client.ts
 */
import Stripe from "stripe";
import {
  createStripeClient,
  stripeClientErrorBody,
  STRIPE_REQUEST_TIMEOUT_MS,
} from "../lib/stripe/client.ts";

async function main() {
  const t0 = Date.now();
  try {
    const stripe = createStripeClient("sk_test_invalid_key_for_smoke");
    await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: "https://medscopeglobal.com/?ok=1",
      cancel_url: "https://medscopeglobal.com/",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "czk",
            unit_amount: 2000,
            product_data: { name: "Smoke donation" },
          },
        },
      ],
    });
    console.error("UNEXPECTED: session created with invalid key");
    process.exit(1);
  } catch (err) {
    const ms = Date.now() - t0;
    const body = stripeClientErrorBody(err);
    console.log(
      JSON.stringify(
        {
          ok: ms < STRIPE_REQUEST_TIMEOUT_MS,
          latencyMs: ms,
          timeoutCapMs: STRIPE_REQUEST_TIMEOUT_MS,
          httpClient: "fetch",
          errorBody: body,
        },
        null,
        2
      )
    );
    if (ms >= 30_000) {
      console.error("FAIL: still hanging (>=30s)");
      process.exit(1);
    }
    if (!body.detail && !body.error) {
      console.error("FAIL: empty error body");
      process.exit(1);
    }
    if (typeof Stripe.createFetchHttpClient !== "function") {
      console.error("FAIL: createFetchHttpClient missing");
      process.exit(1);
    }
    console.log("PASS: fetch client returned actionable error quickly");
  }
}

main();
