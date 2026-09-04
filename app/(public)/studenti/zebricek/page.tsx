import type { Metadata } from "next";
import Link from "next/link";
import { StudentClubStandings } from "@/components/studenti/student-club-standings";
import { StudentSectionNav } from "@/components/studenti/student-section-nav";
import {
  STUDENT_CLUB_HREF,
  STUDENT_CLUB_PLAN_HREF,
  STUDENT_CLUB_PRICE_CZK,
} from "@/lib/studenti/club";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Žebříček kvízů — Klub studentů",
    description:
      "Přezdívky z kvízů přijímaček. E-mail zůstává u účtu — na žebříčku je jen nick. 1 test zdarma, pak 89 / 149 Kč.",
    path: "/studenti/zebricek",
  });
}

export default function StudentClubLeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        Studenti · Žebříček
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-[#021d33]">Kdo je teď nejlepší</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Po přihlášení e-mailem hrajete pod přezdívkou. Na tabuli je jen nick — ne e-mail. Žádná
        falešná jména, žádné vymyšlené pořadí.
      </p>
      <div className="mt-6">
        <StudentSectionNav current="/studenti/zebricek" />
      </div>
      <div className="mt-8">
        <StudentClubStandings />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        1 test zdarma. Další pokračování v klubu za 89 Kč, pak {STUDENT_CLUB_PRICE_CZK} Kč — zrušíte
        kdykoli, bez skrytých poplatků. Pro uchazeče od 18 let.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={STUDENT_CLUB_HREF}
          className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-semibold text-white"
        >
          Hrát další kolo
        </Link>
        <Link
          href={STUDENT_CLUB_PLAN_HREF}
          className="rounded-full border border-[#005B96]/30 px-5 py-2 text-sm font-semibold text-[#005B96]"
        >
          Členství {STUDENT_CLUB_PRICE_CZK} Kč/měsíc
        </Link>
      </div>
    </div>
  );
}
