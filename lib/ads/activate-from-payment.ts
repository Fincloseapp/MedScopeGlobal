import { emailAdInvoice } from "@/lib/ads/issue-ad-invoice";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function activateAdFromCheckout(
  sessionId: string,
  requestId: string,
  paymentMethod: "stripe" | "bank_transfer" = "stripe"
) {
  const admin = createServiceRoleClient();

  const { data: req } = await admin
    .from("ads_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!req) return { ok: false, reason: "request_not_found" };

  const start = new Date();
  const days = parseInt(req.duration ?? "30", 10) || 30;
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const imageUrl =
    req.banner_url ||
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop";

  const { data: ad, error } = await admin
    .from("ads")
    .insert({
      title: req.company,
      image_url: imageUrl,
      link_url: req.url,
      target_url: req.url,
      active: true,
      placement: req.position,
      company: req.company,
      client_name: req.contact_person,
      client_email: req.email,
      type: req.type,
      position_newsletter: req.position_newsletter,
      ad_text: req.ad_text,
      price: req.price,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      ad_status: "active",
      include_in_newsletter: Boolean(req.position_newsletter),
      request_id: req.id,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, reason: error.message };
  }

  await admin
    .from("ads_requests")
    .update({
      status: "active",
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
    })
    .eq("id", req.id);

  const fresh = { ...req, payment_method: paymentMethod, status: "active" };
  await emailAdInvoice(fresh);

  return { ok: true, adId: ad?.id };
}
