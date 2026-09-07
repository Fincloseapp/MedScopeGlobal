import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  buildApprovalUrl,
  sendAdApprovalLinkToAdmin,
  sendAdRequestNotification,
} from "@/lib/services/ads-mail";
import { calculateAdPrice } from "@/lib/ads/pricing";
import { applyAdsRequestsSchema } from "@/lib/ads/apply-ads-schema";
import { runAdEditorBoard } from "@/lib/ads/ad-editors";
import { makeAdVariableSymbol } from "@/lib/ads/variable-symbol";
import { resolveEmailLocale } from "@/lib/i18n/email-locale";
import type { AdsRequestRow } from "@/types/database";

const schema = z.object({
  company: z.string().min(2).max(200),
  contact_person: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  ico: z.string().max(20).optional(),
  dic: z.string().max(20).optional(),
  type: z.string().min(1).max(60),
  position: z.string().max(80).optional(),
  position_newsletter: z.string().max(80).optional(),
  duration: z.string().max(10).optional(),
  banner_url: z.string().url().optional().or(z.literal("")),
  ad_text: z.string().max(4000).optional(),
  url: z.string().url().optional().or(z.literal("")),
  price: z.number().optional(),
  include_newsletter: z.boolean().optional(),
  buyer_address: z.string().max(240).optional(),
  locale: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    action: "ads_request",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const price =
    body.price ??
    calculateAdPrice({
      type: body.type,
      position: body.position,
      positionNewsletter: body.position_newsletter,
      durationDays: body.duration,
      includeNewsletter: body.include_newsletter,
    });

  const token = randomBytes(24).toString("hex");
  const locale = resolveEmailLocale(body.locale, request);
  const board = runAdEditorBoard({
    company: body.company,
    adText: body.ad_text,
    bannerUrl: body.banner_url,
    targetUrl: body.url,
    type: body.type,
  });
  await applyAdsRequestsSchema();
  const admin = createServiceRoleClient();
  const placeholderId = randomBytes(8).toString("hex");
  const variableSymbol = makeAdVariableSymbol(placeholderId);

  const core = {
    company: sanitizeText(body.company, 200),
    contact_person: sanitizeText(body.contact_person, 120),
    email: body.email.trim().toLowerCase(),
    phone: body.phone ? sanitizeText(body.phone, 40) : null,
    ico: body.ico ? sanitizeText(body.ico, 20) : null,
    dic: body.dic ? sanitizeText(body.dic, 20) : null,
    type: sanitizeText(body.type, 60),
    position: body.position ? sanitizeText(body.position, 80) : null,
    position_newsletter: body.position_newsletter
      ? sanitizeText(body.position_newsletter, 80)
      : null,
    duration: body.duration ?? "30",
    price,
    banner_url: body.banner_url || null,
    ad_text: body.ad_text ? sanitizeText(body.ad_text, 4000) : null,
    url: body.url || null,
    status: "pending",
    approval_token: token,
  };
  const extras = {
    locale,
    buyer_address: body.buyer_address ? sanitizeText(body.buyer_address, 240) : null,
    editorial_review: board,
    variable_symbol: variableSymbol,
    decision: null,
  };

  let { data, error } = await admin.from("ads_requests").insert({ ...core, ...extras }).select("*").single();
  if (error) {
    const fallback = await admin.from("ads_requests").insert(core).select("*").single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
  }

  const req = data as AdsRequestRow;
  const approveUrl = buildApprovalUrl(token);

  await Promise.all([
    sendAdRequestNotification(req),
    sendAdApprovalLinkToAdmin(req, approveUrl),
  ]);

  if (req.id && req.variable_symbol !== makeAdVariableSymbol(req.id)) {
    const vs = makeAdVariableSymbol(String(req.id));
    await admin.from("ads_requests").update({ variable_symbol: vs }).eq("id", req.id);
    req.variable_symbol = vs;
  }

  return NextResponse.json({
    ok: true,
    id: req.id,
    price,
    token,
    recommendation: board.recommendation,
    editors: board,
    variableSymbol: req.variable_symbol ?? variableSymbol,
  });
}
