import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getMarketplaceListingById } from "@/lib/academy/db";
import { SITE } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe není nakonfigurován. Nastavte STRIPE_SECRET_KEY na Vercel." },
      { status: 503 }
    );
  }

  let body: { listingId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const listingId = body.listingId?.trim();
  if (!listingId) {
    return NextResponse.json({ error: "Chybí listingId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) {
    return NextResponse.json({ error: "Přihlaste se pro nákup kurzu" }, { status: 401 });
  }

  const listing = await getMarketplaceListingById(listingId);
  if (!listing || listing.status !== "listed") {
    return NextResponse.json({ error: "Nabídka nenalezena nebo není aktivní" }, { status: 404 });
  }

  const priceCzk = Number(listing.price_czk) || 0;
  if (priceCzk <= 0) {
    return NextResponse.json({ error: "Kurz nemá platnou cenu" }, { status: 400 });
  }

  const course = (listing as { courses?: { title?: string; slug?: string } | null }).courses;
  const courseTitle = course?.title ?? "Academy kurz";
  const courseSlug = course?.slug ?? "";
  const courseId = listing.course_id as string;

  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${SITE.url}/academy/marketplace?purchased=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/academy/marketplace?canceled=1`,
    payment_method_types: ["card"],
    customer_email: auth.user.email ?? undefined,
    metadata: {
      academy_marketplace: "true",
      listing_id: listingId,
      course_id: courseId,
      course_slug: courseSlug,
      user_id: auth.user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "czk",
          unit_amount: Math.round(priceCzk * 100),
          product_data: {
            name: courseTitle,
            description: `MedScope Academy — ${courseTitle}`,
          },
        },
      },
    ],
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
