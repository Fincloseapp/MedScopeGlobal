import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listMarketplaceListings, listPublishedCourses } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyMarketplacePage() {
  const [listings, courses] = await Promise.all([listMarketplaceListings(), listPublishedCourses()]);

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return (
    <>
      <AcademyPageHeader
        eyebrow="Marketplace"
        title="Tržiště kurzů"
        description="Premium kurzy od expertů a partnerů MedScopeGlobal."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => {
              const course = courseMap.get(listing.course_id);
              return (
                <article key={listing.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 className="font-display text-lg font-semibold">{course?.title ?? "Kurz"}</h2>
                  <p className="mt-2 text-2xl font-bold text-[#005B96]">{listing.price_czk} Kč</p>
                  {course ? (
                    <Link href={`/academy/courses/${course.slug}`} className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
                      Detail kurzu →
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Marketplace se plní — brzy premium kurzy.
          </p>
        )}
      </div>
    </>
  );
}
