import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { isEditorialGrantProduct } from "@/lib/v27/config";

export type EditorialClaim =
  | { ok: true; periodEndMs: number; productId: string }
  | { ok: false; error: string; status: number };

export async function claimEditorialSession(sessionId: string): Promise<EditorialClaim> {
  const id = String(sessionId ?? "").trim();
  if (!id.startsWith("cs_")) {
    return { ok: false, error: "missing_session", status: 400 };
  }

  const secret = getStripeSecretKey();
  if (!secret) {
    return { ok: false, error: "stripe_missing", status: 503 };
  }

  try {
    const stripe = createStripeClient(secret);
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["subscription"],
    });
    const productId = String(session.metadata?.product_id ?? "");
    const paid = session.payment_status === "paid" || session.status === "complete";
    if (!paid || !isEditorialGrantProduct(productId)) {
      return { ok: false, error: "not_editorial", status: 403 };
    }

    let periodEndMs = Date.now() + (productId.endsWith("-year") ? 366 : 31) * 86_400_000;
    const sub = session.subscription;
    if (sub && typeof sub !== "string" && sub.current_period_end) {
      periodEndMs = sub.current_period_end * 1000;
    }
    return { ok: true, periodEndMs, productId };
  } catch {
    return { ok: false, error: "claim_failed", status: 400 };
  }
}
