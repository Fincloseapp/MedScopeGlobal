import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type MarketplacePurchaseStatus = {
  verified: boolean;
  pending: boolean;
  courseSlug?: string;
  courseTitle?: string;
  enrolled: boolean;
  sessionId: string;
};

/** Verifies Stripe checkout session and enrollment for marketplace success page. */
export async function resolveMarketplacePurchase(
  sessionId: string | undefined
): Promise<MarketplacePurchaseStatus | null> {
  if (!sessionId?.trim()) return null;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return null;

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return { verified: false, pending: true, enrolled: false, sessionId };
  }

  const stripe = new Stripe(secret);
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.academy_marketplace !== "true") return null;
    if (session.metadata.user_id !== auth.user.id) return null;

    const courseId = session.metadata.course_id;
    const courseSlug = session.metadata.course_slug || undefined;
    const paid = session.payment_status === "paid";

    let courseTitle: string | undefined;
    if (courseId) {
      const admin = createServiceRoleClient();
      const { data: course } = await admin
        .from("courses")
        .select("title, slug")
        .eq("id", courseId)
        .maybeSingle();
      courseTitle = course?.title ?? undefined;
    }

    let enrolled = false;
    if (courseId && paid) {
      const admin = createServiceRoleClient();
      const { data } = await admin
        .from("user_progress")
        .select("status")
        .eq("user_id", auth.user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      enrolled = Boolean(data);
    }

    return {
      verified: paid,
      pending: paid && !enrolled,
      courseSlug: courseSlug ?? undefined,
      courseTitle,
      enrolled,
      sessionId,
    };
  } catch {
    return { verified: false, pending: true, enrolled: false, sessionId };
  }
}

export type MarketplaceEnrollmentRow = {
  listingId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  priceCzk: number;
  status: string;
  purchaseCount: number;
  enrollments: number;
  lastPurchaseAt: string | null;
};

/** Admin view — marketplace listings with purchase + enrollment counts. */
export async function listMarketplaceEnrollments(): Promise<MarketplaceEnrollmentRow[]> {
  const admin = createServiceRoleClient();
  const { data: listings } = await admin
    .from("marketplace_courses")
    .select("id, course_id, price_czk, status, listing_metadata, courses(title, slug)")
    .order("updated_at", { ascending: false })
    .limit(50);

  const rows: MarketplaceEnrollmentRow[] = [];
  for (const listing of listings ?? []) {
    const meta = (listing.listing_metadata ?? {}) as {
      purchases?: { user_id?: string; purchased_at?: string }[];
    };
    const purchases = Array.isArray(meta.purchases) ? meta.purchases : [];
    const course = listing.courses as { title?: string; slug?: string } | null;
    const courseId = listing.course_id as string;

    let enrollments = 0;
    if (courseId && purchases.length > 0) {
      const userIds = purchases.map((p) => p.user_id).filter(Boolean) as string[];
      if (userIds.length > 0) {
        const { count } = await admin
          .from("user_progress")
          .select("id", { count: "exact", head: true })
          .eq("course_id", courseId)
          .in("user_id", userIds);
        enrollments = count ?? 0;
      }
    }

    const lastPurchaseAt =
      purchases.length > 0
        ? purchases
            .map((p) => p.purchased_at)
            .filter(Boolean)
            .sort()
            .reverse()[0] ?? null
        : null;

    rows.push({
      listingId: listing.id as string,
      courseId,
      courseTitle: course?.title ?? "—",
      courseSlug: course?.slug ?? "",
      priceCzk: Number(listing.price_czk) || 0,
      status: String(listing.status),
      purchaseCount: purchases.length,
      enrollments,
      lastPurchaseAt,
    });
  }

  return rows;
}
