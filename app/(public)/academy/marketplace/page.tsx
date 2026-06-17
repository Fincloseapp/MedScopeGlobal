import Link from "next/link";
import { BadgeCheck, GraduationCap, Sparkles } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { MarketplaceCheckoutButton } from "@/components/academy/marketplace-checkout-button";
import { MarketplacePurchaseBanner } from "@/components/academy/marketplace-purchase-banner";
import { listMarketplaceListings, listPublishedCourses } from "@/lib/academy/db";
import { resolveMarketplacePurchase } from "@/lib/academy/marketplace-purchase";

export const revalidate = 120;

export default async function AcademyMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string; canceled?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const [listings, courses, purchase] = await Promise.all([
    listMarketplaceListings(),
    listPublishedCourses(),
    params.purchased === "1"
      ? resolveMarketplacePurchase(params.session_id)
      : Promise.resolve(null),
  ]);

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return (
    <>
      <AcademyPageHeader
        eyebrow="Marketplace"
        title="Tržiště kurzů"
        description="Premium kurzy od expertů a partnerů MedScopeGlobal — ověřený obsah s XP odměnami."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <MarketplacePurchaseBanner
          purchase={purchase}
          canceled={params.canceled === "1"}
        />
        {!purchase && params.purchased === "1" ? (
          <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Platba proběhla — kurz je nyní dostupný ve vašem postupu.
          </p>
        ) : null}

        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const course = courseMap.get(listing.course_id);
              const meta = (listing.listing_metadata ?? {}) as {
                badge?: string;
                highlight?: string;
              };
              return (
                <article
                  key={listing.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#005B96]/30 hover:shadow-md"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-br from-[#f0f7fc] to-white px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#005B96]/10 px-2.5 py-0.5 text-xs font-medium text-[#005B96]">
                        <Sparkles className="h-3 w-3" />
                        Premium
                      </span>
                      {meta.badge ? (
                        <span className="text-xs text-slate-500">{meta.badge}</span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                      {course?.title ?? "Kurz"}
                    </h2>
                    {course?.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.summary}</p>
                    ) : course?.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {course?.level ? (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {course.level}
                        </span>
                      ) : null}
                      {course?.duration_minutes ? (
                        <span>{course.duration_minutes} min</span>
                      ) : null}
                      {course?.xp_reward ? <span>+{course.xp_reward} XP</span> : null}
                    </div>
                    <p className="mt-4 text-2xl font-bold text-[#005B96]">
                      {listing.price_czk.toLocaleString("cs-CZ")} Kč
                    </p>
                    {meta.highlight ? (
                      <p className="mt-2 text-xs text-green-700">{meta.highlight}</p>
                    ) : null}
                    <MarketplaceCheckoutButton
                      listingId={listing.id}
                      priceCzk={listing.price_czk}
                      courseSlug={course?.slug}
                    />
                    {course ? (
                      <Link
                        href={`/academy/courses/${course.slug}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#005B96] hover:underline"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        Detail kurzu →
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#005B96]/40" />
            <p className="mt-4 text-sm font-medium text-[#021d33]">Marketplace se plní</p>
            <p className="mt-2 text-sm text-slate-500">
              Brzy zde najdete premium kurzy od partnerů MedScope Academy.
            </p>
            <Link
              href="/academy/courses"
              className="mt-6 inline-block text-sm text-[#005B96] hover:underline"
            >
              Prohlédnout volné kurzy →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
