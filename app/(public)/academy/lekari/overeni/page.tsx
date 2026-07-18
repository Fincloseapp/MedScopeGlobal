import Link from "next/link";
import { PhysicianVerificationForm } from "@/components/academy/b2b/physician-verification-form";
import {
  getPhysicianProfile,
  isVerifiedPhysician,
} from "@/lib/academy/b2b/verification";
import { createClient } from "@/lib/supabase/server";
import { MEDICAL_SPECIALIZATIONS } from "@/types/academy-b2b";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ověření lékaře — MedScope Academy",
};

export default async function PhysicianVerificationPage() {
  const supabase = await createClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!auth.user) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-serif text-3xl text-[#021d33]">Přihlášení vyžadováno</h1>
        <p className="mt-3 text-sm text-slate-600">
          Pro ověření ČLK se nejdříve přihlaste.
        </p>
        <Link
          href="/login?next=/academy/lekari/overeni"
          className="mt-6 inline-block bg-[#005B96] px-4 py-2 text-sm text-white"
        >
          Přihlásit se
        </Link>
      </main>
    );
  }

  const profile = await getPhysicianProfile(auth.user.id);
  if (isVerifiedPhysician(profile)) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-serif text-3xl text-[#021d33]">Účet je ověřen</h1>
        <p className="mt-3 text-sm text-slate-600">
          ČLK {profile?.clk_id} — můžete vstoupit do Lékařské zóny.
        </p>
        <Link
          href="/academy/lekari"
          className="mt-6 inline-block bg-[#005B96] px-4 py-2 text-sm text-white"
        >
          Otevřít Lékařskou zónu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="text-xs uppercase tracking-[0.16em] text-[#005B96]">
        Lékařská zóna
      </p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#021d33]">
        Ověření lékaře
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Ověření ČLK otevře Lékařskou zónu. Akreditované CME testy jsou zatím v
        nabídce pro <strong>revmatologii</strong>; při ověření vyberte svůj obor.
      </p>

      <div className="mt-8">
        <PhysicianVerificationForm
          specializations={MEDICAL_SPECIALIZATIONS.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          initial={{
            first_name: profile?.first_name ?? "",
            last_name: profile?.last_name ?? "",
            clk_id: profile?.clk_id ?? "",
            specialization: profile?.specialization ?? "",
          }}
        />
      </div>
    </main>
  );
}
