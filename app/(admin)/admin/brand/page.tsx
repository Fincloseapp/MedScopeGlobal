import { BrandLogoUploadPanel } from "@/components/admin/brand-logo-upload";
import { MedScopeLogo } from "@/components/brand/medscope-logo";

export default function AdminBrandPage() {
  return (
    <div className="space-y-6">
      <MedScopeLogo href="/admin" width={160} height={40} className="mb-2" />
      <h1 className="font-display text-2xl font-bold text-[#021d33]">Brand & logo v23.2.0</h1>
      <p className="text-sm text-slate-600">
        Správa oficiálního loga MedScopeGlobal pro web, admin a newsletter.
      </p>
      <BrandLogoUploadPanel />
    </div>
  );
}
