import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AcademyAdminNav } from "@/components/academy/admin-nav";

export default function AcademyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <MedScopeLogo href="/admin" preset="admin-sidebar" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-[#021d33]">MedScope Academy Admin</h1>
            <p className="text-xs text-slate-500">v35.0 phase 2</p>
          </div>
          <Link
            href="/academy"
            className="rounded-full border border-[#cfe1f3] px-4 py-1.5 text-xs font-medium text-[#005B96] hover:bg-white"
          >
            Veřejný náhled →
          </Link>
        </div>
        <AcademyAdminNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
