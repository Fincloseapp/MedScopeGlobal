import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AcademyAdminNav } from "@/components/academy/admin-nav";

export default function AdminAcademyMonetizationPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">Monetizace</h1>
      <AcademyAdminNav active="/admin/academy/monetization" />
      <p className="mt-4 text-sm text-slate-600">
        Marketplace pricing a Stripe integrace — propojeno s v27 monetizací.
      </p>
      <Link href="/admin/revenue" className="mt-4 inline-block text-sm text-[#005B96] hover:underline">
        → Revenue dashboard
      </Link>
      <Link href="/admin/academy" className="mt-6 block text-sm text-[#005B96] hover:underline">
        ← Zpět na dashboard
      </Link>
    </div>
  );
}
