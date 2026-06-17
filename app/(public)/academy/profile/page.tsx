import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard, getUserProgress } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export default async function AcademyProfilePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <>
        <AcademyPageHeader
          eyebrow="Profil"
          title="Váš Academy profil"
          description="Přihlaste se pro sledování postupu, XP a certifikátů."
          ctaHref="/login"
          ctaLabel="Přihlásit se"
        />
      </>
    );
  }

  const [progress, leaderboard] = await Promise.all([
    getUserProgress(auth.user.id),
    getLeaderboard("all_time", 100),
  ]);

  const myRank = leaderboard.find((e) => e.user_id === auth.user!.id);

  return (
    <>
      <AcademyPageHeader eyebrow="Profil" title="Váš Academy profil" description={`Uživatel: ${auth.user.email}`} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Celkové XP</p>
            <p className="mt-1 text-3xl font-bold text-[#021d33]">{myRank?.total_xp ?? 0}</p>
            <Link href="/academy/leaderboard" className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
              Žebříček →
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Aktivní kurzy</p>
            <p className="mt-1 text-3xl font-bold text-[#021d33]">{progress.length}</p>
          </div>
        </div>
      </div>
    </>
  );
}
