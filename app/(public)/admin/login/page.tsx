import type { Metadata } from "next";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AdminGateForm } from "@/components/v21/admin-gate-form";
import { safeAdminNextPath } from "@/lib/auth/admin-gate-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administrace" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  const next = safeAdminNextPath(query.next);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <MedScopeLogo href="/" preset="admin-login" />
      <h1 className="font-display text-2xl font-semibold text-[#021d33]">Administrace</h1>
      <p className="mt-2 text-sm text-slate-600">
        Přístup jen po zadání hesla. Bez hesla se administrace neotevře.
      </p>
      <AdminGateForm next={next} />
    </div>
  );
}
