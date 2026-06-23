import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AcademyAdminNav } from "@/components/academy/admin-nav";
import { getAcademyCounts } from "@/lib/academy/db";

export default async function AdminAcademyUsersPage() {
  const counts = await getAcademyCounts();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">Uživatelé</h1>
      <AcademyAdminNav active="/admin/academy/users" />
      <p className="mt-4 text-sm text-slate-600">
        {counts.user_progress ?? 0} záznamů postupu, {counts.certificates ?? 0} certifikátů.
      </p>
      <Link href="/admin/academy" className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na dashboard
      </Link>
    </div>
  );
}
