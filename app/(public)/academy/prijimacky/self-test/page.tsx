import type { Metadata } from "next";
import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { SelfTestPlayer } from "@/components/prijimacky/self-test-player";
import { generateSelfTest } from "@/lib/prijimacky/quiz-from-bank";
import type { PrepSubject } from "@/lib/prijimacky/faculties-admissions";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ subject?: string; count?: string; difficulty?: string; seed?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Self-test přijímačky LF — MedScope Academy",
    description: "Automaticky generované self-testy z biologie, chemie a fyziky pro přípravu na LF.",
    path: "/academy/prijimacky/self-test",
  });
}

function parseSubjects(raw?: string): PrepSubject[] | undefined {
  if (!raw || raw === "mixed" || raw === "all") return ["biologie", "chemie", "fyzika"];
  if (raw === "biologie" || raw === "chemie" || raw === "fyzika") return [raw];
  return undefined;
}

export default async function PrijimackySelfTestPage({ searchParams }: Props) {
  const params = await searchParams;
  const subjects = parseSubjects(params.subject);
  const count = Math.min(30, Math.max(5, Number(params.count ?? 15) || 15));
  const difficulty =
    params.difficulty === "zaklad" || params.difficulty === "stredni" || params.difficulty === "narocne"
      ? params.difficulty
      : "all";
  const seed = params.seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const test = generateSelfTest({ subjects, count, difficulty, seed });

  return (
    <>
      <AcademyPageHeader
        eyebrow="Přijímačky LF"
        title="Self-test z banky otázek"
        description="Otázky se losují z databáze faktů B/C/F. Po odevzdání uvidíte skóre i vysvětlení."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          <Link href="/academy/prijimacky/self-test?subject=biologie&count=12" className="rounded-full bg-[#f0f7ff] px-3 py-1 text-[#005B96]">
            Biologie
          </Link>
          <Link href="/academy/prijimacky/self-test?subject=chemie&count=12" className="rounded-full bg-[#f0f7ff] px-3 py-1 text-[#005B96]">
            Chemie
          </Link>
          <Link href="/academy/prijimacky/self-test?subject=fyzika&count=12" className="rounded-full bg-[#f0f7ff] px-3 py-1 text-[#005B96]">
            Fyzika
          </Link>
          <Link href="/academy/prijimacky/self-test?subject=mixed&count=20" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
            Mixed 20
          </Link>
        </div>
        <SelfTestPlayer test={test} />
      </div>
    </>
  );
}
