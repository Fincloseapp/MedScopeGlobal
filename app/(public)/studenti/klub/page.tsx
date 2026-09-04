import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StudentClubBoard } from "@/components/studenti/student-club-board";
import { StudentSectionNav } from "@/components/studenti/student-section-nav";
import { getReaderContext } from "@/lib/auth/reader-context";
import { studentClubOpenFromProfile } from "@/lib/billing/student-entitlement";
import { V22_STUDY_GAMES } from "@/lib/v22/games";
import { STUDENT_CLUB_PRICE_CZK } from "@/lib/studenti/club";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { facultiesForLocale, facultyCountryLabel } from "@/lib/prijimacky/faculties-by-country";
import { getServerLocale } from "@/lib/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Klub studentů — kvízy a žebříček",
    description:
      "Soutěžní kvízy z banky přijímaček, žebříček přezdívek a materiály 8 českých LF. 1 test zdarma, první měsíc 89 Kč, pak 149 Kč.",
    path: "/studenti/klub",
  });
}

export default async function StudentClubPage() {
  const locale = await getServerLocale();
  const { isVip, accessLevel, user, profile } = await getReaderContext();
  const clubOpen = studentClubOpenFromProfile({
    isVip,
    accessLevel: profile?.access_level ?? accessLevel,
  });
  const faculties = facultiesForLocale(locale);

  return (
    <div className="bg-[#f3eee6] text-[#1b1712]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
          Desk · Klub B/C/F
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Kvíz z banky přijímaček
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c564c]">
          Osm otázek, na tabuli jen přezdívka. 1 test zdarma, první měsíc 89 Kč, další{" "}
          {STUDENT_CLUB_PRICE_CZK} Kč — zrušíte kdykoli.
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

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="border-t border-[#1b1712]/15 pt-6">
            <h2 className="font-display text-2xl font-semibold">Odbornost</h2>
            <p className="mt-1 text-sm text-[#5c564c]">Anatomie, fyziologie, přijímačky — existující materiály.</p>
            <ul className="mt-4 space-y-2">
              {V22_STUDY_GAMES.slice(0, 6).map((game) => (
                <li key={game.slug}>
                  <Link href={`/medicina/hry/${game.slug}`} className="text-sm font-medium hover:text-[#8a6d32]">
                    {game.title}
                  </Link>
                  <span className="block text-xs text-[#8a8377]">{game.topic}</span>
                </li>
              ))}
            </ul>
            <Link href="/studenti/hry" className="mt-4 inline-block text-sm font-semibold text-[#8a6d32]">
              Všechny studijní hry →
            </Link>
          </div>
          <div className="border-t border-[#1b1712]/15 pt-6">
            <h2 className="font-display text-2xl font-semibold">{facultyCountryLabel(locale)}</h2>
            <p className="mt-1 text-sm text-[#5c564c]">Oficiální weby — termíny jen z nich.</p>
            <ul className="mt-4 divide-y divide-[#1b1712]/10">
              {faculties.slice(0, 8).map((f) => (
                <li key={f.slug}>
                  <a
                    href={f.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-3 py-2 text-sm no-underline hover:text-[#8a6d32]"
                  >
                    <span className="font-medium">{f.shortName}</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-[#8a6d32]">
                      Web
                      <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
