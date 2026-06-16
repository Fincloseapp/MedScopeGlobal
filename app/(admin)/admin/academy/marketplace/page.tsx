import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AcademyAdminNav } from "@/components/academy/admin-nav";
import { listMarketplaceListings } from "@/lib/academy/db";

export default async function AdminAcademyMarketplacePage() {
  const listings = await listMarketplaceListings(50);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">Marketplace</h1>
      <AcademyAdminNav active="/admin/academy/marketplace" />
      <p className="mt-4 text-sm text-slate-600">{listings.length} aktivních listingů.</p>
      <ul className="mt-4 space-y-2">
        {listings.map((l) => (
          <li key={l.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            Course {l.course_id?.slice(0, 8)}… — {l.price_czk} Kč
          </li>
        ))}
      </ul>
      <Link href="/admin/academy" className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na dashboard
      </Link>
    </div>
  );
}
