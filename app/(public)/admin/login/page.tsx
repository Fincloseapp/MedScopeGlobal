import type { Metadata } from "next";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AdminGateForm } from "@/components/v21/admin-gate-form";

export const metadata: Metadata = { title: "Administrace" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <MedScopeLogo href="/" preset="admin-login" />
      <h1 className="font-display text-2xl font-semibold text-[#021d33]">Administrace</h1>
      <p className="mt-2 text-sm text-slate-600">Přístup pouze pro oprávněné uživatele.</p>
      <AdminGateForm />
    </div>
  );
}
