import { AcademyPageHeader } from "@/components/academy/page-header";
import { listMarketplaceListings } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyMarketplacePage() {
  const listings = await listMarketplaceListings(20);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Marketplace"
        title="Kurzy k zakoupení"
        description="Prémiové kurzy od expertů a institucí."
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {listings.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <li key={l.id} className="rounded-xl border border-[#cfe1f3] bg-white p-5">
                <p className="font-semibold text-[#021d33]">Kurz {l.course_id?.slice(0, 8)}</p>
                <p className="mt-2 text-lg font-bold text-[#005B96]">{l.price_czk} Kč</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Marketplace bude brzy dostupný.</p>
        )}
      </div>
    </>
  );
}
