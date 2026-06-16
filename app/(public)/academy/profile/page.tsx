import { AcademyPageHeader } from "@/components/academy/page-header";
import Link from "next/link";

export default function AcademyProfilePage() {
  return (
    <>
      <AcademyPageHeader
        eyebrow="Profil"
        title="Váš Academy profil"
        description="XP, certifikáty a postup v kurzech."
      />
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-sm text-slate-600">
          Pro zobrazení profilu se přihlaste ke svému MedScope účtu.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-[#005B96] px-6 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
        >
          Přihlásit se
        </Link>
      </div>
    </>
  );
}
