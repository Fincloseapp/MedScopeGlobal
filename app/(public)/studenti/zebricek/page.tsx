import type { Metadata } from "next";
import { StudentLink as Link } from "@/components/studenti/student-link";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { StudentClubStandings } from "@/components/studenti/student-club-standings";
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
    <StudentAtelierShell
      current="/studenti/zebricek"
      kicker="Ateliér · Žebříček"
      title="Kdo je teď nejlepší"
      lead="Po přihlášení e-mailem hrajete pod přezdívkou. Na tabuli je jen nick — ne e-mail. Žádná falešná jména, žádné vymyšlené pořadí."
      actions={
        <>
          <Link href={STUDENT_CLUB_HREF} className={atelierPrimaryLink()}>
            Hrát další kolo
          </Link>
          <Link href={STUDENT_CLUB_PLAN_HREF} className={atelierGhostLink()}>
            Student tarif {STUDENT_CLUB_PRICE_CZK} Kč/měsíc
          </Link>
        </>
      }
    >
      <StudentClubStandings />
      <p className="mt-6 text-sm text-[#5c564c]">
        1 test zdarma. Další pokračování v klubu za 89 Kč, pak {STUDENT_CLUB_PRICE_CZK} Kč — zrušíte
        kdykoli, bez skrytých poplatků. Pro uchazeče od 18 let.
      </p>
    </StudentAtelierShell>
  );
}
