import type { Metadata } from "next";
import Link from "next/link";
import { StudentClubBoard } from "@/components/studenti/student-club-board";
import { StudentSectionNav } from "@/components/studenti/student-section-nav";
import { FacultyDeadlinesBoard } from "@/components/prijimacky/faculty-deadlines-board";
import { getReaderContext } from "@/lib/auth/reader-context";
import { studentClubOpenFromProfile } from "@/lib/billing/student-entitlement";
import { V22_STUDY_GAMES } from "@/lib/v22/games";
import { STUDENT_CLUB_PRICE_CZK } from "@/lib/studenti/club";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Klub studentů — kvízy a žebříček",
    description:
      "Soutěžní kvízy z banky přijímaček, žebříček přezdívek a materiály 8 českých LF. 1 test zdarma, první měsíc 89 Kč, pak 149 Kč.",
    path: "/studenti/klub",
  });
}

export default async function StudentClubPage() {
  const { isVip, accessLevel, user, profile } = await getReaderContext();
  const clubOpen = studentClubOpenFromProfile({
    isVip,
    accessLevel: profile?.access_level ?? accessLevel,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        Studenti · Klub
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-[#021d33]">Klub kvízů a žebříčku</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Přehledně: soutěžní kvízy, odbornost, odkazy na fakulty. 1 test zdarma, první měsíc 89 Kč,
        další {STUDENT_CLUB_PRICE_CZK} Kč — zrušíte kdykoli, bez skrytých poplatků.
      </p>

      <div className="mt-6">
        <StudentSectionNav current="/studenti/klub" />
      </div>

      <div className="mt-8">
        <StudentClubBoard
          clubOpen={clubOpen}
          initialEmail={user?.email ?? ""}
          initialNick={profile?.full_name ?? ""}
          signedIn={Boolean(user?.id)}
        />
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Odbornost a hry</h2>
          <p className="mt-1 text-sm text-slate-600">Existující materiály — anatomie, fyziologie, přijímačky.</p>
          <ul className="mt-4 space-y-2">
            {V22_STUDY_GAMES.slice(0, 6).map((game) => (
              <li key={game.slug}>
                <Link href={`/medicina/hry/${game.slug}`} className="text-sm font-medium text-[#005B96] hover:underline">
                  {game.title}
                </Link>
                <span className="block text-xs text-slate-500">{game.topic}</span>
              </li>
            ))}
          </ul>
          <Link href="/studenti/hry" className="mt-4 inline-block text-sm font-semibold text-[#005B96] hover:underline">
            Všechny studijní hry →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Další materiály</h2>
          <p className="mt-1 text-sm text-slate-600">Knihovna, testy a léky — existující rozcestníky.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/studenti/materialy" className="font-medium text-[#005B96] hover:underline">
                Studijní materiály
              </Link>
            </li>
            <li>
              <Link href="/kvizy" className="font-medium text-[#005B96] hover:underline">
                Knihovna kvízů
              </Link>
            </li>
            <li>
              <Link href="/studium/univerzity" className="font-medium text-[#005B96] hover:underline">
                Lékařské fakulty
              </Link>
            </li>
            <li>
              <Link href="/studium/prijimacky" className="font-medium text-[#005B96] hover:underline">
                Termíny přijímaček
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-10">
        <FacultyDeadlinesBoard compact />
      </div>
    </div>
  );
}
